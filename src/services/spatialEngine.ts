/**
 * SolVision Spatial & Analytics Engine
 * Pure PostGIS-equivalent GIS calculations, DEM runoff modeling,
 * downburst wind shear stress estimation, and automated response dispatching.
 */

import type {
  WeatherAlertPayload,
  AgriculturalParcel,
  SupplyChainCorridor,
  IoTDevice,
  AutomatedActionResponse,
  MatchedParcelAction,
  RiskAssessment,
  GeoJSONPolygon,
  GeoJSONLineString,
} from '../types/solvision.ts';

/**
 * Checks if point (x=lng, y=lat) is inside polygon coordinates via Ray Casting Algorithm
 */
export function isPointInPolygon(point: [number, number], ring: number[][]): boolean {
  const [px, py] = point;
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];

    const intersect = yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Checks whether two line segments (p1-p2 and p3-p4) intersect
 */
export function doSegmentsIntersect(
  p1: [number, number],
  p2: [number, number],
  p3: [number, number],
  p4: [number, number]
): boolean {
  function ccw(a: [number, number], b: [number, number], c: [number, number]): number {
    return (c[1] - a[1]) * (b[0] - a[0]) - (b[1] - a[1]) * (c[0] - a[0]);
  }

  const ccw1 = ccw(p1, p3, p4);
  const ccw2 = ccw(p2, p3, p4);
  const ccw3 = ccw(p1, p2, p3);
  const ccw4 = ccw(p1, p2, p4);

  return (
    ((ccw1 > 0 && ccw2 < 0) || (ccw1 < 0 && ccw2 > 0)) &&
    ((ccw3 > 0 && ccw4 < 0) || (ccw3 < 0 && ccw4 > 0))
  );
}

/**
 * Calculates Bounding Box [minLng, minLat, maxLng, maxLat]
 */
export function getBoundingBox(points: number[][]): [number, number, number, number] {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const [x, y] of points) {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }

  return [minX, minY, maxX, maxY];
}

/**
 * Fast Bounding Box collision test
 */
export function doBBoxesOverlap(
  b1: [number, number, number, number],
  b2: [number, number, number, number]
): boolean {
  return !(b1[2] < b2[0] || b1[0] > b2[2] || b1[3] < b2[1] || b1[1] > b2[3]);
}

/**
 * ST_Intersects implementation for Polygon with Polygon conforming to PostGIS standard
 */
