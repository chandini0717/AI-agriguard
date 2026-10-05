import React from 'react';
import { 
  BarChart3, 
  Sprout, 
  Camera, 
  Cpu, 
  Bug, 
  PawPrint, 
  BellRing
} from 'lucide-react';
import { LanguageCode } from '../types';
import { TRANSLATIONS } from '../utils/translations';

interface FarmOverviewCardProps {
  totalCrops: number;
  activeCameras: number;
  connectedSensors: number;
  pestsDetectedToday: number;
  animalsDetectedToday: number;
  activeAlerts: number;
  currentLanguage: LanguageCode;
}

export const FarmOverviewCard: React.FC<FarmOverviewCardProps> = ({
  totalCrops,
  activeCameras,
  connectedSensors,
  pestsDetectedToday,
  animalsDetectedToday,
  activeAlerts,
  currentLanguage,
}) => {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;

  const kpis = [
    { label: 'Total Crops', val: totalCrops, icon: Sprout, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' },
    { label: 'Active Cameras', val: activeCameras, icon: Camera, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/30' },
    { label: 'Connected Sensors', val: connectedSensors, icon: Cpu, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/30' },
    { label: 'Pests Detected Today', val: pestsDetectedToday, icon: Bug, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/30' },
    { label: 'Animals Detected Today', val: animalsDetectedToday, icon: PawPrint, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' },
    { label: 'Active Alerts', val: activeAlerts, icon: BellRing, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30' },
  ];

  return (
    <div className="rounded-3xl bg-emerald-950/70 border border-emerald-800/80 p-5 shadow-xl text-white">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-emerald-800/70 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base tracking-tight text-white">
              📊 {t.farmOverview}
            </h3>
            <p className="text-[11px] text-emerald-300/70">
              Real-time connected farm telemetry and operational indicators
            </p>
          </div>
        </div>
        <span className="text-[11px] text-emerald-400 font-mono">
          System Status: Nominal
        </span>
      </div>

      {/* Grid of 6 KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className={`p-3.5 rounded-2xl border flex flex-col justify-between ${kpi.bg}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] text-emerald-200/90 font-medium leading-tight">
                  {kpi.label}
                </span>
                <Icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
              <div className="text-2xl font-black text-white font-mono">
                {kpi.val}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
