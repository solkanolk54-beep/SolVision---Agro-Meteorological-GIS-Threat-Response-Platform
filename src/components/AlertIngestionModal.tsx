import React, { useState } from 'react';
import {
  Code,
  Play,
  Copy,
  Check,
  Radio,
  Layers,
  Database,
  Send,
  FileJson,
  CheckCircle2,
  RefreshCw,
  Terminal,
} from 'lucide-react';
import {
  WeatherAlertPayload,
  AutomatedActionResponse,
} from '../types/solvision.ts';
import { PRESET_ALERTS } from '../data/mockData.ts';

interface AlertIngestionModalProps {
  currentAlert: WeatherAlertPayload;
  onSelectAlert: (alert: WeatherAlertPayload) => void;
  onExecuteIntersectionQuery: () => void;
  lastExecutionResult: AutomatedActionResponse | null;
  lang: 'ar' | 'en';
}

export const AlertIngestionModal: React.FC<AlertIngestionModalProps> = ({
  currentAlert,
  onSelectAlert,
  onExecuteIntersectionQuery,
  lastExecutionResult,
  lang,
}) => {
  const isAr = lang === 'ar';
  const [selectedPresetKey, setSelectedPresetKey] = useState<string>('ESTOFEX-LEVEL1-MILA');
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [copiedResult, setCopiedResult] = useState(false);
  const [activeCodeTab, setActiveCodeTab] = useState<'payload' | 'sql' | 'response' | 'webhook'>('payload');
  const [isSimulatingPost, setIsSimulatingPost] = useState(false);

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(JSON.stringify(currentAlert, null, 2));
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  const handleCopyResult = () => {
    if (lastExecutionResult) {
      navigator.clipboard.writeText(JSON.stringify(lastExecutionResult, null, 2));
      setCopiedResult(true);
      setTimeout(() => setCopiedResult(false), 2000);
    }
  };

  const handleTriggerWebhook = () => {
    setIsSimulatingPost(true);
    setTimeout(() => {
      onExecuteIntersectionQuery();
      setIsSimulatingPost(false);
      setActiveCodeTab('response');
    }, 400);
  };

  return (
    <div className="space-y-6">
      {/* Header and Preset Selector */}
      <div className="bg-[#0e1828] p-5 rounded-2xl border border-slate-700/80 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-400" />
              <span>
                {isAr
                  ? 'بوابة سحب البيانات والـ Webhook (Data Ingestion & PostGIS Gateway)'
                  : 'Data Ingestion & PostGIS Spatial Intersection Gateway'}
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isAr
                ? 'استقبال بيانات الإنذارات الجوية من ESTOFEX ومطابقتها مكانياً مع القطع الفلاحية المسجلة عبر ST_Intersects'
                : 'Ingest convective weather alert polygons and perform spatial cross-intersection with farm assets'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTriggerWebhook}
              disabled={isSimulatingPost}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all cursor-pointer"
            >
              {isSimulatingPost ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4 fill-white" />
              )}
              <span>
                {isAr
                  ? 'تشغيل استعلام ST_Intersects والـ Webhook'
                  : 'Execute PostGIS ST_Intersects & Webhook'}
              </span>
            </button>
          </div>
        </div>

        {/* Preset Alert Selection Bar */}
        <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold">
            {isAr ? 'نماذج التنبيهات المسبقة:' : 'Preset Alerts:'}
          </span>

          {Object.entries(PRESET_ALERTS).map(([key, alertItem]) => {
            const isSelected = alertItem.alert_id === currentAlert.alert_id;
            return (
              <button
                key={key}
                onClick={() => {
                  setSelectedPresetKey(key);
                  onSelectAlert(alertItem);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all border ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-400 shadow-md shadow-emerald-600/30'
                    : 'bg-slate-900/80 text-slate-300 border-slate-700 hover:bg-slate-800'
                }`}
              >
                <span>{alertItem.alert_id}</span>
                <span className="opacity-75 text-[10px] ml-1">
                  (Level-{alertItem.severity_level})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Code / Query / Payloads Inspection Workbench */}
      <div className="bg-[#0b1422] rounded-2xl border border-slate-700/80 shadow-2xl overflow-hidden">
        {/* Sub-Tabs */}
        <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveCodeTab('payload')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeCodeTab === 'payload'
                  ? 'bg-slate-800 text-amber-400 font-bold border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileJson className="w-3.5 h-3.5" />
              <span>{isAr ? '1. هيكل التنبيه الوارد (Payload)' : '1. Incoming Alert Payload'}</span>
            </button>

            <button
              onClick={() => setActiveCodeTab('sql')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeCodeTab === 'sql'
                  ? 'bg-slate-800 text-sky-400 font-bold border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>{isAr ? '2. استعلام المطابقة المكانية (PostGIS SQL)' : '2. PostGIS ST_Intersects SQL'}</span>
            </button>

            <button
              onClick={() => setActiveCodeTab('response')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeCodeTab === 'response'
                  ? 'bg-slate-800 text-emerald-400 font-bold border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isAr ? '3. مخرجات محرك اتخاذ القرار (Response)' : '3. Action Response Payload'}</span>
            </button>

            <button
              onClick={() => setActiveCodeTab('webhook')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeCodeTab === 'webhook'
                  ? 'bg-slate-800 text-purple-400 font-bold border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>{isAr ? '4. كود Express Webhook' : '4. Express Webhook Code'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {activeCodeTab === 'payload' && (
              <button
                onClick={handleCopyPayload}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1"
              >
                {copiedPayload ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedPayload ? (isAr ? 'تم النسخ' : 'Copied') : (isAr ? 'نسخ JSON' : 'Copy')}</span>
              </button>
            )}

            {activeCodeTab === 'response' && lastExecutionResult && (
              <button
                onClick={handleCopyResult}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1"
              >
                {copiedResult ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedResult ? (isAr ? 'تم النسخ' : 'Copied') : (isAr ? 'نسخ الاستجابة' : 'Copy')}</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab 1: Incoming Alert Payload JSON */}
        {activeCodeTab === 'payload' && (
          <div className="p-4 bg-[#09111e] overflow-x-auto text-xs font-mono text-emerald-400" dir="ltr">
            <pre className="text-left font-mono">{JSON.stringify(currentAlert, null, 2)}</pre>
          </div>
        )}

        {/* Tab 2: PostGIS SQL Query */}
        {activeCodeTab === 'sql' && (
          <div className="p-4 bg-[#09111e] overflow-x-auto text-xs font-mono text-sky-300 space-y-3">
            <div className="text-slate-400 text-[11px] font-sans pb-2 border-b border-slate-800" dir={isAr ? 'rtl' : 'ltr'}>
              {isAr
                ? 'استعلام المطابقة المكانية في PostgreSQL + PostGIS لمطابقة مضلع العاصفة مع القطع الزراعية:'
                : 'PostGIS Spatial Intersection Query executed against agricultural parcels:'}
            </div>
            <pre className="text-blue-300 text-left font-mono" dir="ltr">
{`SELECT 
    p.parcel_id,
    p.owner_id,
    p.name AS parcel_name,
    p.slope_degree,
    p.crop_type,
    ST_AsGeoJSON(p.geom) AS parcel_geom
FROM 
    agricultural_parcels p
WHERE 
    ST_Intersects(
        p.geom, 
        ST_SetSRID(ST_GeomFromGeoJSON('${JSON.stringify(currentAlert.geometry)}'), 4326)
    );`}
            </pre>
          </div>
        )}

        {/* Tab 3: Action Response Output */}
        {activeCodeTab === 'response' && (
          <div className="p-4 bg-[#09111e] overflow-x-auto text-xs font-mono text-amber-300 space-y-3">
            <div className="flex items-center justify-between text-slate-400 text-[11px] font-sans pb-2 border-b border-slate-800" dir={isAr ? 'rtl' : 'ltr'}>
              <span>
                {isAr
                  ? 'مخرجات محرك اتخاذ القرار المؤتمت المرسلة عبر Microservices:'
                  : 'Automated Action Payload Generated by Decision Engine:'}
              </span>
              {lastExecutionResult && (
                <span className="text-emerald-400 font-bold">
                  {lastExecutionResult.matched_parcels_count} {isAr ? 'قطع أرض متأثرة' : 'parcels matched'}
                </span>
              )}
            </div>
            <pre className="text-emerald-300 text-left font-mono" dir="ltr">
              {JSON.stringify(lastExecutionResult, null, 2)}
            </pre>
          </div>
        )}

        {/* Tab 4: Express Webhook Endpoint Code */}
        {activeCodeTab === 'webhook' && (
          <div className="p-4 bg-[#09111e] overflow-x-auto text-xs font-mono text-purple-300 space-y-2">
            <div className="text-slate-400 text-[11px] font-sans pb-2 border-b border-slate-800" dir="ltr">
              POST /api/v1/solvision/weather-alert (routes/weatherWebhook.js)
            </div>
            <pre className="text-slate-300 text-left font-mono" dir="ltr">
{`// Express Webhook Endpoint for NWS / ESTOFEX Alerts
router.post('/api/v1/solvision/weather-alert', async (req, res) => {
  try {
    const alertData = req.body;

    if (!alertData.geometry || !alertData.alert_id) {
      return res.status(400).json({ error: 'Payload غير مكتمل البيانات المكانية' });
    }

    const result = await processIncomingWeatherAlert(alertData);

    return res.status(200).json({
      success: true,
      message: 'تمت معالجة التنبيه بنجاح وتنفيذ الإجراءات الميدانية المؤتمتة',
      data: result
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'حدث خطأ داخلي أثناء معالجة استعلام PostGIS'
    });
  }
});`}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
