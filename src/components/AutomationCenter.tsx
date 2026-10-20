import React, { useState } from 'react';
import {
  Power,
  ShieldCheck,
  Radio,
  Send,
  Bell,
  Clock,
  Droplet,
  Zap,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Smartphone,
  Server,
  FileCheck,
} from 'lucide-react';
import {
  IoTDevice,
  MatchedParcelAction,
  WeatherAlertPayload,
} from '../types/solvision.ts';

interface AutomationCenterProps {
  iotDevices: IoTDevice[];
  onToggleKillSwitch: (deviceId: string) => void;
  matchedActions: MatchedParcelAction[];
  alert: WeatherAlertPayload;
  lang: 'ar' | 'en';
}

export const AutomationCenter: React.FC<AutomationCenterProps> = ({
  iotDevices,
  onToggleKillSwitch,
  matchedActions,
  alert,
  lang,
}) => {
  const isAr = lang === 'ar';
  const [activeTab, setActiveTab] = useState<'iot' | 'dispatches'>('iot');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const handleManualAction = (deviceId: string, actionName: string) => {
    onToggleKillSwitch(deviceId);
    setSuccessToast(
      isAr
        ? `تم إرسال أمر ${actionName} عبر بروتوكول MQTT إلى المعرف ${deviceId} بنجاح`
        : `Dispatched ${actionName} via MQTT broker to ${deviceId}`
    );
    setTimeout(() => setSuccessToast(null), 3500);
  };

  // Calculate conserved resources
  const pausedCount = iotDevices.filter((d) => d.status === 'PAUSED').length;
  const estimatedWaterSavedM3 = pausedCount * 380;
  const estimatedEnergySavedKwh = pausedCount * 125;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-emerald-400 animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-xs font-bold">{successToast}</span>
        </div>
      )}

      {/* Main Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#0e1828] p-4 rounded-2xl border border-slate-700/80 shadow-lg flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Power className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">
              {isAr ? 'أجهزة الري المُعلّقة (Kill-Switch Active):' : 'Paused IoT Controllers:'}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-400 font-mono">
                {pausedCount} / {iotDevices.length}
              </span>
              <span className="text-[11px] text-amber-300 font-semibold">
                {isAr ? 'حماية من التشبع' : 'Anti-Waterlogging'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-[#0e1828] p-4 rounded-2xl border border-slate-700/80 shadow-lg flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
            <Droplet className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">
              {isAr ? 'وفر المياه الزراعية المتوقع:' : 'Estimated Water Conserved:'}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-blue-400 font-mono">
                ~{estimatedWaterSavedM3} m³
              </span>
              <span className="text-[11px] text-slate-400">
                {isAr ? 'خلال 48 ساعة' : 'over 48h'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-[#0e1828] p-4 rounded-2xl border border-slate-700/80 shadow-lg flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">
              {isAr ? 'وفر طاقة الضخ الكهربائي:' : 'Pumping Energy Saved:'}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-400 font-mono">
                ~{estimatedEnergySavedKwh} kWh
              </span>
              <span className="text-[11px] text-emerald-300">
                {isAr ? 'خفض البصمة الكربونية' : 'Eco-Efficient'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: IoT Controllers vs Dispatched Actions */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('iot')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'iot'
              ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>{isAr ? 'لوحة التحكم بصمامات ومضخات الري IoT' : 'IoT Irrigation Kill-Switch Board'}</span>
        </button>

        <button
          onClick={() => setActiveTab('dispatches')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'dispatches'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>{isAr ? 'التوصيات المؤتمتة والإشعارات الميدانية' : 'Automated Trigger Alerts & SMS'}</span>
        </button>
      </div>

      {/* Tab 1: IoT Controllers Matrix */}
      {activeTab === 'iot' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {iotDevices.map((device) => {
            const isPaused = device.status === 'PAUSED';

            return (
              <div
                key={device.device_id}
                className={`p-5 rounded-2xl border transition-all ${
                  isPaused
                    ? 'bg-[#121c2c] border-amber-500/50 shadow-lg shadow-amber-950/30'
                    : 'bg-[#0e1828] border-slate-700/80 shadow-md'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          isPaused ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'
                        }`}
                      />
                      <h4 className="font-bold text-white text-sm">{device.name}</h4>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                      <span>{device.device_id}</span>
                      <span>•</span>
                      <span className="text-sky-400">{device.parcel_name}</span>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${
                      isPaused
                        ? 'bg-amber-950 text-amber-300 border-amber-500/50'
                        : 'bg-emerald-950 text-emerald-300 border-emerald-500/50'
                    }`}
                  >
                    {isPaused ? (isAr ? 'مُعلّق تلقائياً' : 'PAUSED (48H)') : (isAr ? 'يعمل بالجدول' : 'ACTIVE SCHEDULE')}
                  </span>
                </div>

                {/* Telemetry Chips */}
                <div className="grid grid-cols-3 gap-2 my-4 text-xs">
                  <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800 text-center">
                    <span className="text-slate-400 text-[10px] block">
                      {isAr ? 'رطوبة التربة' : 'Soil Moisture'}
                    </span>
                    <span className="font-bold text-blue-400 font-mono text-sm">
                      {device.telemetry.soil_moisture_percent}%
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800 text-center">
                    <span className="text-slate-400 text-[10px] block">
                      {isAr ? 'ضغط الصمام' : 'Pressure'}
                    </span>
                    <span className="font-bold text-emerald-400 font-mono text-sm">
                      {device.telemetry.valve_pressure_bar} Bar
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800 text-center">
                    <span className="text-slate-400 text-[10px] block">
                      {isAr ? 'البطارية' : 'Battery'}
                    </span>
                    <span className="font-bold text-slate-200 font-mono text-sm">
                      {device.battery_percent}%
                    </span>
                  </div>
                </div>

                {/* Kill Switch Toggle Button */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    {isPaused
                      ? isAr
                        ? 'تم التعليق لتفادي غرق المحصول'
                        : 'Paused to prevent waterlogging'
                      : isAr
                      ? 'الري منتظم حسب جدول الضخ'
                      : 'Scheduled irrigation ready'}
                  </span>

                  <button
                    onClick={() =>
                      handleManualAction(
                        device.device_id,
                        isPaused ? 'استئناف الري (RESUME)' : 'إيقاف طارئ (PAUSE_SCHEDULE)'
                      )
                    }
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                      isPaused
                        ? 'bg-slate-800 text-emerald-400 hover:bg-slate-700 border border-slate-700'
                        : 'bg-red-600 text-white hover:bg-red-500 shadow-md shadow-red-600/20'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>
                      {isPaused
                        ? isAr
                          ? 'استئناف الري (Resume)'
                          : 'Resume Schedule'
                        : isAr
                        ? 'تفعيل Kill-Switch فوراً'
                        : 'Trigger Kill-Switch'}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Dispatched Actions & Location-Specific Instructions */}
      {activeTab === 'dispatches' && (
        <div className="space-y-4">
          {matchedActions.length === 0 ? (
            <div className="p-8 text-center bg-[#0e1828] rounded-2xl border border-slate-800 text-slate-400">
              <ShieldCheck className="w-12 h-12 mx-auto text-emerald-400 mb-2 opacity-60" />
              <p className="text-sm font-semibold">
                {isAr ? 'لا توجد أصول متقاطعة مع النطاق الحالي للعاصفة' : 'No parcels intersected with current storm extent'}
              </p>
            </div>
          ) : (
            matchedActions.map((action) => (
              <div
                key={action.parcel_id}
                className="bg-[#0e1828] p-5 rounded-2xl border border-slate-700/80 shadow-xl space-y-4"
              >
                {/* Header with user's specific trigger format */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-red-950 text-red-300 font-mono text-[11px] font-bold border border-red-500/40">
                      [SolVision Trigger Alert: Level-1 Storm]
                    </span>
                    <h4 className="font-bold text-white text-sm">
                      {action.parcel_name} ({action.parcel_id})
                    </h4>
                  </div>
                  <span className="text-xs text-amber-400 font-semibold">
                    {isAr
                      ? `خطر هطول غزير (${action.risk_assessment.runoff_risk}) + رياح هابطة (${action.risk_assessment.wind_stress_risk})`
                      : `Heavy Rain (${action.risk_assessment.runoff_risk}) + Downburst (${action.risk_assessment.wind_stress_risk})`}
                  </span>
                </div>

                {/* Exact Actionable Instructions from Prompt */}
                <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2.5">
                  <h5 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4" />
                    {isAr ? 'الإجراء المؤتمت المنفذ ميدانياً (Automated Actions):' : 'Automated Dispatched Protocol:'}
                  </h5>

                  <div className="space-y-2 text-xs text-slate-300">
                    <div className="flex items-start gap-2 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                      <span className="font-mono text-emerald-400 font-bold">1.</span>
                      <div>
                        <strong className="text-white block font-semibold">
                          {isAr ? 'تعليق جدولة الري التلقائي فوراً (IoT Kill-Switch):' : 'Immediate Pause of Irrigation Schedule:'}
                        </strong>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {isAr
                            ? 'تم إرسال إشارة PAUSE_SCHEDULE لمدة 48 ساعة عبر وسيط MQTT لجميع صمامات ومضخات القطعة لتوفير الطاقة والماء وتجنب التشبع المفرط للتربة (Waterlogging).'
                            : 'Dispatched PAUSE_SCHEDULE (48h duration) via MQTT broker to protect root aeration and conserve energy.'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                      <span className="font-mono text-amber-400 font-bold">2.</span>
                      <div>
                        <strong className="text-white block font-semibold">
                          {isAr ? 'إرسال تنبيه للمشرف الميداني (Push & SMS):' : 'Dispatched SMS Alert to Farm Manager:'}
                        </strong>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {isAr
                            ? 'توجيه تعليمات فورية لتفقد قنوات التصريف ومصارف السيول وتثبيت دعامات الأشجار ومصدات الرياح قبل وصول العاصفة.'
                            : 'Immediate instructions to inspect drainage culverts and secure tree supports before the storm peak.'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                      <span className="font-mono text-sky-400 font-bold">3.</span>
                      <div>
                        <strong className="text-white block font-semibold">
                          {isAr ? 'جدولة تقييم الأقمار الصناعية (Sentinel-2 Tasking):' : 'Queued Post-Storm Sentinel-2 Satellite Acquisition:'}
                        </strong>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {isAr
                            ? 'برمجة طلب تحديث تلقائي لصور الأقمار الصناعية فور انقضاء العاصفة لرصد تجمعات المياه الفائضة وحساب تراجع مؤشر NDVI.'
                            : 'Automated satellite pass queued to map flood pooling and spectral canopy deltas.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Commands Output Summary */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 font-mono pt-1">
                  <div className="flex items-center gap-2">
                    <Server className="w-3.5 h-3.5 text-slate-500" />
                    <span>Target: IoT_Irrigation_Controller</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span className="text-emerald-400 font-bold">STATUS: DISPATCHED</span>
                  </div>
                  <div className="text-slate-500">
                    Duration: 48 Hours
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
