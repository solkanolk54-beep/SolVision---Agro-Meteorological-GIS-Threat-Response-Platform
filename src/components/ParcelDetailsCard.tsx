import React from 'react';
import {
  MapPin,
  TrendingDown,
  Wind,
  Droplets,
  Power,
  User,
  Phone,
  Mail,
  ShieldAlert,
  CheckCircle,
  AlertTriangle,
  TreeDeciduous,
  Compass,
} from 'lucide-react';
import {
  AgriculturalParcel,
  MatchedParcelAction,
  IoTDevice,
} from '../types/solvision.ts';

interface ParcelDetailsCardProps {
  parcel: AgriculturalParcel;
  matchedAction?: MatchedParcelAction;
  iotDevice?: IoTDevice;
  onToggleKillSwitch?: (deviceId: string) => void;
  lang: 'ar' | 'en';
}

export const ParcelDetailsCard: React.FC<ParcelDetailsCardProps> = ({
  parcel,
  matchedAction,
  iotDevice,
  onToggleKillSwitch,
  lang,
}) => {
  const isAr = lang === 'ar';
  const isIntersected = !!matchedAction;
  const isPaused = iotDevice?.status === 'PAUSED' || parcel.current_irrigation_status === 'PAUSED';

  return (
    <div className="bg-[#0e1828] p-5 rounded-2xl border border-slate-700/80 shadow-xl space-y-4">
      {/* Title & Status Badge */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isIntersected ? 'bg-red-500 animate-ping' : 'bg-emerald-400'
              }`}
            />
            <h3 className="font-bold text-white text-base">
              {isAr ? parcel.name : parcel.name_en}
            </h3>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
            <span className="text-emerald-400 font-bold font-mono">{parcel.parcel_id}</span>
            <span>•</span>
            <span className="font-semibold">{parcel.wilaya}</span>
            <span>•</span>
            <span className="font-mono">{parcel.area_hectares} ha</span>
          </div>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
            isIntersected
              ? 'bg-red-950/80 text-red-300 border-red-500/50'
              : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
          }`}
        >
          {isIntersected
            ? isAr
              ? 'متقاطعة مع العاصفة'
              : 'STORM INTERSECTED'
            : isAr
            ? 'آمنة / خارج النطاق'
            : 'SAFE'}
        </span>
      </div>

      {/* Crop & DEM Topography Specs */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
          <span className="text-slate-400 text-[11px] block flex items-center gap-1">
            <TreeDeciduous className="w-3.5 h-3.5 text-emerald-400" />
            {isAr ? 'نوع المحصول:' : 'Crop Type:'}
          </span>
          <span className="font-bold text-white block">
            {isAr ? parcel.crop_type : parcel.crop_type_en}
          </span>
          {parcel.tree_age_years && (
            <span className="text-[10px] text-slate-400">
              {isAr ? `عمر الأشجار: ${parcel.tree_age_years} سنة` : `Age: ${parcel.tree_age_years} yrs`}
            </span>
          )}
        </div>

        <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
          <span className="text-slate-400 text-[11px] block flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5 text-blue-400" />
            {isAr ? 'انحدار DEM والارتفاع:' : 'Slope & Elevation:'}
          </span>
          <span className="font-bold text-white block font-mono">
            {parcel.slope_degree}° ({parcel.elevation_m}m)
          </span>
          <span
            className={`text-[10px] font-semibold ${
              parcel.slope_degree > 15 ? 'text-red-400' : 'text-emerald-400'
            }`}
          >
            {parcel.slope_degree > 15
              ? isAr
                ? 'انحدار شديد (خطر انجراف)'
                : 'Steep (High Runoff)'
              : isAr
              ? 'انحدار مستقر'
              : 'Gentle Slope'}
          </span>
        </div>
      </div>

      {/* Risk Metrics Assessment if Intersected */}
      {matchedAction ? (
        <div className="bg-slate-950 p-3.5 rounded-xl border border-red-500/30 space-y-2">
          <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            {isAr ? 'تقييم المخاطر المباشرة للمحرك:' : 'Engine Direct Threat Assessment:'}
          </span>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2 rounded bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block">{isAr ? 'خطر الانجراف:' : 'Runoff Risk:'}</span>
              <strong className="text-red-400 text-xs uppercase font-mono">
                {matchedAction.risk_assessment.runoff_risk}
              </strong>
            </div>

            <div className="p-2 rounded bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block">{isAr ? 'خطر الرياح الهابطة:' : 'Downburst Wind:'}</span>
              <strong className="text-amber-400 text-xs uppercase font-mono">
                {matchedAction.risk_assessment.wind_stress_risk}
              </strong>
            </div>
          </div>
        </div>
      ) : null}

      {/* Smart Irrigation Status & Kill Switch */}
      <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
        <div>
          <span className="text-[11px] text-slate-400 block">
            {isAr ? 'حالة الري الذكي (IoT Controller):' : 'Smart Irrigation Status:'}
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isPaused ? 'bg-amber-400' : 'bg-emerald-400'
              }`}
            />
            <span
              className={`text-xs font-black uppercase ${
                isPaused ? 'text-amber-400' : 'text-emerald-400'
              }`}
            >
              {isPaused
                ? isAr
                  ? 'مُعلّق تلقائياً [Kill-Switch]'
                  : 'PAUSED (Kill-Switch)'
                : isAr
                ? 'يعمل بانتظام'
                : 'ACTIVE'}
            </span>
          </div>
        </div>

        {iotDevice && onToggleKillSwitch && (
          <button
            onClick={() => onToggleKillSwitch(iotDevice.device_id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              isPaused
                ? 'bg-slate-800 text-emerald-400 hover:bg-slate-700 border border-slate-700'
                : 'bg-red-600 text-white hover:bg-red-500 shadow-md shadow-red-600/30'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>
              {isPaused
                ? isAr
                  ? 'استئناف'
                  : 'Resume'
                : isAr
                ? 'إيقاف طارئ'
                : 'Kill-Switch'}
            </span>
          </button>
        )}
      </div>

      {/* Assigned Farm Manager Contact */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <User className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-slate-200 font-semibold">{parcel.assigned_manager.name}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-400 font-mono">
          <Phone className="w-3 h-3 text-emerald-400" />
          <span>{parcel.assigned_manager.phone}</span>
        </div>
      </div>
    </div>
  );
};
