import React, { useState } from 'react';
import {
  TrendingDown,
  Wind,
  Droplets,
  Mountain,
  AlertTriangle,
  Layers,
  ShieldAlert,
  Sparkles,
  Info,
  CheckCircle2,
  TreeDeciduous,
  Activity,
} from 'lucide-react';
import {
  AgriculturalParcel,
  WeatherAlertPayload,
  MatchedParcelAction,
} from '../types/solvision.ts';
import { calculateRunoffRisk, calculateWindStressRisk, calculateFungalRisk } from '../services/spatialEngine.ts';

interface RiskAnalyticsPanelProps {
  parcels: AgriculturalParcel[];
  selectedParcelId: string | null;
  onSelectParcel: (id: string) => void;
  alert: WeatherAlertPayload;
  matchedActions: MatchedParcelAction[];
  lang: 'ar' | 'en';
}

export const RiskAnalyticsPanel: React.FC<RiskAnalyticsPanelProps> = ({
  parcels,
  selectedParcelId,
  onSelectParcel,
  alert,
  matchedActions,
  lang,
}) => {
  const isAr = lang === 'ar';

  const selectedParcel =
    parcels.find((p) => p.parcel_id === selectedParcelId) || parcels[0];

  const matchedAction = matchedActions.find((a) => a.parcel_id === selectedParcel.parcel_id);

  // Simulation state to let user test DEM slope or rain variations
  const [simRainfall, setSimRainfall] = useState<number>(
    alert.meteorological_details?.expected_rainfall_mm ?? 42
  );
  const [simDownburst, setSimDownburst] = useState<number>(
    alert.meteorological_details?.downburst_speed_kmh ?? 78
  );

  const dynamicRunoff = calculateRunoffRisk(
    selectedParcel.slope_degree,
    selectedParcel.depression_index,
    simRainfall,
    selectedParcel.soil_type
  );

  const dynamicWind = calculateWindStressRisk(
    simDownburst,
    alert.severity_level,
    selectedParcel.ndvi_vegetation_index,
    selectedParcel.tree_age_years,
    selectedParcel.crop_type
  );

  const dynamicFungal = calculateFungalRisk(simRainfall, dynamicRunoff.soil_saturation_expected);

  return (
    <div className="space-y-6">
      {/* Top Banner Explaining the Built-in Risk Engine */}
      <div className="bg-gradient-to-r from-slate-900 via-[#101e33] to-slate-900 p-5 rounded-2xl border border-slate-700/60 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Activity className="w-5 h-5" />
              </span>
              <h2 className="text-lg font-bold text-white">
                {isAr
                  ? 'محرك التنبؤ بالمخاطر المدمج (DEM & Downburst Risk Engine)'
                  : 'Integrated Agro-Hydraulic & Mechanical Risk Engine'}
              </h2>
            </div>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              {isAr
                ? 'بمجرد تقاطع نطاق العاصفة الرعدية مع الأصول الميدانية، يُجري المحرك تحليلاً هيدروليكياً وميكانيكياً فائق الدقة بدمج الإنذار مع نموذج الارتفاع الرقمي (DEM)، خواص التربة، كثافة الغطاء الخضري NDVI، وعمر المحاصيل.'
                : 'Upon spatial intersection with the storm polygon, the SolVision engine executes coupled DEM runoff hydraulics and downburst mechanical drag simulations across all active field plots.'}
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-950/60 px-3 py-2 rounded-xl border border-slate-800 text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>
              {isAr
                ? `القطع المتأثرة آنياً: ${matchedActions.length}`
                : `Active Intersected Parcels: ${matchedActions.length}`}
            </span>
          </div>
        </div>
      </div>

      {/* Parcel Selection Carousel / Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {parcels.map((parcel) => {
          const isMatched = matchedActions.some((a) => a.parcel_id === parcel.parcel_id);
          const isSelected = parcel.parcel_id === selectedParcel.parcel_id;

          return (
            <button
              key={parcel.parcel_id}
              onClick={() => onSelectParcel(parcel.parcel_id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-2 ${
                isSelected
                  ? 'bg-emerald-600 text-white border-emerald-400 shadow-lg shadow-emerald-600/30'
                  : isMatched
                  ? 'bg-slate-900/90 text-amber-300 border-amber-500/40 hover:bg-slate-800'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:bg-slate-800/80 hover:text-slate-200'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isMatched ? 'bg-amber-400 animate-ping' : 'bg-slate-600'
                }`}
              />
              <span>{isAr ? parcel.name : parcel.name_en}</span>
              <span className="text-[10px] opacity-75 font-mono">({parcel.slope_degree}°)</span>
            </button>
          );
        })}
      </div>

      {/* Main Grid: DEM Runoff on Left / Wind Stress on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Runoff & Erosion Index (مؤشر خطر الانجراف وتراكم المياه) */}
        <div className="bg-[#0e1828] p-5 rounded-2xl border border-slate-700/80 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
                <Droplets className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  {isAr ? '1. مؤشر خطر الانجراف وتراكم المياه' : '1. Runoff & Water Accumulation Index'}
                </h3>
                <span className="text-[11px] text-slate-400">
                  {isAr ? 'دمج غزارة الأمطار مع نموذج الارتفاع الرقمي DEM' : 'DEM Slope & Hydrological Runoff Modeling'}
                </span>
              </div>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${
                dynamicRunoff.runoff_risk === 'HIGH'
                  ? 'bg-red-950/80 text-red-300 border-red-500/50'
                  : dynamicRunoff.runoff_risk === 'MEDIUM'
                  ? 'bg-amber-950/80 text-amber-300 border-amber-500/50'
                  : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
              }`}
            >
              {isAr
                ? dynamicRunoff.runoff_risk === 'HIGH'
                  ? 'خطر انجراف مرتفع جداً'
                  : dynamicRunoff.runoff_risk === 'MEDIUM'
                  ? 'خطر متوسط'
                  : 'منخفض / مستقر'
                : `${dynamicRunoff.runoff_risk} RUNOFF`}
            </span>
          </div>

          {/* Interactive Topographic Slope / DEM Profile Box */}
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="font-semibold flex items-center gap-1.5">
                <Mountain className="w-4 h-4 text-emerald-400" />
                {isAr ? 'المقطع الطبوغرافي الرقمي (DEM Cross-Section):' : 'DEM Elevation Profile:'}
              </span>
              <span className="font-mono text-emerald-400 font-bold">
                {selectedParcel.elevation_m}m MSL
              </span>
            </div>

            {/* SVG Visualizing Parcel DEM Slope & Depressions */}
            <div className="relative w-full h-28 bg-[#070d17] rounded-lg overflow-hidden border border-slate-800 p-2">
              <svg viewBox="0 0 400 100" className="w-full h-full">
                {/* Grid Lines */}
                <line x1="0" y1="25" x2="400" y2="25" stroke="#1e293b" strokeDasharray="3,3" />
                <line x1="0" y1="50" x2="400" y2="50" stroke="#1e293b" strokeDasharray="3,3" />
                <line x1="0" y1="75" x2="400" y2="75" stroke="#1e293b" strokeDasharray="3,3" />

                {/* Ground terrain path based on slope degree */}
                {selectedParcel.slope_degree > 15 ? (
                  // Steep slope with water velocity arrows
                  <>
                    <path
                      d="M 10 20 L 220 70 Q 280 95 340 85 L 390 88 L 390 100 L 10 100 Z"
                      fill="url(#steepGradient)"
                      stroke="#ef4444"
                      strokeWidth="2.5"
                    />
                    {/* Water flow arrows */}
                    <path
                      d="M 60 26 L 140 52"
                      stroke="#38bdf8"
                      strokeWidth="2"
                      strokeDasharray="4,4"
                      className="animate-pulse"
                    />
                    <text x="70" y="20" fill="#f87171" fontSize="10" fontWeight="bold">
                      {isAr ? 'منحدر عالي (>15°) - تدفق سيول جارف' : 'Steep Slope (>15°) High Kinetic Runoff'}
                    </text>
                  </>
                ) : (
                  // Gentle slope with concavity
                  <>
                    <path
                      d="M 10 40 Q 150 75 250 85 Q 320 80 390 55 L 390 100 L 10 100 Z"
                      fill="url(#gentleGradient)"
                      stroke="#10b981"
                      strokeWidth="2"
                    />
                    <text x="80" y="32" fill="#34d399" fontSize="10" fontWeight="bold">
                      {isAr ? 'انحدار مستقر (6.2°) - جريان هادئ' : 'Gentle Slope - Low Kinetic Energy'}
                    </text>
                  </>
                )}

                {/* Gradients */}
                <defs>
                  <linearGradient id="steepGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7f1d1d" stopOpacity="0.7" />
                    <stop offset="100%" stopColor="#1e293b" stopOpacity="0.9" />
                  </linearGradient>
                  <linearGradient id="gentleGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#064e3b" stopOpacity="0.7" />
                    <stop offset="100%" stopColor="#1e293b" stopOpacity="0.9" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Concavity / Ponding Tag */}
              {selectedParcel.depression_index > 0.6 && (
                <div className="absolute bottom-2 right-3 bg-blue-950/90 text-blue-300 text-[10px] px-2 py-0.5 rounded border border-blue-500/50 font-bold">
                  {isAr ? 'تجوّف مقعر: تراكم برك مائية' : 'Concave Bowl: High Ponding Hazard'}
                </div>
              )}
            </div>

            {/* Runoff Metrics Breakdown */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">
                  {isAr ? 'درجة الانحدار (Slope DEM):' : 'DEM Slope Degree:'}
                </span>
                <span className="text-base font-black text-white font-mono">
                  {selectedParcel.slope_degree}°
                </span>
                <span className="text-[10px] text-amber-400 block mt-0.5">
                  {selectedParcel.slope_degree > 15
                    ? isAr
                      ? 'يتجاوز العتبة الحرجة (15°)'
                      : 'Exceeds critical threshold'
                    : isAr
                    ? 'ضمن الحدود الآمنة'
                    : 'Within safe limits'}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">
                  {isAr ? 'تشبع التربة المتوقع:' : 'Expected Soil Saturation:'}
                </span>
                <span className="text-base font-black text-blue-400 font-mono">
                  {dynamicRunoff.soil_saturation_expected === 'MAX'
                    ? isAr
                      ? 'تشبع أقصى (100%)'
                      : 'MAX SATURATION'
                    : isAr
                    ? 'مرتفع جداً (85%)'
                    : 'HIGH'}
                </span>
                <span className="text-[10px] text-blue-300 block mt-0.5">
                  {selectedParcel.soil_type}
                </span>
              </div>
            </div>

            {/* Morphological Assessment Alert */}
            <div
              className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                dynamicRunoff.dem_concavity_status === 'PRONE_TO_WATERLOGGING'
                  ? 'bg-blue-950/60 border-blue-500/40 text-blue-200'
                  : dynamicRunoff.dem_concavity_status === 'EROSION_HAZARD'
                  ? 'bg-red-950/60 border-red-500/40 text-red-200'
                  : 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
              }`}
            >
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
              <div>
                <strong className="block font-bold">
                  {dynamicRunoff.dem_concavity_status === 'PRONE_TO_WATERLOGGING'
                    ? isAr
                      ? 'منطقة مقعرة مهددة بالغرق والتشبع المفرط (Waterlogging):'
                      : 'Concave Basin Prone to Severe Ponding:'
                    : dynamicRunoff.dem_concavity_status === 'EROSION_HAZARD'
                    ? isAr
                      ? 'منحدر حاد مهدد بالانجراف السطحي الحركي للأتربة:'
                      : 'Steep Slope Kinetic Surface Soil Erosion Hazard:'
                    : isAr
                    ? 'تضاريس ذات تصريف طبيعي متوازن:'
                    : 'Balanced Natural Hydraulic Drainage:'}
                </strong>
                <p className="mt-0.5 text-[11px] opacity-90">
                  {isAr
                    ? 'يستدعي فوراً تشغيل الإيقاف التلقائي لمنظومة الري (Kill-Switch) لمنع تفاقم اختناق الجذور.'
                    : 'Requires automatic trigger of irrigation kill-switch to avoid root zone anoxia.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Wind Stress & Lodging Risk (مؤشر خطر الإجهاد الميكانيكي) */}
        <div className="bg-[#0e1828] p-5 rounded-2xl border border-slate-700/80 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Wind className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  {isAr ? '2. مؤشر خطر الإجهاد الميكانيكي والرياح' : '2. Downburst Shear & Lodging Risk'}
                </h3>
                <span className="text-[11px] text-slate-400">
                  {isAr ? 'حساب تأثير الرياح الهابطة على الأشجار ورقاد المحاصيل' : 'Convective Downburst Impact on Canopy & Stems'}
                </span>
              </div>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${
                dynamicWind.wind_stress_risk === 'HIGH'
                  ? 'bg-red-950/80 text-red-300 border-red-500/50'
                  : dynamicWind.wind_stress_risk === 'MEDIUM'
                  ? 'bg-amber-950/80 text-amber-300 border-amber-500/50'
                  : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
              }`}
            >
              {isAr
                ? dynamicWind.wind_stress_risk === 'HIGH'
                  ? 'إجهاد ميكانيكي حاد'
                  : 'إجهاد متوسط'
                : `${dynamicWind.wind_stress_risk} WIND SHEAR`}
            </span>
          </div>

          {/* Mechanical Factors Breakdown */}
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">
                  {isAr ? 'سرعة الرياح الهابطة (Downburst):' : 'Downburst Velocity:'}
                </span>
                <span className="text-base font-black text-amber-400 font-mono">
                  {simDownburst} km/h
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {simDownburst >= 75 ? (isAr ? 'عواصف هابطة مفاجئة' : 'Microburst Gale') : (isAr ? 'هبات معتدلة' : 'Moderate Gusts')}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">
                  {isAr ? 'كثافة الغطاء الخضري (NDVI):' : 'Canopy Density (NDVI):'}
                </span>
                <span className="text-base font-black text-emerald-400 font-mono">
                  {selectedParcel.ndvi_vegetation_index.toFixed(2)}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {selectedParcel.ndvi_vegetation_index > 0.7
                    ? isAr
                      ? 'مساحة ورقية كثيفة (مقاومة سحب عالية)'
                      : 'Dense canopy (high drag)'
                    : isAr
                    ? 'غطاء نباتي متوسط'
                    : 'Moderate cover'}
                </span>
              </div>
            </div>

            {/* Tree Age & Row Orientation */}
            <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <TreeDeciduous className="w-4 h-4 text-emerald-400" />
                <span>
                  {isAr ? 'عمر الأشجار / نوع المحصول:' : 'Tree Age & Crop:'}
                </span>
              </div>
              <span className="font-semibold text-white">
                {selectedParcel.tree_age_years ? `${selectedParcel.tree_age_years} ${isAr ? 'سنة' : 'yrs'}` : (isAr ? 'محصول سنوي' : 'Annual')} - {isAr ? selectedParcel.crop_type : selectedParcel.crop_type_en}
              </span>
            </div>

            {/* Cereal Lodging Risk (خطر رقاد المحاصيل) */}
            <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-xs space-y-1.5 text-amber-200">
              <div className="flex items-center justify-between font-bold">
                <span className="flex items-center gap-1.5">
                  <TrendingDown className="w-4 h-4 text-amber-400" />
                  {isAr ? 'خطر رقاد القمح والمحاصيل الحقلية (Lodging Risk):' : 'Cereal Lodging Risk:'}
                </span>
                <span className="font-mono uppercase text-amber-300">
                  {dynamicWind.lodging_risk}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-normal">
                {isAr
                  ? 'تؤدي الرياح الهابطة الرأسية مع تبلل السنابل والأفرع إلى انحناء السيقان ورقادها. توصي المنظومة بتثبيت المحاور الحاملة وتعليق أعمال التسميد النيتروجيني الورقي فوراً.'
                  : 'Vertical convective drag coupled with precipitation weight increases stem buckling. The platform recommends postponing foliar spraying and inspecting trellises.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Parameter Simulator (What-If Analysis) */}
      <div className="bg-[#0b1422] p-4 rounded-2xl border border-slate-700/60 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-white">
            {isAr ? 'محاكي المعايير الجوية (What-If Live Stress Tester):' : 'Live Stress Parameter Tuning:'}
          </span>
          <span className="text-slate-400 text-[11px]">
            {isAr ? 'قم بضبط الهطول وسرعة الرياح لمشاهدة الاستجابة الفورية للمحرك' : 'Adjust inputs to simulate engine reactions'}
          </span>
        </div>

        <div className="flex items-center gap-6 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-mono">{isAr ? 'الهطول:' : 'Rain:'}</span>
            <input
              type="range"
              min="10"
              max="100"
              value={simRainfall}
              onChange={(e) => setSimRainfall(Number(e.target.value))}
              className="accent-blue-500 cursor-pointer w-28"
            />
            <span className="font-mono text-blue-400 font-bold w-12">{simRainfall} mm</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-mono">{isAr ? 'الرياح:' : 'Wind:'}</span>
            <input
              type="range"
              min="30"
              max="130"
              value={simDownburst}
              onChange={(e) => setSimDownburst(Number(e.target.value))}
              className="accent-amber-500 cursor-pointer w-28"
            />
            <span className="font-mono text-amber-400 font-bold w-14">{simDownburst} km/h</span>
          </div>
        </div>
      </div>
    </div>
  );
};
