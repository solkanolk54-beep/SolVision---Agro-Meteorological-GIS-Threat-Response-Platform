import {
  WeatherAlertPayload,
  AgriculturalParcel,
  SupplyChainCorridor,
  IoTDevice,
  WeatherEventLog,
  PostStormAssessment,
} from '../types/solvision.ts';

export const INITIAL_PARCELS: AgriculturalParcel[] = [
  {
    parcel_id: 'PRC-MILA-01',
    owner_id: 'OWN-901',
    name: 'القطعة (A3/مزرعة ميلة - سهل التلاغمة)',
    name_en: 'Parcel A3 - Mila High Plains',
    wilaya: 'ولاية ميلة (Mila)',
    crop_type: 'أشجار الزيتون المعمر والقمح الصلب',
    crop_type_en: 'Centennial Olive Trees & Durum Wheat',
    tree_age_years: 18,
    ndvi_vegetation_index: 0.76,
    row_orientation_degrees: 45,
    slope_degree: 17.8, // > 15 deg -> High Runoff
    soil_type: 'طينية ثقيلة (Heavy Clay)',
    elevation_m: 485,
    depression_index: 0.58,
    geom: {
      type: 'Polygon',
      coordinates: [
        [
          [6.30, 36.42],
          [6.42, 36.42],
          [6.42, 36.34],
          [6.30, 36.34],
          [6.30, 36.42],
        ],
      ],
    },
    area_hectares: 48.5,
    current_irrigation_status: 'ACTIVE',
    iot_controller_id: 'IOT-VLV-MILA-01',
    assigned_manager: {
      name: 'المهندس كريم بوجمعة',
      phone: '+213 550 12 34 56',
      email: 'karim.boujemaa@solvision.farm',
    },
  },
  {
    parcel_id: 'PRC-MILA-02',
    owner_id: 'OWN-904',
    name: 'القطعة (B2/حوض وادي العثمانية)',
    name_en: 'Parcel B2 - Oued Athmania Basin',
    wilaya: 'ولاية ميلة (Mila)',
    crop_type: 'كروم العنب والحمضيات المروية',
    crop_type_en: 'Table Grapes & Drip-irrigated Citrus',
    tree_age_years: 7,
    ndvi_vegetation_index: 0.82,
    row_orientation_degrees: 90,
    slope_degree: 19.4, // > 15 deg -> High Runoff
    soil_type: 'طميية كلسية عميقة (Calcareous Silt Loam)',
    elevation_m: 395,
    depression_index: 0.74, // High concavity -> Waterlogging prone
    geom: {
      type: 'Polygon',
      coordinates: [
        [
          [6.43, 36.41],
          [6.49, 36.41],
          [6.49, 36.33],
          [6.43, 36.33],
          [6.43, 36.41],
        ],
      ],
    },
    area_hectares: 34.0,
    current_irrigation_status: 'ACTIVE',
    iot_controller_id: 'IOT-PMP-MILA-02',
    assigned_manager: {
      name: 'الأستاذ رشيد لعموري',
      phone: '+213 661 78 90 12',
      email: 'rachid.laamouri@solvision.farm',
    },
  },
  {
    parcel_id: 'PRC-CHELG-03',
    owner_id: 'OWN-882',
    name: 'القطعة (C1/مستثمرة شلغوم العيد الجنوبية)',
    name_en: 'Parcel C1 - South Chelghoum El Aid',
    wilaya: 'ولاية ميلة (Mila)',
    crop_type: 'الحبوب الشتوية وبذور اللفت الزيتي',
    crop_type_en: 'Winter Cereals & Canola',
    tree_age_years: 0,
    ndvi_vegetation_index: 0.64,
    row_orientation_degrees: 0,
    slope_degree: 6.2, // Low slope
    soil_type: 'طميية رملية جيدة الصرف (Sandy Loam)',
    elevation_m: 620,
    depression_index: 0.28,
    geom: {
      type: 'Polygon',
      coordinates: [
        [
          [6.12, 36.26],
          [6.22, 36.26],
          [6.22, 36.18],
          [6.12, 36.18],
          [6.12, 36.26],
        ],
      ],
    },
    area_hectares: 65.0,
    current_irrigation_status: 'IDLE',
    iot_controller_id: 'IOT-VLV-CHELG-03',
    assigned_manager: {
      name: 'المهندسة مريم قيدوش',
      phone: '+213 770 45 67 89',
      email: 'meriem.kaidouche@solvision.farm',
    },
  },
  {
    parcel_id: 'PRC-GRAREM-04',
    owner_id: 'OWN-750',
    name: 'القطعة (D4/منحدرات بحيرة سد بني هارون - قرارم)',
    name_en: 'Parcel D4 - Beni Haroun Dam Slopes',
    wilaya: 'ولاية ميلة (Mila)',
    crop_type: 'أشجار تين ولوز غابية',
    crop_type_en: 'Fig & Almond Terraced Orchards',
    tree_age_years: 12,
    ndvi_vegetation_index: 0.69,
    row_orientation_degrees: 135,
    slope_degree: 23.5, // Extreme slope
    soil_type: 'صخرية هشة ومتحللة (Rocky Fractured Marl)',
    elevation_m: 310,
    depression_index: 0.35,
    geom: {
      type: 'Polygon',
      coordinates: [
        [
          [6.24, 36.56],
          [6.35, 36.56],
          [6.35, 36.47],
          [6.24, 36.47],
          [6.24, 36.56],
        ],
      ],
    },
    area_hectares: 28.0,
    current_irrigation_status: 'IDLE',
    assigned_manager: {
      name: 'المهندس ياسين بوقرة',
      phone: '+213 555 98 76 54',
      email: 'yacine.bouguerra@solvision.farm',
    },
  },
];

