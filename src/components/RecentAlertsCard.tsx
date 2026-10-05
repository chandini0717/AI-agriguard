import React from 'react';
import { 
  Bell, 
  AlertTriangle, 
  Volume2, 
  CheckCircle2, 
  ExternalLink,
  Bug,
  PawPrint,
  Droplets,
  CloudRain,
  CameraOff,
  Radio
} from 'lucide-react';
import { AlertItem, LanguageCode } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import { playAlertSound, speakVoiceAlert } from '../services/audioAlertService';

interface RecentAlertsCardProps {
  alerts: AlertItem[];
  onViewAllAlerts: () => void;
  currentLanguage: LanguageCode;
}

export const RecentAlertsCard: React.FC<RecentAlertsCardProps> = ({
  alerts,
  onViewAllAlerts,
  currentLanguage,
}) => {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'pest':
        return <Bug className="w-4 h-4 text-rose-400" />;
      case 'animal':
        return <PawPrint className="w-4 h-4 text-amber-400" />;
      case 'soil':
        return <Droplets className="w-4 h-4 text-cyan-400" />;
      case 'weather':
        return <CloudRain className="w-4 h-4 text-blue-400" />;
      case 'camera':
        return <CameraOff className="w-4 h-4 text-orange-400" />;
      default:
        return <Radio className="w-4 h-4 text-purple-400" />;
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'HIGH':
        return 'bg-red-500/20 text-red-300 border-red-500/40';
      case 'WARNING':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      default:
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
    }
  };

  return (
    <div className="rounded-3xl bg-emerald-950/70 border border-emerald-800/80 p-5 shadow-xl text-white flex flex-col justify-between">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-emerald-800/70">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30">
            <Bell className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-extrabold text-base tracking-tight text-white flex items-center gap-2">
              {t.recentAlerts}
              <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 font-mono">
                {alerts.filter(a => a.severity === 'HIGH').length} Critical
              </span>
            </h3>
            <p className="text-[11px] text-emerald-300/70">
              Audible telemetry with dual Telugu/English voice dispatch
            </p>
          </div>
        </div>

        <button
          onClick={onViewAllAlerts}
          className="text-xs text-emerald-400 hover:text-white font-bold hover:underline"
        >
          {t.viewAllAlerts} →
        </button>
      </div>

      {/* Alerts Stream */}
      <div className="my-3 space-y-2.5 max-h-60 overflow-y-auto pr-1">
        {alerts.slice(0, 4).map(alert => (
          <div
            key={alert.id}
            className={`p-3 rounded-2xl border text-xs transition flex flex-col justify-between gap-1.5 ${
              alert.severity === 'HIGH'
                ? 'bg-red-950/40 border-red-800/80'
                : alert.severity === 'WARNING'
                ? 'bg-amber-950/40 border-amber-800/80'
                : 'bg-emerald-900/40 border-emerald-800/70'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-white">
                {getAlertIcon(alert.type)}
                <span>{alert.title}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold border ${getSeverityBadge(alert.severity)}`}>
                  {alert.severity}
                </span>
                <span className="text-[10px] font-mono text-emerald-300/70">
                  {alert.timestamp}
                </span>
              </div>
            </div>

            <p className="text-emerald-200/90 leading-relaxed">
              {alert.message}
            </p>

            {currentLanguage === 'te' && alert.teluguVoiceText && (
              <p className="text-[11px] text-emerald-300 font-medium">
                🔊 {alert.teluguVoiceText}
              </p>
            )}

            <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[10px]">
              <span className="text-emerald-300/80">📍 {alert.location}</span>
              <button
                onClick={() => {
                  playAlertSound(alert.severity);
                  speakVoiceAlert(
                    currentLanguage === 'te' ? alert.teluguVoiceText : alert.englishVoiceText,
                    currentLanguage
                  );
                }}
                className="text-yellow-300 hover:text-white font-bold flex items-center gap-1 cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" /> Play Voice Alert
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="text-[11px] text-emerald-300/80 pt-2 border-t border-emerald-800/60 flex items-center justify-between">
        <span>Click "Play Voice Alert" for spoken vernacular broadcast.</span>
      </div>

    </div>
  );
};
