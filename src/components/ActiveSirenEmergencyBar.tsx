import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  VolumeX, 
  Volume2, 
  Smartphone, 
  CheckCircle2, 
  MapPin, 
  ShieldAlert,
  Flame,
  Radio
} from 'lucide-react';
import { 
  stopContinuousSirenLoop, 
  isContinuousSirenActive, 
  getActiveContinuousAlert 
} from '../services/audioAlertService';
import { LanguageCode } from '../types';

interface ActiveSirenEmergencyBarProps {
  currentLanguage: LanguageCode;
  onOpenMobileNotificationsModal?: () => void;
}

export const ActiveSirenEmergencyBar: React.FC<ActiveSirenEmergencyBarProps> = ({
  currentLanguage,
  onOpenMobileNotificationsModal,
}) => {
  const [alertInfo, setAlertInfo] = useState<any>(null);
  const [countdown, setCountdown] = useState<number>(30);

  useEffect(() => {
    const handleStarted = (e: any) => {
      setAlertInfo(e.detail || getActiveContinuousAlert());
      setCountdown(e.detail?.durationSeconds || 30);
    };

    const handleStopped = () => {
      setAlertInfo(null);
    };

    const handleCountdown = (e: any) => {
      if (e.detail?.remainingSeconds !== undefined) {
        setCountdown(e.detail.remainingSeconds);
      }
    };

    window.addEventListener('farm:alert:started', handleStarted);
    window.addEventListener('farm:alert:stopped', handleStopped);
    window.addEventListener('farm:siren:countdown', handleCountdown);

    if (isContinuousSirenActive()) {
      setAlertInfo(getActiveContinuousAlert());
    }

    return () => {
      window.removeEventListener('farm:alert:started', handleStarted);
      window.removeEventListener('farm:alert:stopped', handleStopped);
      window.removeEventListener('farm:siren:countdown', handleCountdown);
    };
  }, []);

  if (!alertInfo || !alertInfo.isActive) {
    return null;
  }

  const handleStop = () => {
    stopContinuousSirenLoop();
    setAlertInfo(null);
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-bounce max-w-4xl mx-auto">
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white shadow-[0_0_50px_rgba(239,68,68,0.9)] border-3 border-yellow-300 ring-4 ring-red-500/50 flex flex-col md:flex-row md:items-center justify-between gap-3.5">
        
        {/* Threat Title & Pulsing Status */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0 animate-pulse border border-white/40">
            <ShieldAlert className="w-7 h-7 text-yellow-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider bg-black/40 text-yellow-300 px-2.5 py-0.5 rounded-full border border-yellow-300/40 animate-pulse">
                🚨 SIREN = ON ({countdown}s)
              </span>
              <span className="text-[10px] text-white/90 font-mono font-bold">
                Auto-shutoff in {countdown}s • High Priority
              </span>
            </div>
            <h4 className="text-base sm:text-lg font-black text-white leading-tight mt-0.5">
              {alertInfo.title || '🚨 WILD ANIMAL INTRUSION DETECTED!'}
            </h4>
            <div className="flex items-center gap-2 text-xs text-red-100 mt-0.5">
              <span className="flex items-center gap-1 text-yellow-200 font-bold">
                <Smartphone className="w-3.5 h-3.5" />
                <span>SMS Dispatched & Phone Vibrate</span>
              </span>
              <span>•</span>
              <span className="text-white/80">Kakinada, Andhra Pradesh</span>
            </div>
          </div>
        </div>

        {/* Action Controls: STOP SIREN & VIEW MOBILE NOTIFICATION */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {onOpenMobileNotificationsModal && (
            <button
              onClick={onOpenMobileNotificationsModal}
              className="px-3.5 py-2.5 rounded-2xl bg-black/40 hover:bg-black/60 text-white font-bold text-xs border border-white/30 flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <Smartphone className="w-4 h-4 text-cyan-300" />
              <span>Mobile SMS Details</span>
            </button>
          )}

          {/* STOP SIREN BUTTON */}
          <button
            onClick={handleStop}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-yellow-400 hover:bg-yellow-300 active:scale-95 text-slate-950 font-black text-sm shadow-2xl flex items-center justify-center gap-2 transition cursor-pointer border-2 border-white ring-2 ring-yellow-400/50"
          >
            <VolumeX className="w-5 h-5 text-red-600 stroke-[3]" />
            <span>🛑 STOP SIREN ALARM (ఆపండి)</span>
          </button>
        </div>

      </div>
    </div>
  );
};