export const INITIAL_CORRIDORS: SupplyChainCorridor[] = [
  {
    corridor_id: 'CORR-MILA-JIJEL-01',
    name: 'محور تصدير المحاصيل ميلة - ميناء جن جن (جيجل)',
    name_en: 'Mila - Djen Djen Port Agri-Export Transit',
    type: 'ROAD_TRANSIT',
    primary_cargo: 'زيت الزيتون المعصور والحبوب السائبة',
    status: 'CLEAR',
    geom: {
      type: 'LineString',
      coordinates: [
        [6.20, 36.32],
        [6.32, 36.38],
        [6.45, 36.44],
        [6.38, 36.58],
        [6.25, 36.72],
        [6.05, 36.82],
      ],
    },
  },
  {
    corridor_id: 'CORR-MILA-CONST-02',
    name: 'محور الربط اللوجستي شلغوم العيد - قسنطينة (RN5)',
    name_en: 'Chelghoum El Aid - Constantine Logistics Highway',
    type: 'COLD_CHAIN_SUPPLY',
    primary_cargo: 'سلسلة التبريد (ألبان ومحاصيل خضرية سريعة التلف)',
    status: 'CLEAR',
    geom: {
      type: 'LineString',
      coordinates: [
        [6.15, 36.24],
        [6.28, 36.30],
        [6.44, 36.36],
        [6.58, 36.38],
        [6.68, 36.36],
      ],
    },
  },
];

