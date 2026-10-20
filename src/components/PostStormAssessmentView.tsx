import React, { useState } from 'react';
import {
  Satellite,
  Layers,
  Sparkles,
  Calendar,
  AlertTriangle,
  History,
  Sliders,
  CheckCircle,
  Clock,
  Bug,
  Droplet,
  FileSpreadsheet,
  Download,
} from 'lucide-react';
import {
  PostStormAssessment,
  WeatherEventLog,
  AgriculturalParcel,
} from '../types/solvision.ts';

interface PostStormAssessmentViewProps {
  assessment: PostStormAssessment;
  historyLogs: WeatherEventLog[];
  parcels: AgriculturalParcel[];
  lang: 'ar' | 'en';
}

export const PostStormAssessmentView: React.FC<PostStormAssessmentViewProps> = ({
  assessment,
  historyLogs,
  parcels,
  lang,
}) => {
  const isAr = lang === 'ar';
  const [sliderPosition, setSliderPosition] = useState<number>(50); // Split slider 0-100%
  const [activeViewMode, setActiveViewMode] = useState<'split' | 'ndvi' | 'water'>('split');
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-indigo-950/80 via-[#0e1828] to-indigo-950/80 p-5 rounded-2xl border border-indigo-500/30 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <Satellite className="w-5 h-5" />
              </span>
              <h2 className="text-lg font-bold text-white">
                {isAr
                  ? 'التوثيق الميداني الممرّك ومقارنة صور الأقمار الصناعية (Sentinel-2)'
                  : 'Post-Event Satellite & Micro-Climate Impact Assessment'}
              </h2>
            </div>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              {isAr
                ? 'مقارنة صور الأقمار الصناعية قبل وبعد انقضاء العاصفة (Sentinel-2 Level-2A) لرصد تجمعات المياه الفائضة، كشف مناطق رقاد المحاصيل، وبناء نموذج استباقي للتنبؤ بانتشار الأمراض الفطرية (البياض الزغبي وعفن الجذور).'
                : 'Pre and post-storm multispectral satellite comparison (Sentinel-2 Level-2A) coupled with micro-climate pathogen tracking to forecast fungal outbreaks and surface ponding.'}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs bg-indigo-950/90 text-indigo-300 px-3 py-2 rounded-xl border border-indigo-500/40 font-mono">
            <span>{assessment.satellite_mission}</span>
            <span>•</span>
            <span className="text-emerald-400 font-bold">10m Resolution</span>
          </div>
        </div>
      </div>

      {/* Grid: Satellite Comparison on Top, Fungal Model & Historical Logs below */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Interactive Satellite Comparison */}
        <div className="lg:col-span-8 bg-[#0e1828] p-5 rounded-2xl border border-slate-700/80 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>{isAr ? 'مقارنة الأقمار الصناعية التفاعلية:' : 'Interactive Satellite Slider:'}</span>
                <span className="text-sky-400">{assessment.parcel_name}</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">
                Pre: {new Date(assessment.pre_storm_date).toLocaleDateString()} vs Post: {new Date(assessment.post_storm_date).toLocaleDateString()}
              </span>
            </div>

            {/* View Filter Modes */}
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-[11px] font-semibold text-slate-300">
              <button
                onClick={() => setActiveViewMode('split')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  activeViewMode === 'split' ? 'bg-indigo-600 text-white font-bold' : 'hover:bg-slate-800'
                }`}
              >
                {isAr ? 'مقارنة مزدوجة (Split)' : 'Split Swipe'}
              </button>
              <button
                onClick={() => setActiveViewMode('ndvi')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  activeViewMode === 'ndvi' ? 'bg-indigo-600 text-white font-bold' : 'hover:bg-slate-800'
                }`}
              >
                {isAr ? 'تغير مؤشر NDVI' : 'NDVI Delta'}
              </button>
              <button
                onClick={() => setActiveViewMode('water')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  activeViewMode === 'water' ? 'bg-indigo-600 text-white font-bold' : 'hover:bg-slate-800'
                }`}
              >
                {isAr ? 'تجمعات المياه (NDWI)' : 'Water Pooling'}
              </button>
            </div>
          </div>

          {/* Satellite Split Comparison Canvas Container */}
          <div className="relative w-full h-80 bg-slate-950 rounded-xl overflow-hidden border border-slate-800 select-none">
            {/* Background Layer: Post-Storm (After) */}
            <div className="absolute inset-0 w-full h-full">
              {/* Synthetic Visual Representation of Parcel After Storm with Water Pooling & Mud Deposition */}
              <div
                className="w-full h-full relative"
                style={{
                  background:
                    activeViewMode === 'ndvi'
                      ? 'radial-gradient(ellipse at 40% 60%, #15803d 0%, #ca8a04 40%, #854d0e 80%)'
                      : activeViewMode === 'water'
                      ? 'radial-gradient(ellipse at 55% 65%, #0284c7 0%, #1e3a8a 35%, #1e293b 70%)'
                      : 'radial-gradient(circle at center, #2d3e26 0%, #1b2617 70%, #0d130c 100%)',
                }}
              >
                {/* Visual indicator of water pooling in depression */}
                <div className="absolute top-1/3 right-1/4 w-36 h-28 rounded-full bg-cyan-700/60 blur-sm border-2 border-cyan-400/80 flex items-center justify-center">
                  <span className="text-[10px] text-cyan-200 font-mono font-bold bg-slate-900/90 px-1.5 py-0.5 rounded">
                    {isAr ? 'تجمع سيول: 3.4 هكتار' : 'Ponding: 3.4 ha'}
                  </span>
                </div>

                {/* Agricultural Furrows & Lodged Wheat Patches */}
                <div className="absolute bottom-10 left-12 w-28 h-20 rounded bg-amber-900/40 border border-amber-600/50 flex items-center justify-center rotate-6">
                  <span className="text-[9px] text-amber-300 font-mono font-bold bg-slate-900/90 px-1.5 py-0.5 rounded">
                    {isAr ? 'رقاد سيقان: 1.8 هكتار' : 'Lodging: 1.8 ha'}
                  </span>
                </div>

                <div className="absolute bottom-3 right-3 bg-red-950/90 text-red-300 text-[10px] font-mono font-bold px-2 py-1 rounded border border-red-500/40">
                  {isAr ? 'Sentinel-2 (بعد العاصفة)' : 'Sentinel-2 POST-STORM'}
                </div>
              </div>
            </div>

            {/* Foreground Layer: Pre-Storm (Before) clipped by slider */}
            <div
              className="absolute inset-0 h-full overflow-hidden border-r-2 border-white/90 shadow-2xl transition-all"
              style={{ width: `${sliderPosition}%` }}
            >
              <div
                className="w-full h-full relative"
                style={{
                  width: '100%',
                  minWidth: '600px',
                  background:
                    activeViewMode === 'ndvi'
                      ? 'radial-gradient(ellipse at 50% 50%, #22c55e 0%, #16a34a 60%, #15803d 100%)'
                      : 'radial-gradient(circle at center, #3f5933 0%, #293a21 70%, #121c0e 100%)',
                }}
              >
                {/* Pristine healthy field lines before storm */}
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]"></div>

                <div className="absolute bottom-3 left-3 bg-emerald-950/90 text-emerald-300 text-[10px] font-mono font-bold px-2 py-1 rounded border border-emerald-500/40">
                  {isAr ? 'Sentinel-2 (قبل العاصفة)' : 'Sentinel-2 PRE-STORM'}
                </div>
              </div>
            </div>

            {/* Slider Handle Line & Knob */}
            <div
              className="absolute top-0 bottom-0 pointer-events-none flex flex-col items-center justify-center"
              style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
            >
              <div className="w-7 h-7 rounded-full bg-white text-slate-900 shadow-xl flex items-center justify-center text-[10px] font-bold border-2 border-sky-500 pointer-events-auto cursor-ew-resize">
                <Sliders className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Invisible Range Input for Dragging */}
            <input
              type="range"
              min="0"
              max="100"
              value={sliderPosition}
              onChange={(e) => setSliderPosition(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
            />
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 text-[10px] block">
                {isAr ? 'تغير الغطاء الخضري (NDVI):' : 'NDVI Delta:'}
              </span>
              <span className="text-base font-black text-amber-400 font-mono">
                {assessment.ndvi_delta_percent}%
              </span>
              <span className="text-[10px] text-slate-500 block">
                {assessment.pre_storm_ndvi} → {assessment.post_storm_ndvi}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 text-[10px] block">
                {isAr ? 'تجمع مياه راكدة:' : 'Water Pooling Area:'}
              </span>
              <span className="text-base font-black text-cyan-400 font-mono">
                {assessment.detected_water_pooling_hectares} ha
              </span>
              <span className="text-[10px] text-cyan-300 block">
                {isAr ? 'في المنخفض الشرقي' : 'In concave bowl'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 text-[10px] block">
                {isAr ? 'المحاصيل الراقدة:' : 'Crop Lodging:'}
              </span>
              <span className="text-base font-black text-red-400 font-mono">
                {assessment.lodged_crop_hectares} ha
              </span>
              <span className="text-[10px] text-slate-500 block">
                {isAr ? 'رياح هابطة 78 كم/س' : '78 km/h gust'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 text-[10px] block">
                {isAr ? 'تشبع التربة بالرطوبة:' : 'Soil Saturation:'}
              </span>
              <span className="text-base font-black text-blue-400 font-mono">
                {assessment.soil_saturation_pct}%
              </span>
              <span className="text-[10px] text-red-400 block font-semibold">
                {isAr ? 'بيئة مثالية للفطريات' : 'Fungal favorable'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Predictive Fungal Outbreak Model */}
        <div className="lg:col-span-4 bg-[#0e1828] p-5 rounded-2xl border border-slate-700/80 shadow-xl space-y-4">
          <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30">
                <Bug className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  {isAr ? 'تنبؤ الأمراض الفطرية' : 'Fungal Outbreak Risk'}
                </h3>
                <span className="text-[10px] text-slate-400">
                  {isAr ? 'نموذج المناخ الدقيق (7 أيام)' : '7-Day Micro-Climate Disease Model'}
                </span>
              </div>
            </div>

            <span className="px-2 py-0.5 rounded bg-red-950 text-red-300 font-mono text-[10px] font-bold border border-red-500/40">
              {isAr ? 'إنذار وبائي' : 'HIGH ALERT'}
            </span>
          </div>

          {/* Fungal Propensity Meters */}
          <div className="space-y-3">
            {/* Downy Mildew */}
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                <span>{isAr ? 'البياض الزغبي (Downy Mildew):' : 'Downy Mildew (Plasmopara):'}</span>
                <span className="text-red-400 font-mono">{assessment.fungal_projections.downy_mildew_risk_pct}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-red-500 rounded-full"
                  style={{ width: `${assessment.fungal_projections.downy_mildew_risk_pct}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400 block">
                {isAr ? 'نشط عقب تبلل الأوراق لساعات طويلة' : 'Triggered by prolonged leaf wetness'}
              </span>
            </div>

            {/* Root Rot */}
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                <span>{isAr ? 'فطريات الجذور (Root Rot):' : 'Phytophthora Root Rot:'}</span>
                <span className="text-amber-400 font-mono">{assessment.fungal_projections.root_rot_risk_pct}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full"
                  style={{ width: `${assessment.fungal_projections.root_rot_risk_pct}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400 block">
                {isAr ? 'ناجم عن تشبع التربة المفرط > 90%' : 'Due to severe soil waterlogging > 90%'}
              </span>
            </div>

            {/* Botrytis */}
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                <span>{isAr ? 'العفن الرمادي (Botrytis):' : 'Botrytis Bunch Rot:'}</span>
                <span className="text-yellow-400 font-mono">{assessment.fungal_projections.botrytis_risk_pct}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-500 rounded-full"
                  style={{ width: `${assessment.fungal_projections.botrytis_risk_pct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Actionable Agronomic Advisory */}
          <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs space-y-2 text-emerald-200">
            <div className="flex items-center gap-1.5 font-bold text-emerald-300">
              <Clock className="w-4 h-4" />
              <span>{isAr ? 'نافذة الرش الوقائي الموصى بها:' : 'Recommended Spray Window:'}</span>
            </div>
            <p className="font-semibold text-white text-[11px]">
              {assessment.fungal_projections.recommended_spray_window}
            </p>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              {isAr ? assessment.fungal_projections.agronomic_advice_ar : assessment.fungal_projections.agronomic_advice_en}
            </p>
          </div>
        </div>
      </div>

      {/* Historical Micro-Climate Event Archive */}
      <div className="bg-[#0e1828] p-5 rounded-2xl border border-slate-700/80 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-sky-400" />
            <h3 className="text-sm font-bold text-white">
              {isAr
                ? 'السجل التاريخي للمناخ المحلي وأرشفة العواصف (Micro-Climate History Log)'
                : 'Micro-Climate Storm Event History & Predictive Archive'}
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            {isAr ? 'البيانات المسجلة لقاعدة المعرفة' : 'Archived Events'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left rtl:text-right text-slate-300">
            <thead className="text-[11px] uppercase bg-slate-900/80 text-slate-400 border-b border-slate-800 font-mono">
              <tr>
                <th className="px-4 py-3">{isAr ? 'معرف التنبيه' : 'Alert ID'}</th>
                <th className="px-4 py-3">{isAr ? 'القطعة الزراعية' : 'Parcel'}</th>
                <th className="px-4 py-3">{isAr ? 'التاريخ والوقت' : 'Timestamp'}</th>
                <th className="px-4 py-3">{isAr ? 'كمية الأمطار' : 'Rainfall'}</th>
                <th className="px-4 py-3">{isAr ? 'شدة الرياح' : 'Gust Speed'}</th>
                <th className="px-4 py-3">{isAr ? 'وفر المياه' : 'Water Saved'}</th>
                <th className="px-4 py-3">{isAr ? 'خطر الفطريات' : 'Fungal Hazard'}</th>
                <th className="px-4 py-3">{isAr ? 'الحالة' : 'Status'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {historyLogs.map((log) => (
                <tr key={log.log_id} className="hover:bg-slate-900/60 transition-colors">
                  <td className="px-4 py-3 font-mono text-emerald-400 font-bold">{log.alert_id}</td>
                  <td className="px-4 py-3 font-medium text-white">{log.parcel_name}</td>
                  <td className="px-4 py-3 text-slate-400 font-mono">{log.timestamp}</td>
                  <td className="px-4 py-3 font-mono text-blue-400">{log.rainfall_recorded_mm} mm</td>
                  <td className="px-4 py-3 font-mono text-amber-400">{log.peak_downburst_kmh} km/h</td>
                  <td className="px-4 py-3 font-mono text-emerald-400 font-semibold">{log.irrigation_saved_m3} m³</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-500/40">
                      {log.fungal_warning_level}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
