import React, { useState } from 'react';
import { 
  CloudSun, 
  Thermometer, 
  Droplets, 
  Wind, 
  CloudRain, 
  SunMedium, 
  RefreshCw,
  AlertCircle,
  Volume2,
  Radio,
  Sparkles
} from 'lucide-react';
import { WeatherData, LanguageCode } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import { speakDailyTemperatureUpdate } from '../services/audioAlertService';

interface WeatherCardProps {
  weather: WeatherData;
  onRefreshWeather?: () => void;
  currentLanguage: LanguageCode;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({
  weather,
  onRefreshWeather,
  currentLanguage,
}) => {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;
  const [activeTab, setActiveTab] = useState<'today' | 'tomorrow' | '5day'>('today');
  const [isPlayingBroadcast, setIsPlayingBroadcast] = useState(false);
  const [lastBroadcastText, setLastBroadcastText] = useState<string | null>(null);

  const maxTemp = weather.forecast[0]?.maxTemp || 34;
  const minTemp = weather.forecast[0]?.minTemp || 25;

  const handleBroadcast = (lang: LanguageCode = currentLanguage) => {
    setIsPlayingBroadcast(true);
    const text = speakDailyTemperatureUpdate({
      temperature: weather.temperature,
      maxTemp,
      minTemp,
      humidity: weather.humidity,
      rainStatus: weather.rainStatus,
      language: lang,
    });
    setLastBroadcastText(text);
    setTimeout(() => {
      setIsPlayingBroadcast(false);
    }, 4500);
  };

  const quickLanguages: { code: LanguageCode; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'te', label: 'తెలుగు (Telugu)' },
    { code: 'hi', label: 'हिन्दी (Hindi)' },
    { code: 'ta', label: 'தமிழ் (Tamil)' },
    { code: 'kn', label: 'ಕನ್ನಡ (Kannada)' },
  ];

  return (
    <div className="rounded-3xl bg-emerald-950/70 border border-emerald-800/80 p-5 shadow-xl text-white flex flex-col justify-between space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-emerald-800/70">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <CloudSun className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base tracking-tight flex items-center gap-2">
              {t.weather} & Daily Temperature
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                weather.isDemo 
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}>
                {weather.isDemo ? 'Demo Data' : 'Live Station'}
              </span>
            </h3>
            <p className="text-[11px] text-emerald-300/70">
              Native voice announcements with dedicated sound chimes for all languages
            </p>
          </div>
        </div>

        {onRefreshWeather && (
          <button 
            onClick={onRefreshWeather}
            className="p-2 rounded-xl bg-emerald-900/60 hover:bg-emerald-800 text-emerald-300 hover:text-white transition"
            title="Refresh weather"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Main Temperature & Microclimate Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-gradient-to-r from-emerald-900/50 via-cyan-950/40 to-emerald-900/50 p-4 rounded-2xl border border-emerald-800/80 gap-3">
        <div className="flex items-center gap-3">
          <SunMedium className="w-12 h-12 text-amber-400 animate-spin-slow flex-shrink-0" />
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                {weather.temperature}°C
              </span>
              <span className="text-xs text-emerald-300 font-mono">
                (High: {maxTemp}° / Low: {minTemp}°)
              </span>
            </div>
            <div className="text-xs text-emerald-200 font-medium">
              {weather.cloudCondition} • {weather.rainStatus}
            </div>
          </div>
        </div>

        {/* Prominent Daily Temperature Voice Broadcast Button */}
        <button
          onClick={() => handleBroadcast(currentLanguage)}
          className={`px-4 py-2.5 rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-lg transition active:scale-95 cursor-pointer ${
            isPlayingBroadcast
              ? 'bg-yellow-400 text-slate-950 ring-2 ring-yellow-300 animate-pulse'
              : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950'
          }`}
          title="Play voice weather announcement in currently selected language"
        >
          <Volume2 className="w-4 h-4" />
          <span>{isPlayingBroadcast ? 'Broadcasting Sound...' : '🔊 Play Temperature Update'}</span>
        </button>
      </div>

      {/* Language Quick Voice Audition */}
      <div className="p-2.5 rounded-2xl bg-emerald-900/30 border border-emerald-800/60">
        <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold block mb-1.5 flex items-center gap-1">
          <Radio className="w-3 h-3 text-cyan-400" />
          <span>Voice Temperature Broadcast in Any Language:</span>
        </span>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {quickLanguages.map(l => (
            <button
              key={l.code}
              onClick={() => handleBroadcast(l.code)}
              className="px-2.5 py-1 rounded-xl bg-emerald-950/80 hover:bg-emerald-800 border border-emerald-700/80 text-[11px] font-semibold text-emerald-200 hover:text-white whitespace-nowrap transition cursor-pointer flex items-center gap-1"
            >
              <Volume2 className="w-3 h-3 text-yellow-300" />
              <span>{l.label}</span>
            </button>
          ))}
        </div>
        {lastBroadcastText && (
          <p className="mt-1.5 text-[11px] text-emerald-300/90 italic bg-emerald-950/60 p-2 rounded-xl border border-emerald-800/80">
            "{lastBroadcastText}"
          </p>
        )}
      </div>

      {/* Forecast Tabs */}
      <div>
        <div className="flex items-center gap-1 mb-2">
          {(['today', 'tomorrow', '5day'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                activeTab === tab
                  ? 'bg-emerald-600 text-white shadow'
                  : 'bg-emerald-900/50 text-emerald-300 hover:bg-emerald-800'
              }`}
            >
              {tab === 'today' ? 'Today' : tab === 'tomorrow' ? 'Tomorrow' : 'Next 5 Days'}
            </button>
          ))}
        </div>

        {/* Forecast cards */}
        <div className="grid grid-cols-5 gap-1.5 text-center text-xs">
          {weather.forecast.slice(0, 5).map((f, i) => (
            <div
              key={i}
              className={`p-2 rounded-xl border flex flex-col items-center justify-between ${
                i === 0 && activeTab === 'today'
                  ? 'bg-emerald-800/80 border-emerald-500 font-bold'
                  : 'bg-emerald-900/40 border-emerald-800/70 text-emerald-200'
              }`}
            >
              <span className="text-[10px] text-emerald-300 uppercase font-mono">{f.day}</span>
              <span className="my-1 text-sm font-extrabold text-white">{f.maxTemp}°</span>
              <span className="text-[10px] text-blue-300 flex items-center gap-0.5">
                <CloudRain className="w-2.5 h-2.5" />
                {f.rainProb}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Agronomic Spray Advisory Note */}
      <div className="p-2 rounded-xl bg-emerald-900/40 border border-emerald-800/60 text-[11px] text-emerald-300 flex items-center gap-2">
        <AlertCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
        <span>
          {weather.windSpeed < 15 && weather.rainProbability < 40 
            ? '✅ Optimal conditions for foliar spray / bio-fertilizer application today.' 
            : '⚠️ Strong wind / rain anticipated; postpone spraying to avoid wash-off.'}
        </span>
      </div>

    </div>
  );
};
