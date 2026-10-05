import React from 'react';
import { 
  Bell, 
  Volume2, 
  AlertTriangle, 
  CheckCircle2, 
  Trash2, 
  Bug, 
  PawPrint, 
  Droplets, 
  CloudRain,
  CameraOff
} from 'lucide-react';
import { AlertItem, LanguageCode } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import { playAlertSound, speakVoiceAlert } from '../services/audioAlertService';

interface AlertsViewProps {
  alerts: AlertItem[];
  onClearAlerts: () => void;
  currentLanguage: LanguageCode;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  alerts,
  onClearAlerts,
  currentLanguage,
}) => {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'pest':
        return <Bug className="w-5 h-5 text-rose-400" />;
      case 'animal':
        return <PawPrint className="w-5 h-5 text-amber-400" />;
      case 'soil':
        return <Droplets className="w-5 h-5 text-cyan-400" />;
      case 'weather':
        return <CloudRain className="w-5 h-5 text-blue-400" />;
      default:
        return <CameraOff className="w-5 h-5 text-purple-400" />;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="p-6 rounded-3xl bg-emerald-950 border border-emerald-800 shadow-2xl text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/30">
            <Bell className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {t.recentAlerts} & Audio Dispatch
            </h2>
            <p className="text-xs text-emerald-300/80">
              Audible priority sirens and multilingual voice alerts archive
            </p>
          </div>
        </div>

        <button
          onClick={onClearAlerts}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-900/60 hover:bg-red-950/60 text-xs font-bold text-emerald-300 hover:text-red-300 border border-emerald-800 hover:border-red-700 transition"
        >
          <Trash2 className="w-4 h-4" />
          <span>Clear All</span>
        </button>
      </div>

      <div className="space-y-3">
        {alerts.map(alert => (
          <div
            key={alert.id}
            className={`p-4 rounded-3xl border shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition ${
              alert.severity === 'HIGH'
                ? 'bg-red-950/40 border-red-800/80'
                : alert.severity === 'WARNING'
                ? 'bg-amber-950/40 border-amber-800/80'
                : 'bg-emerald-950/60 border-emerald-800/80'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-2xl bg-black/40 border border-white/10 mt-0.5">
                {getAlertIcon(alert.type)}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-sm text-white">{alert.title}</h4>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    alert.severity === 'HIGH' ? 'bg-red-500 text-white' : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {alert.severity}
                  </span>
                </div>
                <p className="text-xs text-emerald-200/90 leading-relaxed max-w-2xl">
                  {alert.message}
                </p>
                <div className="flex items-center gap-3 text-[11px] text-emerald-400/80 font-mono">
                  <span>📍 {alert.location}</span>
                  <span>🕒 {alert.timestamp}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                playAlertSound(alert.severity);
                speakVoiceAlert(
                  currentLanguage === 'te' ? alert.teluguVoiceText : alert.englishVoiceText,
                  currentLanguage
                );
              }}
              className="px-4 py-2.5 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow active:scale-95 transition cursor-pointer self-end sm:self-center"
            >
              <Volume2 className="w-4 h-4" />
              <span>Broadcast Voice</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
