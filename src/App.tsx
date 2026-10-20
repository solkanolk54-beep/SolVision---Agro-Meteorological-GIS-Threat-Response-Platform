/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Header } from './components/Header.tsx';
import { GisMap } from './components/GisMap.tsx';
import { RiskAnalyticsPanel } from './components/RiskAnalyticsPanel.tsx';
import { AutomationCenter } from './components/AutomationCenter.tsx';
import { PostStormAssessmentView } from './components/PostStormAssessmentView.tsx';
import { AlertIngestionModal } from './components/AlertIngestionModal.tsx';
import { ParcelDetailsCard } from './components/ParcelDetailsCard.tsx';
import {
  INITIAL_PARCELS,
  INITIAL_CORRIDORS,
  INITIAL_IOT_DEVICES,
  PRESET_ALERTS,
  INITIAL_WEATHER_LOGS,
  INITIAL_POST_STORM_ASSESSMENT,
} from './data/mockData.ts';
import {
  WeatherAlertPayload,
  AgriculturalParcel,
  IoTDevice,
  AutomatedActionResponse,
} from './types/solvision.ts';
import { processWeatherAlert } from './services/spatialEngine.ts';
import {
  Layers,
  Activity,
  Radio,
  Satellite,
  Code,
  Play,
  ShieldAlert,
  Droplet,
  Power,
  RotateCcw,
} from 'lucide-react';