export const INITIAL_IOT_DEVICES: IoTDevice[] = [
  {
    device_id: 'IOT-VLV-MILA-01',
    parcel_id: 'PRC-MILA-01',
    parcel_name: 'القطعة (A3/مزرعة ميلة)',
    name: 'صمام التحكم الهيدروليكي الآلي V-01',
    type: 'IRRIGATION_VALVE',
    status: 'ACTIVE',
    paused_until: null,
    battery_percent: 94,
    telemetry: {
      soil_moisture_percent: 48,
      soil_temp_c: 19.8,
      valve_pressure_bar: 3.4,
      flow_rate_l_min: 145,
    },
    coordinates: [6.35, 36.38],
  },
  {
    device_id: 'IOT-PMP-MILA-02',
    parcel_id: 'PRC-MILA-02',
    parcel_name: 'القطعة (B2/وادي العثمانية)',
    name: 'محطة الضخ والتسميد المتغيرة السرعة P-04',
    type: 'WATER_PUMP',
    status: 'ACTIVE',
    paused_until: null,
    battery_percent: 88,
    telemetry: {
      soil_moisture_percent: 54,
      soil_temp_c: 18.9,
      valve_pressure_bar: 4.1,
      flow_rate_l_min: 220,
    },
    coordinates: [6.46, 36.37],
  },
  {
    device_id: 'IOT-PRB-MILA-03',
    parcel_id: 'PRC-MILA-01',
    parcel_name: 'القطعة (A3/مزرعة ميلة)',
    name: 'مجس قياس رطوبة التربة متعدد الأعماق (60سم)',
    type: 'SOIL_MOISTURE_PROBE',
    status: 'ACTIVE',
    paused_until: null,
    battery_percent: 99,
    telemetry: {
      soil_moisture_percent: 51,
      soil_temp_c: 17.5,
      valve_pressure_bar: 0,
    },
    coordinates: [6.32, 36.39],
  },
  {
    device_id: 'IOT-WTH-CHELG-04',
    parcel_id: 'PRC-CHELG-03',
    parcel_name: 'القطعة (C1/شلغوم العيد)',
    name: 'محطة الأرصاد الزراعية الدقيقة AgroStation-X1',
    type: 'WEATHER_STATION',
    status: 'ACTIVE',
    paused_until: null,
    battery_percent: 92,
    telemetry: {
      soil_moisture_percent: 39,
      soil_temp_c: 21.2,
      valve_pressure_bar: 0,
      flow_rate_l_min: 0,
    },
    coordinates: [6.17, 36.22],
  },
];

export const PRESET_ALERTS: Record<string, WeatherAlertPayload> = {
  'ESTOFEX-LEVEL1-MILA': {
    alert_id: 'ESTOFEX-2026-10-20-01',
    source: 'ESTOFEX / National Met Office',
    severity_level: 1,
    hazard_type: 'THUNDERSTORM_HEAVY_RAIN_DOWNBURST',
    issued_at: '2026-10-20T01:00:00Z',
    valid_until: '2026-10-20T18:00:00Z',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [6.25, 36.45],
          [6.50, 36.45],
          [6.50, 36.30],
          [6.25, 36.30],
          [6.25, 36.45],
        ],
      ],
    },
    meteorological_details: {
      expected_rainfall_mm: 42,
      downburst_speed_kmh: 78,
      hail_probability_percent: 45,
      convective_cape_j_kg: 1850,
      lightning_flash_rate: '25-35 flashes / min',
    },
  },
  'ESTOFEX-LEVEL2-SEVERE': {
    alert_id: 'ESTOFEX-2026-10-20-02',
    source: 'ESTOFEX Convective Warning Center',
    severity_level: 2,
    hazard_type: 'SUPERCELL_HAIL_SQUALL',
    issued_at: '2026-10-20T03:30:00Z',
    valid_until: '2026-10-20T21:00:00Z',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [6.20, 36.52],
          [6.55, 36.52],
          [6.55, 36.25],
          [6.20, 36.25],
          [6.20, 36.52],
        ],
      ],
    },
    meteorological_details: {
      expected_rainfall_mm: 68,
      downburst_speed_kmh: 96,
      hail_probability_percent: 75,
      convective_cape_j_kg: 2400,
      lightning_flash_rate: '50+ flashes / min',
    },
  },
  'NWS-FLASH-FLOOD': {
    alert_id: 'NWS-DZ-2026-10-20-FF',
    source: 'National Hydrometeorological Agency',
    severity_level: 3,
    hazard_type: 'FLASH_FLOOD_TORRENTIAL_RAIN',
    issued_at: '2026-10-20T05:00:00Z',
    valid_until: '2026-10-20T23:59:00Z',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [6.22, 36.46],
          [6.52, 36.46],
          [6.52, 36.28],
          [6.22, 36.28],
          [6.22, 36.46],
        ],
      ],
    },
    meteorological_details: {
      expected_rainfall_mm: 88,
      downburst_speed_kmh: 105,
      hail_probability_percent: 85,
      convective_cape_j_kg: 2900,
      lightning_flash_rate: 'EXTREME (>80 flashes / min)',
    },
  },
};

