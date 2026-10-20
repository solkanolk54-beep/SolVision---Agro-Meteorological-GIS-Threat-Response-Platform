import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  Layers,
  Eye,
  Activity,
  Radio,
  Truck,
  MapPin,
  RefreshCw,
  Compass,
  Zap,
} from 'lucide-react';
import {
  WeatherAlertPayload,
  AgriculturalParcel,
  SupplyChainCorridor,
  IoTDevice,
  MatchedParcelAction,
} from '../types/solvision.ts';
import { isPointInPolygon, polygonIntersectsPolygon, lineStringIntersectsPolygon } from '../services/spatialEngine.ts';

interface GisMapProps {
  alert: WeatherAlertPayload;
  parcels: AgriculturalParcel[];
  corridors: SupplyChainCorridor[];
  iotDevices: IoTDevice[];
  selectedParcelId: string | null;
  onSelectParcel: (parcelId: string) => void;
  onToggleIoTKillSwitch: (deviceId: string) => void;
  lang: 'ar' | 'en';
}

export const GisMap: React.FC<GisMapProps> = ({
  alert,
  parcels,
  corridors,
  iotDevices,
  selectedParcelId,
  onSelectParcel,
  onToggleIoTKillSwitch,
  lang,
}) => {
  const isAr = lang === 'ar';
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Layer groups refs to easily add/clear
  const threatLayerRef = useRef<L.LayerGroup | null>(null);
  const parcelsLayerRef = useRef<L.LayerGroup | null>(null);
  const corridorsLayerRef = useRef<L.LayerGroup | null>(null);
  const iotLayerRef = useRef<L.LayerGroup | null>(null);

  // Layer visibility toggles
  const [showThreat, setShowThreat] = useState(true);
  const [showParcels, setShowParcels] = useState(true);
  const [showCorridors, setShowCorridors] = useState(true);
  const [showIoT, setShowIoT] = useState(true);
  const [mapType, setMapType] = useState<'satellite' | 'terrain' | 'dark'>('satellite');
  const [isSimulatingRadar, setIsSimulatingRadar] = useState(true);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Centered around Mila agricultural basin [lat: 36.38, lng: 6.35]
    const map = L.map(mapContainerRef.current, {
      center: [36.38, 6.35],
      zoom: 11,
      zoomControl: true,
      attributionControl: false,
    });

    threatLayerRef.current = L.layerGroup().addTo(map);
    parcelsLayerRef.current = L.layerGroup().addTo(map);
    corridorsLayerRef.current = L.layerGroup().addTo(map);
    iotLayerRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Base Tile Layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove existing tile layer
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    let tileUrl = '';
    let attribution = '';

    if (mapType === 'satellite') {
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      attribution = 'Esri World Imagery';
    } else if (mapType === 'terrain') {
      tileUrl = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
      attribution = 'OpenTopoMap DEM';
    } else {
      tileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
      attribution = 'CartoDB Dark Matter';
    }

    const tileLayer = L.tileLayer(tileUrl, {
      maxZoom: 18,
      attribution,
    });
    tileLayer.addTo(map);
  }, [mapType]);

  // Update Vector Layers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // 1. Draw Threat Polygon Layer
    if (threatLayerRef.current) {
      threatLayerRef.current.clearLayers();
      if (showThreat && alert?.geometry?.coordinates?.[0]) {
        // Convert [lng, lat] to Leaflet [lat, lng]
        const latLngs = alert.geometry.coordinates[0].map(([lng, lat]) => [lat, lng] as [number, number]);

        const threatColor = alert.severity_level >= 2 ? '#ef4444' : '#f59e0b';
        const threatBorderColor = alert.severity_level >= 2 ? '#b91c1c' : '#d97706';

        const polygon = L.polygon(latLngs, {
          color: threatBorderColor,
          weight: 3,
          dashArray: '8, 6',
          fillColor: threatColor,
          fillOpacity: 0.32,
        });

        const popupContent = `
          <div style="font-family: inherit; direction: ${isAr ? 'rtl' : 'ltr'}; padding: 4px;">
            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
              <span style="background: ${threatColor}; color: #000; font-weight: bold; font-size: 11px; padding: 2px 6px; border-radius: 4px;">
                ${alert.severity_level === 1 ? 'ESTOFEX Level-1' : alert.severity_level >= 2 ? 'ESTOFEX Level-2 Severe' : 'ESTOFEX Watch'}
              </span>
              <strong style="color: #f8fafc; font-size: 13px;">${alert.alert_id}</strong>
            </div>
            <p style="margin: 4px 0; font-size: 11px; color: #cbd5e1;">
              <strong>${isAr ? 'نوع التهديد:' : 'Hazard:'}</strong> ${alert.hazard_type}
            </p>
            <p style="margin: 4px 0; font-size: 11px; color: #cbd5e1;">
              <strong>${isAr ? 'الأمطار المتوقعة:' : 'Rainfall:'}</strong> ${alert.meteorological_details?.expected_rainfall_mm ?? 40} mm
            </p>
            <p style="margin: 4px 0; font-size: 11px; color: #cbd5e1;">
              <strong>${isAr ? 'رياح هابطة (Downburst):' : 'Downburst:'}</strong> ${alert.meteorological_details?.downburst_speed_kmh ?? 75} km/h
            </p>
            <div style="margin-top: 6px; font-size: 10px; color: #94a3b8; font-family: monospace;">
              ${isAr ? 'المصدر:' : 'Source:'} ${alert.source}
            </div>
          </div>
        `;
        polygon.bindPopup(popupContent);
        threatLayerRef.current.addLayer(polygon);
      }
    }

    // 2. Draw Agricultural Parcels Layer
    if (parcelsLayerRef.current) {
      parcelsLayerRef.current.clearLayers();
      if (showParcels) {
        parcels.forEach((parcel) => {
          const isIntersected = polygonIntersectsPolygon(parcel.geom, alert.geometry);
          const isSelected = selectedParcelId === parcel.parcel_id;
          const latLngs = parcel.geom.coordinates[0].map(([lng, lat]) => [lat, lng] as [number, number]);

          let strokeColor = '#10b981'; // Green (Safe)
          let fillColor = '#10b981';

          if (isIntersected) {
            strokeColor = parcel.slope_degree > 15 ? '#ef4444' : '#f59e0b'; // Red for steep slope high runoff, Amber for moderate
            fillColor = parcel.slope_degree > 15 ? '#ef4444' : '#f59e0b';
          }

          if (isSelected) {
            strokeColor = '#38bdf8'; // Cyan border for selected
          }

          const parcelPolygon = L.polygon(latLngs, {
            color: strokeColor,
            weight: isSelected ? 4 : 2,
            fillColor: fillColor,
            fillOpacity: isIntersected ? 0.45 : 0.22,
          });

          const popupContent = `
            <div style="font-family: inherit; direction: ${isAr ? 'rtl' : 'ltr'}; min-width: 200px;">
              <h4 style="margin: 0 0 4px 0; font-size: 13px; font-weight: bold; color: #f8fafc;">
                ${isAr ? parcel.name : parcel.name_en}
              </h4>
              <div style="font-size: 10px; font-family: monospace; color: #38bdf8; margin-bottom: 6px;">
                ${parcel.parcel_id} | ${parcel.wilaya}
              </div>
              <div style="font-size: 11px; color: #e2e8f0; line-height: 1.4;">
                <div><strong>${isAr ? 'المحصول:' : 'Crop:'}</strong> ${isAr ? parcel.crop_type : parcel.crop_type_en}</div>
                <div><strong>${isAr ? 'المساحة:' : 'Area:'}</strong> ${parcel.area_hectares} ha</div>
                <div><strong>${isAr ? 'درجة الانحدار (DEM):' : 'Slope (DEM):'}</strong> ${parcel.slope_degree}° (${parcel.slope_degree > 15 ? (isAr ? 'خطر انجراف مرتفع' : 'High Runoff') : (isAr ? 'انحدار مستقر' : 'Stable')})</div>
                <div><strong>${isAr ? 'حالة الري الذكي:' : 'Smart Irrigation:'}</strong> 
                  <span style="font-weight: bold; color: ${parcel.current_irrigation_status === 'PAUSED' ? '#f59e0b' : '#10b981'};">
                    ${parcel.current_irrigation_status === 'PAUSED' ? (isAr ? 'مُعلّق تلقائياً [Kill-Switch]' : 'PAUSED [Kill-Switch]') : (isAr ? 'نشط' : 'ACTIVE')}
                  </span>
                </div>
                <div><strong>${isAr ? 'المشرف الميداني:' : 'Manager:'}</strong> ${parcel.assigned_manager.name} (${parcel.assigned_manager.phone})</div>
              </div>
            </div>
          `;

          parcelPolygon.bindPopup(popupContent);

          parcelPolygon.on('click', () => {
            onSelectParcel(parcel.parcel_id);
          });

          parcelsLayerRef.current?.addLayer(parcelPolygon);
        });
      }
    }

    // 3. Draw Supply Chain Corridors
    if (corridorsLayerRef.current) {
      corridorsLayerRef.current.clearLayers();
      if (showCorridors) {
        corridors.forEach((corridor) => {
          const isIntersected = lineStringIntersectsPolygon(corridor.geom, alert.geometry);
          const latLngs = corridor.geom.coordinates.map(([lng, lat]) => [lat, lng] as [number, number]);

          const polyline = L.polyline(latLngs, {
            color: isIntersected ? '#dc2626' : '#0284c7',
            weight: isIntersected ? 4 : 3,
            dashArray: isIntersected ? '6, 6' : undefined,
            opacity: 0.85,
          });

          polyline.bindPopup(`
            <div style="direction: ${isAr ? 'rtl' : 'ltr'}; font-family: inherit;">
              <h4 style="margin: 0 0 4px; font-size: 12px; font-weight: bold; color: #fff;">
                ${isAr ? corridor.name : corridor.name_en}
              </h4>
              <p style="font-size: 11px; color: #cbd5e1; margin: 2px 0;">
                <strong>${isAr ? 'الحمولة:' : 'Cargo:'}</strong> ${corridor.primary_cargo}
              </p>
              <div style="margin-top: 4px; font-size: 10px; font-weight: bold; color: ${isIntersected ? '#ef4444' : '#10b981'};">
                ${isIntersected ? (isAr ? '⚠️ تقاطع مع نطاق السيول - تحويل إلزامي للمسار' : '⚠️ Intersected by storm - Rerouting Recommended') : (isAr ? 'مسار سالك وآمن' : 'Clear Route')}
              </div>
            </div>
          `);

          corridorsLayerRef.current?.addLayer(polyline);
        });
      }
    }

    // 4. Draw IoT Sensor Nodes
    if (iotLayerRef.current) {
      iotLayerRef.current.clearLayers();
      if (showIoT) {
        iotDevices.forEach((device) => {
          const isPaused = device.status === 'PAUSED';
          const [lng, lat] = device.coordinates;

          // Custom pulsing HTML marker
          const iconHtml = `
            <div style="position: relative; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center;">
              <span style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background-color: ${isPaused ? '#f59e0b' : '#0ea5e9'}; opacity: 0.4; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
              <div style="width: 18px; height: 18px; border-radius: 50%; background-color: ${isPaused ? '#d97706' : '#0284c7'}; border: 2px solid #ffffff; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.4);">
                <span style="color: white; font-size: 9px; font-weight: bold;">${device.type === 'IRRIGATION_VALVE' ? 'V' : device.type === 'WATER_PUMP' ? 'P' : 'S'}</span>
              </div>
            </div>
          `;

          const customIcon = L.divIcon({
            html: iconHtml,
            className: 'iot-custom-marker',
            iconSize: [26, 26],
            iconAnchor: [13, 13],
          });

          const marker = L.marker([lat, lng], { icon: customIcon });

          marker.bindPopup(`
            <div style="direction: ${isAr ? 'rtl' : 'ltr'}; font-family: inherit; min-width: 180px;">
              <h4 style="margin: 0 0 2px; font-size: 12px; font-weight: bold; color: #fff;">${device.name}</h4>
              <div style="font-size: 10px; font-family: monospace; color: #38bdf8; margin-bottom: 4px;">${device.device_id}</div>
              <div style="font-size: 11px; color: #cbd5e1; line-height: 1.4;">
                <div><strong>${isAr ? 'القطعة:' : 'Parcel:'}</strong> ${device.parcel_name}</div>
                <div><strong>${isAr ? 'الحالة:' : 'Status:'}</strong> 
                  <span style="color: ${isPaused ? '#f59e0b' : '#10b981'}; font-weight: bold;">
                    ${isPaused ? (isAr ? 'مُعلّق [PAUSED]' : 'PAUSED') : (isAr ? 'نشط [ACTIVE]' : 'ACTIVE')}
                  </span>
                </div>
                <div><strong>${isAr ? 'رطوبة التربة:' : 'Soil Moisture:'}</strong> ${device.telemetry.soil_moisture_percent}%</div>
                <div><strong>${isAr ? 'حرارة التربة:' : 'Soil Temp:'}</strong> ${device.telemetry.soil_temp_c}°C</div>
                <div><strong>${isAr ? 'ضغط الصمام:' : 'Valve Pressure:'}</strong> ${device.telemetry.valve_pressure_bar} Bar</div>
              </div>
            </div>
          `);

          iotLayerRef.current?.addLayer(marker);
        });
      }
    }
  }, [alert, parcels, corridors, iotDevices, selectedParcelId, showThreat, showParcels, showCorridors, showIoT, isAr]);

  // Center on Mila basin
  const handleResetView = () => {
    mapInstanceRef.current?.setView([36.38, 6.35], 11);
  };

  return (
    <div className="relative w-full h-[580px] lg:h-[680px] rounded-2xl overflow-hidden border border-[#1e2e42] shadow-2xl bg-[#09111d]">
      {/* Map Leaflet Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Radar Sweep Simulation Overlay */}
      {isSimulatingRadar && (
        <div className="absolute top-4 left-4 z-10 pointer-events-none flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-emerald-500/30 text-xs">
          <div className="w-4 h-4 rounded-full border border-emerald-400 relative flex items-center justify-center overflow-hidden">
            <div className="w-full h-0.5 bg-gradient-to-r from-transparent to-emerald-400 radar-sweep-anim absolute"></div>
          </div>
          <span className="text-emerald-400 font-semibold">
            {isAr ? 'رادار دوبلر الميداني: مسح مكاني نشط' : 'Doppler Radar: Convective Scan Active'}
          </span>
        </div>
      )}

      {/* Map Layer Controls Floating Panel */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <div className="bg-[#0b1422]/90 backdrop-blur-md p-2 rounded-xl border border-[#1e3a5f] shadow-xl text-xs space-y-1.5 text-slate-200">
          <div className="font-bold text-[11px] text-slate-400 pb-1 border-b border-slate-700/60 flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              {isAr ? 'طبقات الخريطة GIS' : 'GIS Layers'}
            </span>
            <button
              onClick={handleResetView}
              className="p-1 hover:bg-slate-700/60 rounded text-slate-300 hover:text-white"
              title={isAr ? 'إعادة ضبط المنظور' : 'Reset View'}
            >
              <Compass className="w-3.5 h-3.5" />
            </button>
          </div>

          <label className="flex items-center gap-2 cursor-pointer hover:text-white">
            <input
              type="checkbox"
              checked={showThreat}
              onChange={(e) => setShowThreat(e.target.checked)}
              className="rounded accent-amber-500 cursor-pointer"
            />
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-500/80 border border-amber-300"></span>
              {isAr ? 'نطاق العاصفة (ESTOFEX)' : 'Storm Polygon (ESTOFEX)'}
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer hover:text-white">
            <input
              type="checkbox"
              checked={showParcels}
              onChange={(e) => setShowParcels(e.target.checked)}
              className="rounded accent-emerald-500 cursor-pointer"
            />
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/80 border border-emerald-300"></span>
              {isAr ? 'القطع الفلاحية المسجلة' : 'Registered Parcels'}
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer hover:text-white">
            <input
              type="checkbox"
              checked={showCorridors}
              onChange={(e) => setShowCorridors(e.target.checked)}
              className="rounded accent-sky-500 cursor-pointer"
            />
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-1 rounded bg-sky-500"></span>
              {isAr ? 'محاور سلاسل الإمداد' : 'Supply Corridors'}
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer hover:text-white">
            <input
              type="checkbox"
              checked={showIoT}
              onChange={(e) => setShowIoT(e.target.checked)}
              className="rounded accent-cyan-500 cursor-pointer"
            />
            <span className="flex items-center gap-1.5">
              <Radio className="w-3 h-3 text-cyan-400" />
              {isAr ? 'أجهزة وصمامات الري IoT' : 'IoT Controllers'}
            </span>
          </label>
        </div>

        {/* Base Map Selector */}
        <div className="bg-[#0b1422]/90 backdrop-blur-md p-1.5 rounded-xl border border-[#1e3a5f] shadow-xl flex gap-1 text-[11px] font-semibold text-slate-300">
          <button
            onClick={() => setMapType('satellite')}
            className={`px-2 py-1 rounded-lg transition-all ${
              mapType === 'satellite' ? 'bg-emerald-600 text-white font-bold' : 'hover:bg-slate-800'
            }`}
          >
            {isAr ? 'قمر صناعي' : 'Satellite'}
          </button>
          <button
            onClick={() => setMapType('terrain')}
            className={`px-2 py-1 rounded-lg transition-all ${
              mapType === 'terrain' ? 'bg-emerald-600 text-white font-bold' : 'hover:bg-slate-800'
            }`}
          >
            {isAr ? 'تضاريس DEM' : 'Terrain DEM'}
          </button>
          <button
            onClick={() => setMapType('dark')}
            className={`px-2 py-1 rounded-lg transition-all ${
              mapType === 'dark' ? 'bg-emerald-600 text-white font-bold' : 'hover:bg-slate-800'
            }`}
          >
            {isAr ? 'ليلي' : 'Dark'}
          </button>
        </div>
      </div>

      {/* Bottom GIS Map Legend & Quick HUD */}
      <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        <div className="pointer-events-auto bg-[#0b1422]/90 backdrop-blur-md px-3 py-2 rounded-xl border border-[#1e3a5f] shadow-lg flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-red-600/80 border border-red-400 animate-pulse"></span>
            <span className="text-slate-300 font-medium">
              {isAr ? 'تقاطع مباشر (خطر انجراف/رياح)' : 'Critical Intersection'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-amber-500/80 border border-amber-300"></span>
            <span className="text-slate-300 font-medium">
              {isAr ? 'تهديد متوسط' : 'Moderate Threat'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-emerald-500/80 border border-emerald-300"></span>
            <span className="text-slate-300 font-medium">
              {isAr ? 'خارج نطاق العاصفة' : 'Clear / Safe'}
            </span>
          </div>
        </div>

        <div className="pointer-events-auto bg-[#0b1422]/90 backdrop-blur-md px-3 py-2 rounded-xl border border-[#1e3a5f] shadow-lg text-xs font-mono text-slate-300 flex items-center gap-3">
          <span className="text-emerald-400 font-bold">EPSG:4326 (WGS84)</span>
          <span className="text-slate-500">|</span>
          <span>Lat: 36.38° N</span>
          <span>Lng: 6.35° E</span>
        </div>
      </div>
    </div>
  );
};