export default function App() {
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [activeTab, setActiveTab] = useState<'gis' | 'risk' | 'iot' | 'satellite' | 'webhook'>('gis');

  // Application state
  const [currentAlert, setCurrentAlert] = useState<WeatherAlertPayload>(
    PRESET_ALERTS['ESTOFEX-LEVEL1-MILA']
  );
  const [parcels, setParcels] = useState<AgriculturalParcel[]>(INITIAL_PARCELS);
  const [corridors, setCorridors] = useState(INITIAL_CORRIDORS);
  const [iotDevices, setIotDevices] = useState<IoTDevice[]>(INITIAL_IOT_DEVICES);
  const [selectedParcelId, setSelectedParcelId] = useState<string>('PRC-MILA-01');
  const [historyLogs, setHistoryLogs] = useState(INITIAL_WEATHER_LOGS);
  const [postStormAssessment, setPostStormAssessment] = useState(INITIAL_POST_STORM_ASSESSMENT);

  // Execute PostGIS spatial intersection and automated response engine
  const executionResult: AutomatedActionResponse = useMemo(() => {
    return processWeatherAlert(currentAlert, parcels, corridors, iotDevices);
  }, [currentAlert, parcels, corridors, iotDevices]);

  // Toggle language
  const toggleLanguage = () => {
    const nextLang = lang === 'ar' ? 'en' : 'ar';
    setLang(nextLang);
    document.documentElement.dir = nextLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = nextLang;
  };

  // Toggle IoT Kill Switch for a device
  const handleToggleIoTKillSwitch = (deviceId: string) => {
    setIotDevices((prev) =>
      prev.map((device) => {
        if (device.device_id === deviceId) {
          const nextStatus = device.status === 'PAUSED' ? 'ACTIVE' : 'PAUSED';
          return {
            ...device,
            status: nextStatus,
            paused_until: nextStatus === 'PAUSED' ? currentAlert.valid_until : null,
          };
        }
        return device;
      })
    );

    // Also update associated parcel status
    const targetDevice = iotDevices.find((d) => d.device_id === deviceId);
    if (targetDevice) {
      setParcels((prev) =>
        prev.map((p) => {
          if (p.parcel_id === targetDevice.parcel_id) {
            return {
              ...p,
              current_irrigation_status:
                p.current_irrigation_status === 'PAUSED' ? 'ACTIVE' : 'PAUSED',
            };
          }
          return p;
        })
      );
    }
  };

  // Trigger automated kill switch on all intersected parcels
  const handleTriggerAllKillSwitches = () => {
    const matchedParcelIds = executionResult.actions_triggered.map((a) => a.parcel_id);

    setIotDevices((prev) =>
      prev.map((device) => {
        if (matchedParcelIds.includes(device.parcel_id)) {
          return {
            ...device,
            status: 'PAUSED',
            paused_until: currentAlert.valid_until,
          };
        }
        return device;
      })
    );

    setParcels((prev) =>
      prev.map((p) => {
        if (matchedParcelIds.includes(p.parcel_id)) {
          return {
            ...p,
            current_irrigation_status: 'PAUSED',
          };
        }
        return p;
      })
    );
  };

  // Currently selected parcel object
  const selectedParcel = parcels.find((p) => p.parcel_id === selectedParcelId) || parcels[0];
  const selectedAction = executionResult.actions_triggered.find(
    (a) => a.parcel_id === selectedParcel.parcel_id
  );
  const selectedDevice = iotDevices.find((d) => d.parcel_id === selectedParcel.parcel_id);

  const isAr = lang === 'ar';

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      className="min-h-screen bg-[#080e18] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-black"
    >
      {/* Top Header */}
      <Header
        currentAlert={currentAlert}
        lang={lang}
        onToggleLang={toggleLanguage}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        matchedCount={executionResult.matched_parcels_count}
      />

      {/* Main App Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Quick Threat & Spatial Status HUD */}
        <div className="bg-[#0b1424] p-4 rounded-2xl border border-slate-800 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">
                  {isAr ? 'محرك التقاطع المكاني (PostGIS Spatial Engine):' : 'PostGIS Spatial Intersection Engine:'}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 font-mono border border-emerald-500/40 font-bold">
                  ST_Intersects ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {isAr
                  ? `تم رصد ${executionResult.matched_parcels_count} قطع زراعية متقاطعة، و${executionResult.matched_corridors_count} محاور لوجستية، و${executionResult.matched_iot_count} أجهزة استشعار`
                  : `Intersected ${executionResult.matched_parcels_count} agricultural plots, ${executionResult.matched_corridors_count} supply corridors, and ${executionResult.matched_iot_count} IoT nodes`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTriggerAllKillSwitches}
              className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Power className="w-4 h-4" />
              <span>
                {isAr ? 'تفعيل Kill-Switch لكافة القطع المتأثرة' : 'Trigger Kill-Switch All'}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('webhook')}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Code className="w-4 h-4 text-purple-400" />
              <span>{isAr ? 'استعراض Webhook / SQL' : 'View Webhook / SQL'}</span>
            </button>
          </div>
        </div>

        {/* Tab 1: GIS Map View */}
        {activeTab === 'gis' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 8 Cols: Map */}
            <div className="lg:col-span-8 space-y-4">
              <GisMap
                alert={currentAlert}
                parcels={parcels}
                corridors={corridors}
                iotDevices={iotDevices}
                selectedParcelId={selectedParcelId}
                onSelectParcel={setSelectedParcelId}
                onToggleIoTKillSwitch={handleToggleIoTKillSwitch}
                lang={lang}
              />
            </div>

            {/* Right 4 Cols: Selected Parcel & Actions Sidebar */}
            <div className="lg:col-span-4 space-y-4">
              <ParcelDetailsCard
                parcel={selectedParcel}
                matchedAction={selectedAction}
                iotDevice={selectedDevice}
                onToggleKillSwitch={handleToggleIoTKillSwitch}
                lang={lang}
              />

              {/* Quick Preset Alert Switcher Card */}
              <div className="bg-[#0e1828] p-4 rounded-2xl border border-slate-700/80 shadow-lg space-y-3">
                <span className="text-xs font-bold text-white block">
                  {isAr ? 'اختبار سيناريوهات الإنذار (Convective Scenarios):' : 'Simulate Threat Scenarios:'}
                </span>

                <div className="space-y-1.5">
                  {Object.entries(PRESET_ALERTS).map(([key, alertItem]) => (
                    <button
                      key={key}
                      onClick={() => setCurrentAlert(alertItem)}
                      className={`w-full text-left rtl:text-right p-2.5 rounded-xl text-xs font-medium transition-all border flex items-center justify-between ${
                        alertItem.alert_id === currentAlert.alert_id
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50 font-bold'
                          : 'bg-slate-900/60 text-slate-300 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      <div>
                        <div className="font-mono text-[11px]">{alertItem.alert_id}</div>
                        <div className="text-[10px] text-slate-400">
                          {alertItem.severity_level === 1
                            ? isAr
                              ? 'عاصفة رعدية + رياح هابطة (Level 1)'
                              : 'Thunderstorm & Downburst (Level 1)'
                            : alertItem.severity_level === 2
                            ? isAr
                              ? 'سوبرسيل عنيفة وبرَد كثيف (Level 2)'
                              : 'Severe Supercell Squall (Level 2)'
                            : isAr
                            ? 'سيول جارفة وأمطار طوفانية (Level 3)'
                            : 'Flash Flood Torrential (Level 3)'}
                        </div>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          alertItem.severity_level >= 2
                            ? 'bg-red-950 text-red-300'
                            : 'bg-amber-950 text-amber-300'
                        }`}
                      >
                        Lvl-{alertItem.severity_level}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Risk Analytics & DEM Runoff Engine */}
        {activeTab === 'risk' && (
          <RiskAnalyticsPanel
            parcels={parcels}
            selectedParcelId={selectedParcelId}
            onSelectParcel={setSelectedParcelId}
            alert={currentAlert}
            matchedActions={executionResult.actions_triggered}
            lang={lang}
          />
        )}

        {/* Tab 3: IoT Automation & Kill-Switch Center */}
        {activeTab === 'iot' && (
          <AutomationCenter
            iotDevices={iotDevices}
            onToggleKillSwitch={handleToggleIoTKillSwitch}
            matchedActions={executionResult.actions_triggered}
            alert={currentAlert}
            lang={lang}
          />
        )}

        {/* Tab 4: Post-Storm Assessment, Sentinel-2 & Fungal Predictor */}
        {activeTab === 'satellite' && (
          <PostStormAssessmentView
            assessment={postStormAssessment}
            historyLogs={historyLogs}
            parcels={parcels}
            lang={lang}
          />
        )}

        {/* Tab 5: Data Ingestion & Webhook Workbench */}
        {activeTab === 'webhook' && (
          <AlertIngestionModal
            currentAlert={currentAlert}
            onSelectAlert={setCurrentAlert}
            onExecuteIntersectionQuery={() => {}}
            lastExecutionResult={executionResult}
            lang={lang}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800 bg-[#070d17] text-slate-500 py-4 px-6 text-xs text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            {isAr
              ? 'SolVision Agro-GIS Platform © 2026 - رصد التهديدات الجوية وأتمتة الاستجابة الميدانية الذكية'
              : 'SolVision Agro-GIS Platform © 2026 - Spatial Threat Intelligence & Automated Response'}
          </span>
          <span className="font-mono text-emerald-500">
            PostGIS ST_Intersects • DEM Kinematic Runoff • Sentinel-2 Multispectral
          </span>
        </div>
      </footer>
    </div>
  );
}