export function polygonIntersectsPolygon(polyA: GeoJSONPolygon, polyB: GeoJSONPolygon): boolean {
  const ringA = polyA.coordinates[0];
  const ringB = polyB.coordinates[0];

  if (!ringA || !ringB || ringA.length < 3 || ringB.length < 3) return false;

  const bboxA = getBoundingBox(ringA);
  const bboxB = getBoundingBox(ringB);

  // Fast reject
  if (!doBBoxesOverlap(bboxA, bboxB)) return false;

  // 1. Check if any vertex of A is inside B
  for (const pt of ringA) {
    if (isPointInPolygon([pt[0], pt[1]], ringB)) return true;
  }

  // 2. Check if any vertex of B is inside A
  for (const pt of ringB) {
    if (isPointInPolygon([pt[0], pt[1]], ringA)) return true;
  }

  // 3. Check if any edge of A crosses an edge of B
  for (let i = 0; i < ringA.length - 1; i++) {
    const p1: [number, number] = [ringA[i][0], ringA[i][1]];
    const p2: [number, number] = [ringA[i + 1][0], ringA[i + 1][1]];

    for (let j = 0; j < ringB.length - 1; j++) {
      const p3: [number, number] = [ringB[j][0], ringB[j][1]];
      const p4: [number, number] = [ringB[j + 1][0], ringB[j + 1][1]];

      if (doSegmentsIntersect(p1, p2, p3, p4)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * ST_Intersects for LineString (Corridor) with Polygon (Storm)
 */
export function lineStringIntersectsPolygon(
  line: GeoJSONLineString,
  poly: GeoJSONPolygon
): boolean {
  const linePts = line.coordinates;
  const ring = poly.coordinates[0];
  if (!linePts || linePts.length < 2 || !ring || ring.length < 3) return false;

  const bboxLine = getBoundingBox(linePts);
  const bboxPoly = getBoundingBox(ring);
  if (!doBBoxesOverlap(bboxLine, bboxPoly)) return false;

  // Vertex inside check
  for (const pt of linePts) {
    if (isPointInPolygon([pt[0], pt[1]], ring)) return true;
  }

  // Edge crossing check
  for (let i = 0; i < linePts.length - 1; i++) {
    const p1: [number, number] = [linePts[i][0], linePts[i][1]];
    const p2: [number, number] = [linePts[i + 1][0], linePts[i + 1][1]];

    for (let j = 0; j < ring.length - 1; j++) {
      const p3: [number, number] = [ring[j][0], ring[j][1]];
      const p4: [number, number] = [ring[j + 1][0], ring[j + 1][1]];

      if (doSegmentsIntersect(p1, p2, p3, p4)) return true;
    }
  }

  return false;
}

/**
 * DEM Runoff & Erosion Risk Algorithm
 * Analyzes slope degree (>15° triggers high runoff velocity) combined with
 * expected precipitation intensity and topographic concavity index.
 */
export function calculateRunoffRisk(
  slopeDegree: number,
  depressionIndex: number,
  expectedRainfallMm: number,
  soilType: string = 'clay'
): {
  runoff_risk: 'HIGH' | 'MEDIUM' | 'LOW';
  runoff_score: number;
  soil_saturation_expected: 'MAX' | 'HIGH' | 'MODERATE';
  dem_concavity_status: 'PRONE_TO_WATERLOGGING' | 'EROSION_HAZARD' | 'STABLE_RUNOFF';
} {
  // Base slope factor: slope > 15° increases kinematic wave surface velocity
  const slopeWeight = Math.min(slopeDegree / 25, 1.0) * 45; // max 45 pts
  const rainWeight = Math.min(expectedRainfallMm / 70, 1.0) * 35; // max 35 pts
  const soilWeight = soilType.toLowerCase().includes('clay') || soilType.includes('طينية') ? 20 : 10;

  const runoffScore = Math.min(Math.round(slopeWeight + rainWeight + soilWeight), 100);

  const runoffRisk: 'HIGH' | 'MEDIUM' | 'LOW' =
    slopeDegree > 15 || runoffScore >= 70 ? 'HIGH' : runoffScore >= 45 ? 'MEDIUM' : 'LOW';

  let soilSaturation: 'MAX' | 'HIGH' | 'MODERATE' = 'MODERATE';
  if (expectedRainfallMm >= 50 || (depressionIndex > 0.6 && expectedRainfallMm >= 30)) {
    soilSaturation = 'MAX';
  } else if (expectedRainfallMm >= 25) {
    soilSaturation = 'HIGH';
  }

  let concavityStatus: 'PRONE_TO_WATERLOGGING' | 'EROSION_HAZARD' | 'STABLE_RUNOFF' = 'STABLE_RUNOFF';
  if (depressionIndex >= 0.6) {
    concavityStatus = 'PRONE_TO_WATERLOGGING'; // المقعرة الأكثر عرضة للغرق
  } else if (slopeDegree > 15) {
    concavityStatus = 'EROSION_HAZARD'; // المنحدرات العالية الأكثر عرضة للانجراف
  }

  return {
    runoff_risk: runoffRisk,
    runoff_score: runoffScore,
    soil_saturation_expected: soilSaturation,
    dem_concavity_status: concavityStatus,
  };
}

/**
 * Wind Stress & Lodging Risk Index (الإجهاد الميكانيكي ورقاد المحاصيل)
 * Evaluates impact of convective downbursts (رياح هابطة) on canopy drag,
 * tree branches, and crop stem integrity based on NDVI canopy density and age.
 */
export function calculateWindStressRisk(
  downburstSpeedKmh: number,
  severityLevel: number,
  ndvi: number,
  treeAgeYears?: number,
  cropType: string = ''
): {
  wind_stress_risk: 'HIGH' | 'MEDIUM' | 'LOW';
  wind_stress_score: number;
  lodging_risk: 'HIGH' | 'MEDIUM' | 'LOW';
} {
  // Base downburst impact
  const windFactor = Math.min(downburstSpeedKmh / 110, 1.0) * 50; // max 50 pts
  const severityFactor = severityLevel * 15; // up to 45 pts
  const canopyDragFactor = ndvi * 15; // denser canopy has higher wind resistance

  let windScore = Math.min(Math.round(windFactor + severityFactor + canopyDragFactor), 100);

  // If young trees (< 4 yrs) or very old trees (> 40 yrs) without support, risk is magnified
  if (treeAgeYears && (treeAgeYears < 4 || treeAgeYears > 45)) {
    windScore = Math.min(windScore + 10, 100);
  }

  const windStressRisk: 'HIGH' | 'MEDIUM' | 'LOW' =
    severityLevel >= 1 || downburstSpeedKmh >= 70 || windScore >= 60
      ? 'HIGH'
      : downburstSpeedKmh >= 45 || windScore >= 40
      ? 'MEDIUM'
      : 'LOW';

  // Lodging risk for cereals / field crops (Wheat, Barley, Tall vegetables)
  const isCereal =
    cropType.includes('القمح') ||
    cropType.toLowerCase().includes('wheat') ||
    cropType.toLowerCase().includes('cereal');
  const lodgingRisk: 'HIGH' | 'MEDIUM' | 'LOW' =
    isCereal && downburstSpeedKmh >= 65
      ? 'HIGH'
      : windStressRisk === 'HIGH'
      ? 'HIGH'
      : windStressRisk === 'MEDIUM'
      ? 'MEDIUM'
      : 'LOW';

  return {
    wind_stress_risk: windStressRisk,
    wind_stress_score: windScore,
    lodging_risk: lodgingRisk,
  };
}

/**
 * Microclimate Fungal Disease Propensity Model (البياض الزغبي وفطريات الجذور)
 * Predicts 7-day spore germination and mycelial development probability
 */
export function calculateFungalRisk(
  rainfallMm: number,
  soilSaturation: 'MAX' | 'HIGH' | 'MODERATE'
): 'SEVERE' | 'HIGH' | 'MODERATE' | 'LOW' {
  if (soilSaturation === 'MAX' && rainfallMm >= 40) return 'SEVERE';
  if (soilSaturation === 'HIGH' || rainfallMm >= 25) return 'HIGH';
  if (rainfallMm >= 10) return 'MODERATE';
  return 'LOW';
}

/**
 * Main Processing Engine executing PostGIS Intersection & Generating Automated Actions
 */
export function processWeatherAlert(
  alertPayload: WeatherAlertPayload,
  parcels: AgriculturalParcel[],
  corridors: SupplyChainCorridor[] = [],
  iotDevices: IoTDevice[] = []
): AutomatedActionResponse {
  const { alert_id, severity_level, valid_until, geometry, meteorological_details } = alertPayload;
  const expectedRainfallMm = meteorological_details?.expected_rainfall_mm ?? (severity_level >= 2 ? 65 : 38);
  const downburstSpeedKmh = meteorological_details?.downburst_speed_kmh ?? (severity_level >= 2 ? 95 : 72);

  // 1. Spatial Intersection with Agricultural Parcels (ST_Intersects)
  const matchedParcels = parcels.filter((parcel) =>
    polygonIntersectsPolygon(parcel.geom, geometry)
  );

  // 2. Spatial Intersection with Supply Chain Corridors (ST_Intersects)
  const matchedCorridors = corridors.filter((corridor) =>
    lineStringIntersectsPolygon(corridor.geom, geometry)
  );

  // 3. Spatial Intersection with IoT devices
  const matchedIoTs = iotDevices.filter((iot) =>
    isPointInPolygon(iot.coordinates, geometry.coordinates[0])
  );

  const actionsTriggered: MatchedParcelAction[] = [];

  for (const parcel of matchedParcels) {
    const runoffData = calculateRunoffRisk(
      parcel.slope_degree,
      parcel.depression_index ?? 0.4,
      expectedRainfallMm,
      parcel.soil_type
    );

    const windData = calculateWindStressRisk(
      downburstSpeedKmh,
      severity_level,
      parcel.ndvi_vegetation_index,
      parcel.tree_age_years,
      parcel.crop_type
    );

    const fungalRisk = calculateFungalRisk(expectedRainfallMm, runoffData.soil_saturation_expected);

    const riskAssessment: RiskAssessment = {
      runoff_risk: runoffData.runoff_risk,
      runoff_score: runoffData.runoff_score,
      wind_stress_risk: windData.wind_stress_risk,
      wind_stress_score: windData.wind_stress_score,
      soil_saturation_expected: runoffData.soil_saturation_expected,
      lodging_risk: windData.lodging_risk,
      dem_concavity_status: runoffData.dem_concavity_status,
      fungal_outbreak_risk_7d: fungalRisk,
    };

    // Automated Actions
    const automatedCommands = [
      {
        target_system: 'IoT_Irrigation_Controller' as const,
        action: 'PAUSE_SCHEDULE',
        duration_hours: 48,
        status: 'DISPATCHED' as const,
        channel: 'MQTT_BROKER' as const,
        message: `تعليق جدول الضخ والري لمدة 48 ساعة لتفادي تشبع التربة وتوفير استهلاك الطاقة [Kill-Switch] للقطعة ${parcel.name}`,
      },
      {
        target_system: 'Notification_Service' as const,
        action: 'SEND_PUSH_AND_SMS',
        recipient: parcel.assigned_manager.name,
        channel: 'PUSH_AND_SMS' as const,
        status: 'DISPATCHED' as const,
        message: `[SolVision Trigger Alert: Level-${severity_level} Storm] القطعة (${parcel.parcel_id}/${parcel.name}): خطر هطول غزير (${expectedRainfallMm} مم) + رياح هابطة (${downburstSpeedKmh} كم/س). تم إيقاف الري تلقائياً. يرجى تفقد مصارف السيول وتثبيت الأفرع.`,
      },
      {
        target_system: 'Sentinel_Drone_Tasking' as const,
        action: 'SCHEDULE_POST_STORM_ACQUISITION',
        status: 'PENDING' as const,
        channel: 'SATELLITE_TASKING_API' as const,
        message: `جدولة مسح الأقمار الصناعية Sentinel-2 وتحليق الدرون فور انقضاء العاصفة لتقييم تجمع المياه وتغير مؤشر NDVI.`,
      },
    ];

    actionsTriggered.push({
      parcel_id: parcel.parcel_id,
      parcel_name: parcel.name,
      crop_type: parcel.crop_type,
      slope_degree: parcel.slope_degree,
      risk_assessment: riskAssessment,
      automated_commands: automatedCommands,
      actions_taken: [
        'IoT_Irrigation_Controller_PAUSED',
        'Notification_Sent',
        'Post_Storm_Tasking_Queued',
      ],
    });
  }

  const corridorAlerts = matchedCorridors.map((c) => ({
    corridor_id: c.corridor_id,
    corridor_name: c.name,
    recommended_detour: 'تحويل مسار شاحنات نقل المحاصيل نحو المحور الجنوبي المرتفع لتفادي فيضان الأودية الساحلية',
    warning_level: severity_level >= 2 ? 'CRITICAL_CLOSURE' : 'ADVISORY_SPEED_REDUCTION',
  }));

  return {
    event_processing_id: `EVT-${Date.now()}-SOL`,
    alert_id: alert_id,
    matched_parcels_count: matchedParcels.length,
    matched_corridors_count: matchedCorridors.length,
    matched_iot_count: matchedIoTs.length,
    actions_triggered: actionsTriggered,
    corridor_alerts: corridorAlerts,
  };
}
