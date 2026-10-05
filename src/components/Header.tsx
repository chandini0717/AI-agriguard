import React, { useEffect, useState } from 'react';
import { 
  ShieldCheck, 
  MapPin, 
  Thermometer, 
  Droplets, 
  CloudRain, 
  Radio, 
  Bell, 
  Volume2, 
  VolumeX, 
  Globe, 
  AlertTriangle,
  CheckCircle2,
  X,
  Camera,
  Smartphone
} from 'lucide-react';
import { LanguageCode, AlertItem } from '../types';
import { APP_LANGUAGES, TRANSLATIONS } from '../utils/translations';
import { playAlertSound, speakVoiceAlert, triggerTeluguAlarm, triggerHindiAlarm } from '../services/audioAlertService';

interface HeaderProps {
  currentLanguage: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  locationName: string;
  isGpsLive: boolean;
  onToggleGps: () => void;
  temperature: number;
  humidity: number;
  rainStatus: string;
  alerts: AlertItem[];
  onOpenCropByName?: (cropName: string) => void;
  onNavigate?: (tab: string) => void;
  onOpenCamera?: () => void;
  onOpenMobileNotifications?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLanguage,
  onLanguageChange,
  locationName,
  isGpsLive,
  onToggleGps,
  temperature,
  humidity,
  rainStatus,
  alerts,
  onNavigate,
  onOpenCamera,
  onOpenMobileNotifications
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastSoundPlayed, setLastSoundPlayed] = useState<string | null>(null);

  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;
  const unreadAlerts = alerts.filter(a => !a.read);

  useEffect(() => {
    let noticeTimeout = 0;
    const showSpeechNotice = (event: Event, message: string) => {
      const language = (event as CustomEvent<{ language?: LanguageCode }>).detail?.language;
      if (language !== 'te') return;
      setLastSoundPlayed(message);
      window.clearTimeout(noticeTimeout);
      noticeTimeout = window.setTimeout(() => setLastSoundPlayed(null), 8000);
    };
    const handleSpeechUnavailable = (event: Event) => {
      showSpeechNotice(event, 'తెలుగు వాయిస్ అందుబాటులో లేదు. పరికరంలో తెలుగు text-to-speech వాయిస్‌ను ఇన్‌స్టాల్ చేయండి.');
    };
    const handleSpeechError = (event: Event) => {
      showSpeechNotice(event, 'తెలుగు ఆడియో ప్లే కాలేదు. పరికరంలోని text-to-speech సెట్టింగ్‌లను తనిఖీ చేయండి.');
    };
    window.addEventListener('farm:speech:unavailable', handleSpeechUnavailable);
    window.addEventListener('farm:speech:error', handleSpeechError);
    return () => {
      window.clearTimeout(noticeTimeout);
      window.removeEventListener('farm:speech:unavailable', handleSpeechUnavailable);
      window.removeEventListener('farm:speech:error', handleSpeechError);
    };
  }, []);

  const handleTestDirectSiren = () => {
    playAlertSound('HIGH');
    const msg = currentLanguage === 'te' 
      ? 'హెచ్చరిక! అత్యవసర అలారం పరీక్షించబడింది.' 
      : 'Alert! High priority farm alarm siren triggered directly.';
    speakVoiceAlert(msg, currentLanguage);
    setLastSoundPlayed('High Siren Sound Triggered');
    setTimeout(() => setLastSoundPlayed(null), 3000);
  };

  return (
    <header className="sticky top-0 z-40 bg-emerald-950/90 text-white backdrop-blur-md border-b border-emerald-800/60 shadow-lg transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-2 sm:gap-4">
          
          {/* Logo & App Title */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate && onNavigate('dashboard')}>
            <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-600 shadow-emerald-500/30 shadow-lg text-emerald-950 font-bold border border-emerald-300/40">
              <ShieldCheck className="w-7 h-7 text-emerald-950" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-300"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-200 via-emerald-400 to-green-300 bg-clip-text text-transparent">
                  {t.appTitle}
                </h1>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  v2.6 AI Core
                </span>
              </div>
              <p className="text-xs text-emerald-300/80 font-medium hidden sm:block">
                {t.appSubtitle}
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar (Farm Location, Temp, Humidity, Rain, GPS) */}
          <div className="hidden lg:flex items-center gap-2 bg-emerald-900/60 border border-emerald-800 rounded-xl p-1.5 shadow-inner">
            {/* Location */}
            <button 
              onClick={onToggleGps}
              title="Click to toggle GPS / live location"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-emerald-800/80 transition text-xs font-medium text-emerald-200 group"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="max-w-[130px] truncate">{locationName}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${isGpsLive ? 'bg-emerald-500/30 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                {isGpsLive ? 'GPS' : 'Demo'}
              </span>
            </button>

            <div className="w-px h-5 bg-emerald-800"></div>

            {/* Temperature */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-emerald-100 font-semibold">
              <Thermometer className="w-3.5 h-3.5 text-amber-400" />
              <span>{temperature}°C</span>
            </div>

            <div className="w-px h-5 bg-emerald-800"></div>

            {/* Humidity */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-emerald-100 font-semibold">
              <Droplets className="w-3.5 h-3.5 text-cyan-400" />
              <span>{humidity}%</span>
            </div>

            <div className="w-px h-5 bg-emerald-800"></div>

            {/* Rain Status */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-emerald-100 font-semibold">
              <CloudRain className="w-3.5 h-3.5 text-blue-400" />
              <span>{rainStatus}</span>
            </div>

            <div className="w-px h-5 bg-emerald-800"></div>

            {/* GPS Status */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-emerald-200">
              <Radio className={`w-3.5 h-3.5 ${isGpsLive ? 'text-emerald-400 animate-pulse' : 'text-amber-400'}`} />
              <span className="font-mono text-[11px]">{isGpsLive ? t.connected : t.demoData}</span>
            </div>
          </div>

          {/* Right Action Icons: Camera, Direct Sound Siren, Multilingual Selector, Notifications Bell */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Direct Camera Access Button */}
            {onOpenCamera && (
              <button
                onClick={onOpenCamera}
                className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-emerald-950 text-xs font-black shadow-md shadow-emerald-950/40 border border-emerald-300/40 active:scale-95 transition cursor-pointer"
                title="Launch Live Camera Scanner"
              >
                <Camera className="w-4 h-4 text-emerald-950" />
                <span>CAMERA</span>
              </button>
            )}

            {/* Farmer Mobile Alert / SMS Gateway Button */}
            {onOpenMobileNotifications && (
              <button
                onClick={onOpenMobileNotifications}
                className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-black shadow-md border border-cyan-300/40 active:scale-95 transition cursor-pointer"
                title="Farmer Mobile Alert & SMS System"
              >
                <Smartphone className="w-4 h-4 text-yellow-300 animate-pulse" />
                <span>MOBILE SMS</span>
              </button>
            )}

            {/* Direct Sound Siren Button */}
            <button
              onClick={handleTestDirectSiren}
              className="relative flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600/90 to-rose-700/90 hover:from-red-500 hover:to-rose-600 text-white text-xs font-bold shadow-md border border-red-400/40 active:scale-95 transition"
              title="Test immediate loud siren alarm sound & speech notification directly"
            >
              <Volume2 className="w-3.5 h-3.5 animate-bounce text-yellow-300" />
              <span>SIREN</span>
            </button>

            {/* Telugu Alarm Button */}
            <button
              onClick={() => triggerTeluguAlarm(locationName)}
              className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-600/80 hover:bg-amber-500 text-white text-xs font-bold shadow border border-amber-400/50 active:scale-95 transition cursor-pointer"
              title="Play Telugu Siren & Voice Alarm"
            >
              <Volume2 className="w-3.5 h-3.5 text-yellow-200" />
              <span>తెలుగు అలారం</span>
            </button>

            {/* Hindi Alarm Button */}
            <button
              onClick={() => triggerHindiAlarm(locationName)}
              className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-orange-600/80 hover:bg-orange-500 text-white text-xs font-bold shadow border border-orange-400/50 active:scale-95 transition cursor-pointer"
              title="Play Hindi Siren & Voice Alarm"
            >
              <Volume2 className="w-3.5 h-3.5 text-yellow-200" />
              <span>हिन्दी अलार्म</span>
            </button>

            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsLanguageMenuOpen(open => !open)}
                aria-haspopup="menu"
                aria-expanded={isLanguageMenuOpen}
                aria-label={t.language}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-900/80 hover:bg-emerald-800 border border-emerald-700/60 text-xs font-semibold text-emerald-100 transition"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-medium">
                  {APP_LANGUAGES.find(l => l.code === currentLanguage)?.native || 'English'}
                </span>
              </button>
              {isLanguageMenuOpen && (
              <div role="menu" className="absolute right-0 mt-1 w-44 bg-emerald-950 border border-emerald-700/80 rounded-xl shadow-2xl py-1.5 z-50 animate-in fade-in slide-in-from-top-1">
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400/80 border-b border-emerald-800/60 mb-1">
                  {t.language}
                </div>
                {APP_LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    type="button"
                    role="menuitemradio"
                    aria-checked={currentLanguage === lang.code}
                    onClick={() => {
                      onLanguageChange(lang.code);
                      setIsLanguageMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-emerald-800/70 transition ${
                      currentLanguage === lang.code ? 'bg-emerald-800 text-emerald-300 font-bold' : 'text-slate-200'
                    }`}
                  >
                    <span>{lang.native}</span>
                    <span className="text-[10px] text-emerald-400/70">{lang.label}</span>
                  </button>
                ))}
              </div>
              )}
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-xl bg-emerald-900/80 hover:bg-emerald-800 border border-emerald-700/60 text-emerald-200 hover:text-white transition"
                title="View farm notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadAlerts.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-emerald-950">
                    {unreadAlerts.length}
                  </span>
                )}
              </button>

              {/* Notification Drawer Popover */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-emerald-950/95 border border-emerald-700 rounded-2xl shadow-2xl p-4 z-50 backdrop-blur-xl">
                  <div className="flex items-center justify-between pb-3 border-b border-emerald-800">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-emerald-400" />
                      <h3 className="text-sm font-bold text-white">{t.notifications}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-800 text-emerald-300 font-mono">
                        {alerts.length}
                      </span>
                    </div>
                    <button 
                      onClick={() => setShowNotifications(false)}
                      className="text-emerald-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mt-3 space-y-2.5 max-h-80 overflow-y-auto pr-1">
                    {alerts.slice(0, 6).map(alert => (
                      <div 
                        key={alert.id}
                        className={`p-3 rounded-xl border text-xs transition ${
                          alert.severity === 'HIGH' 
                            ? 'bg-red-950/40 border-red-800/80 text-red-200' 
                            : alert.severity === 'WARNING'
                            ? 'bg-amber-950/40 border-amber-800/80 text-amber-200'
                            : 'bg-emerald-900/40 border-emerald-800/80 text-emerald-200'
                        }`}
                      >
                        <div className="flex items-center justify-between font-semibold mb-1">
                          <span className="flex items-center gap-1.5">
                            {alert.severity === 'HIGH' && <AlertTriangle className="w-3.5 h-3.5 text-red-400" />}
                            {alert.title}
                          </span>
                          <span className="text-[10px] font-mono opacity-70">{alert.timestamp}</span>
                        </div>
                        <p className="opacity-90">{alert.message}</p>
                        {alert.teluguVoiceText && currentLanguage === 'te' && (
                          <p className="mt-1 text-emerald-300 font-medium">{alert.teluguVoiceText}</p>
                        )}
                        <div className="mt-2 flex items-center justify-between pt-1 border-t border-white/10 text-[10px]">
                          <span>📍 {alert.location}</span>
                          <button
                            onClick={() => {
                              playAlertSound(alert.severity);
                              speakVoiceAlert(currentLanguage === 'te' ? alert.teluguVoiceText : alert.englishVoiceText, currentLanguage);
                            }}
                            className="text-emerald-300 hover:underline flex items-center gap-1"
                          >
                            <Volume2 className="w-3 h-3" /> Speak Alert
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 pt-2 border-t border-emerald-800 flex justify-between">
                    <button
                      onClick={() => {
                        setShowNotifications(false);
                        onNavigate && onNavigate('alerts');
                      }}
                      className="text-xs font-medium text-emerald-400 hover:text-emerald-300 hover:underline"
                    >
                      {t.viewAllAlerts} →
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* Floating sound notification banner if triggered */}
      {lastSoundPlayed && (
        <div className="bg-red-600 text-white text-xs font-bold py-1 px-4 text-center flex items-center justify-center gap-2 animate-pulse">
          <Volume2 className="w-4 h-4" />
          <span>LOUD ALARM SOUND ACTIVATED: {lastSoundPlayed}</span>
        </div>
      )}
    </header>
  );
};