export const INITIAL_WEATHER_LOGS: WeatherEventLog[] = [
  {
    log_id: 'LOG-2026-10-14-01',
    alert_id: 'ESTOFEX-2026-10-14-88',
    parcel_id: 'PRC-MILA-01',
    parcel_name: 'القطعة (A3/مزرعة ميلة)',
    severity: 1,
    hazard_type: 'THUNDERSTORM_HEAVY_RAIN',
    timestamp: '2026-10-14 14:30',
    status: 'RESOLVED',
    rainfall_recorded_mm: 36,
    peak_downburst_kmh: 72,
    irrigation_saved_m3: 420,
    energy_saved_kwh: 145,
    fungal_warning_level: 'HIGH',
  },
  {
    log_id: 'LOG-2026-10-02-02',
    alert_id: 'ESTOFEX-2026-10-02-14',
    parcel_id: 'PRC-MILA-02',
    parcel_name: 'القطعة (B2/حوض وادي العثمانية)',
    severity: 2,
    hazard_type: 'SUPERCELL_HAIL_SQUALL',
    timestamp: '2026-10-02 18:15',
    status: 'RESOLVED',
    rainfall_recorded_mm: 58,
    peak_downburst_kmh: 91,
    irrigation_saved_m3: 680,
    energy_saved_kwh: 230,
    fungal_warning_level: 'HIGH',
  },
];

export const INITIAL_POST_STORM_ASSESSMENT: PostStormAssessment = {
  event_id: 'EVT-98432-SOL',
  parcel_id: 'PRC-MILA-01',
  parcel_name: 'القطعة (A3/مزرعة ميلة - سهل التلاغمة)',
  crop_type: 'أشجار الزيتون المعمر والقمح الصلب',
  satellite_mission: 'Sentinel-2 MSI Level-2A',
  pre_storm_date: '2026-10-18T10:45:00Z',
  post_storm_date: '2026-10-20T11:20:00Z',
  pre_storm_ndvi: 0.76,
  post_storm_ndvi: 0.69,
  ndvi_delta_percent: -9.2, // Minor canopy stripping & leaf drop
  detected_water_pooling_hectares: 3.4, // Water accumulation in concave depression
  lodged_crop_hectares: 1.8, // Wheat lodging from downburst
  soil_saturation_pct: 94,
  fungal_projections: {
    downy_mildew_risk_pct: 88, // البياض الزغبي
    root_rot_risk_pct: 79, // تعفن الجذور Phytophthora
    botrytis_risk_pct: 64, // العفن الرمادي
    recommended_spray_window: 'خلال 48 - 72 ساعة القادمة بمجرد جفاف السطح الورقي',
    agronomic_advice_ar:
      'توصية استباقية: نظراً لتجاوز رطوبة التربة 90% وتشبع التجاويف الطبوغرافية بالمياه، ينشط ميسيليوم الفطريات البيضية (Oomycetes). يُنصح برش وقائي بمركبات هيدروكسيد النحاس أو ميفينوكسام للأشجار مع حفر قنوات صرف سريعة لتصريف المياه الراكدة في المنخفض الشرقي.',
    agronomic_advice_en:
      'Proactive Advisory: With soil saturation exceeding 90% and topographical ponding detected in the eastern depression, high zoospore motility of Phytophthora and Plasmopara is projected. Deploy preventative copper oxychloride or mefenoxam treatment within 48-72h and inspect drainage trenches.',
  },
};
