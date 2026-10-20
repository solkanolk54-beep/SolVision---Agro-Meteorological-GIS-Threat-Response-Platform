/**
 * SolVision Agro-Meteorological GIS & Threat Response Platform
 * Data Models & Schemas conforming to PostGIS and ESTOFEX / NWS Payloads
 */

export type AlertSeverityLevel = 0 | 1 | 2 | 3; // 0: Thunderstorm, 1: Level-1, 2: Level-2, 3: Level-3 Extreme

export type HazardType =
  | 'THUNDERSTORM_HEAVY_RAIN_DOWNBURST'
  | 'SUPERCELL_HAIL_SQUALL'
  | 'EXTREME_CONVECTIVE_GALE'
  | 'FLASH_FLOOD_TORRENTIAL_RAIN';

export interface GeoJSONPolygon {
  type: 'Polygon';
  coordinates: number[][][]; // [ [ [lng, lat], ... ] ]
}

export interface GeoJSONLineString {
  type: 'LineString';
  coordinates: number[][]; // [ [lng, lat], ... ]
}

export interface GeoJSONPoint {
  type: 'Point';
  coordinates: [number, number]; // [lng, lat]
}

export interface WeatherAlertPayload {
  alert_id: string;
  source: string;
  severity_level: AlertSeverityLevel;
  hazard_type: HazardType;
  issued_at: string;
  valid_until: string;
  geometry: GeoJSONPolygon;
  meteorological_details?: {
    expected_rainfall_mm: number;
    downburst_speed_kmh: number;
    hail_probability_percent: number;
    convective_cape_j_kg?: number;
    lightning_flash_rate?: string;
  };
}

export interface AgriculturalParcel {
  parcel_id: string;
  owner_id: string;
  name: string;
  name_en: string;
  wilaya: string; // e.g. Mila / ميلة, Constantine / قسنطينة
  crop_type: string;
  crop_type_en: string;
  tree_age_years?: number;
  ndvi_vegetation_index: number; // 0.0 - 1.0
  row_orientation_degrees: number; // 0 - 360
  slope_degree: number; // DEM slope degree (e.g. 18.5° = steep, >15° high runoff)
  soil_type: string;
  elevation_m: number;
  depression_index: number; // 0 - 1 concavity / topographic wetness
  geom: GeoJSONPolygon;
  area_hectares: number;
  current_irrigation_status: 'ACTIVE' | 'IDLE' | 'PAUSED' | 'EMERGENCY_STOP';
  iot_controller_id?: string;
  assigned_manager: {
    name: string;
    phone: string;
    email: string;
  };
}

export interface IoTDevice {
  device_id: string;
  parcel_id: string;
  parcel_name: string;
  name: string;
  type: 'IRRIGATION_VALVE' | 'WATER_PUMP' | 'SOIL_MOISTURE_PROBE' | 'WEATHER_STATION';
  status: 'ACTIVE' | 'PAUSED' | 'OFFLINE';
  paused_until: string | null;
  battery_percent: number;
  telemetry: {
    soil_moisture_percent: number;
    soil_temp_c: number;
    valve_pressure_bar: number;
    flow_rate_l_min?: number;
  };
  coordinates: [number, number]; // [lng, lat]
}

export interface SupplyChainCorridor {
  corridor_id: string;
  name: string;
  name_en: string;
  type: 'ROAD_TRANSIT' | 'COLD_CHAIN_SUPPLY' | 'GRAIN_SILO_FEEDER';
  geom: GeoJSONLineString;
  primary_cargo: string;
  status: 'CLEAR' | 'INTERSECTED_FLOOD_RISK' | 'REROUTED';
}

export interface RiskAssessment {
  runoff_risk: 'HIGH' | 'MEDIUM' | 'LOW';
  runoff_score: number; // 0 - 100
  wind_stress_risk: 'HIGH' | 'MEDIUM' | 'LOW';
  wind_stress_score: number; // 0 - 100
  soil_saturation_expected: 'MAX' | 'HIGH' | 'MODERATE';
  lodging_risk: 'HIGH' | 'MEDIUM' | 'LOW';
  dem_concavity_status: 'PRONE_TO_WATERLOGGING' | 'EROSION_HAZARD' | 'STABLE_RUNOFF';
  fungal_outbreak_risk_7d: 'SEVERE' | 'HIGH' | 'MODERATE' | 'LOW';
}

export interface AutomatedCommand {
  target_system: 'IoT_Irrigation_Controller' | 'Notification_Service' | 'Supply_Chain_Dispatch' | 'Sentinel_Drone_Tasking';
  action: string;
  duration_hours?: number;
  status: 'DISPATCHED' | 'EXECUTED' | 'PENDING';
  recipient?: string;
  channel?: 'PUSH_AND_SMS' | 'MQTT_BROKER' | 'TMS_API' | 'SATELLITE_TASKING_API';
  message?: string;
}

export interface MatchedParcelAction {
  parcel_id: string;
  parcel_name: string;
  crop_type: string;
  slope_degree: number;
  risk_assessment: RiskAssessment;
  automated_commands: AutomatedCommand[];
  actions_taken: string[];
}

export interface AutomatedActionResponse {
  event_processing_id: string;
  alert_id: string;
  matched_parcels_count: number;
  matched_corridors_count: number;
  matched_iot_count: number;
  actions_triggered: MatchedParcelAction[];
  corridor_alerts: Array<{
    corridor_id: string;
    corridor_name: string;
    recommended_detour: string;
    warning_level: string;
  }>;
}

export interface WeatherEventLog {
  log_id: string;
  alert_id: string;
  parcel_id: string;
  parcel_name: string;
  severity: AlertSeverityLevel;
  hazard_type: string;
  timestamp: string;
  status: 'TRIGGERED' | 'PAUSED' | 'RESOLVED';
  rainfall_recorded_mm: number;
  peak_downburst_kmh: number;
  irrigation_saved_m3: number;
  energy_saved_kwh: number;
  fungal_warning_level: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface PostStormAssessment {
  event_id: string;
  parcel_id: string;
  parcel_name: string;
  crop_type: string;
  satellite_mission: 'Sentinel-2 MSI Level-2A' | 'DJI Mavic 3M Multispectral';
  pre_storm_date: string;
  post_storm_date: string;
  pre_storm_ndvi: number;
  post_storm_ndvi: number;
  ndvi_delta_percent: number;
  detected_water_pooling_hectares: number;
  lodged_crop_hectares: number;
  soil_saturation_pct: number;
  fungal_projections: {
    downy_mildew_risk_pct: number; // البياض الزغبي
    root_rot_risk_pct: number; // فطريات الجذور
    botrytis_risk_pct: number; // العفن الرمادي
    recommended_spray_window: string;
    agronomic_advice_ar: string;
    agronomic_advice_en: string;
  };
}
