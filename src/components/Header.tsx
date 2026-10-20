import React from 'react';
import {
  CloudLightning,
  ShieldCheck,
  Radio,
  Satellite,
  Layers,
  Activity,
  Languages,
  Flame,
} from 'lucide-react';
import { WeatherAlertPayload } from '../types/solvision.ts';

interface HeaderProps {
  currentAlert: WeatherAlertPayload;
  lang: 'ar' | 'en';
  onToggleLang: () => void;
  activeTab: 'gis' | 'risk' | 'iot' | 'satellite' | 'webhook';
  onSelectTab: (tab: 'gis' | 'risk' | 'iot' | 'satellite' | 'webhook') => void;
  matchedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentAlert,
  lang,
  onToggleLang,
  activeTab,
  onSelectTab,
  matchedCount,
}) => {
  const isAr = lang === 'ar';

  return (
    <header className="bg-[#0b1422] border-b border-[#1e2e42] sticky top-0 z-50 backdrop-blur-md bg-opacity-95 text-white">
      {/* Top Threat Ticker / Banner */}
      <div className="bg-gradient-to-r from-amber-950/80 via-red-950/80 to-amber-950/80 border-b border-amber-500/30 px-4 py-1.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <span className="font-bold text-amber-300">
            {isAr ? 'إنذار جوي نشط [ESTOFEX Level-1]:' : 'Active Weather Threat [ESTOFEX Level-1]:'}
          </span>
          <span className="text-slate-300">
            <span className="font-mono">{currentAlert.alert_id}</span> | {isAr ? 'عاصفة رعدية + رياح هابطة قوية + أمطار غزيرة' : 'Thunderstorm & Severe Downburst Hazard'}
          </span>
        </div>
        <div className="flex items-center gap-4 text-slate-400 hidden sm:flex">
          <span>
            {isAr ? 'حوض ميلة الفلاحي (Mila Basin)' : 'Mila Agricultural Basin'}
          </span>
          <span className="text-amber-400 font-semibold">
            {isAr ? `القطع المتقاطعة: ${matchedCount}` : `Matched Parcels: ${matchedCount}`}
          </span>
          <span className="text-slate-400">
            {isAr ? (
              <>صالح حتى: <span className="font-mono">{new Date(currentAlert.valid_until).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></>
            ) : (
              <span className="font-mono">Valid Until: {currentAlert.valid_until}</span>
            )}
          </span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 border border-emerald-400/40">
            <CloudLightning className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-wide bg-gradient-to-r from-emerald-400 via-teal-200 to-sky-400 bg-clip-text text-transparent">
                SolVision
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-600/40">
                Agro-GIS v2.6
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden md:block">
              {isAr
                ? 'منظومة الاستشعار الزراعي والرصد المكاني للتهديدات المناخية'
                : 'Agro-Meteorological Threat Intelligence & IoT Automation Platform'}
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => onSelectTab('gis')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'gis'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 border border-emerald-400/50'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{isAr ? 'الخريطة التفاعلية GIS' : 'GIS Map & PostGIS'}</span>
          </button>

          <button
            onClick={() => onSelectTab('risk')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'risk'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30 border border-amber-400/50'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{isAr ? 'محرك المخاطر DEM' : 'Risk & DEM Engine'}</span>
          </button>

          <button
            onClick={() => onSelectTab('iot')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'iot'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30 border border-sky-400/50'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>{isAr ? 'أتمتة الري IoT' : 'IoT Kill-Switch'}</span>
          </button>

          <button
            onClick={() => onSelectTab('satellite')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'satellite'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 border border-indigo-400/50'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Satellite className="w-3.5 h-3.5" />
            <span>{isAr ? 'أقمار Sentinel-2' : 'Sentinel-2 & Fungi'}</span>
          </button>

          <button
            onClick={() => onSelectTab('webhook')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'webhook'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 border border-purple-400/50'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isAr ? 'الـ Webhook وقاعدة البيانات' : 'Webhook & PostGIS'}</span>
            <span className="sm:hidden">{isAr ? 'الـ Webhook' : 'API'}</span>
          </button>
        </nav>

        {/* Language & Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleLang}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs font-bold flex items-center gap-1 text-slate-200 transition-colors"
            title={isAr ? 'تبديل إلى الإنجليزية' : 'Switch to Arabic'}
          >
            <Languages className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isAr ? 'English' : 'عربي'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
