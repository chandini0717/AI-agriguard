import React, { useState } from 'react';
import { 
  CloudSun, 
  Thermometer, 
  Droplets, 
  Wind, 
  CloudRain, 
  SunMedium, 
  RefreshCw, 
  Volume2, 
  Radio, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle,
  Sparkles,
  Sprout
} from 'lucide-react';
import { WeatherData, LanguageCode } from '../types';
import { 
  speakDailyTemperatureUpdate, 
  evaluatePlantingSuitability,
  triggerTeluguAlarm, 
  triggerHindiAlarm 
} from '../services/audioAlertService';

interface TemperatureDailyViewProps {
  weather: WeatherData;
  locationName: string;
  isGpsLive: boolean;
  latitude: number | null;
  longitude: number | null;
  onRequestGps: () => void;
  onRefreshWeather: () => void;
  currentLanguage: LanguageCode;
}

export const TemperatureDailyView: React.FC<TemperatureDailyViewProps> = ({
  weather,
  locationName,
  isGpsLive,
  latitude,
  longitude,
  onRequestGps,
  onRefreshWeather,
  currentLanguage,
}) => {
  const [isPlayingBroadcast, setIsPlayingBroadcast] = useState(false);
  const [lastSpokenText, setLastSpokenText] = useState<string | null>(null);

  const maxTemp = weather.forecast[0]?.maxTemp || 34;
  const minTemp = weather.forecast[0]?.minTemp || 25;
  const plantingSuitability = evaluatePlantingSuitability(weather.temperature, weather.rainProbability);

  const handleBroadcast = (lang: LanguageCode = currentLanguage) => {
    setIsPlayingBroadcast(true);
    const spoken = speakDailyTemperatureUpdate({
      temperature: weather.temperature,
      maxTemp,
      minTemp,
      humidity: weather.humidity,
      rainStatus: weather.rainStatus,
      locationName,
      language: lang,
    });
    setLastSpokenText(spoken);
    setTimeout(() => {
      setIsPlayingBroadcast(false);
    }, 4500);
  };

  const languageOptions: { code: LanguageCode; label: string }[] = [
    { code: 'te', label: 'తెలుగు (Telugu)' },
    { code: 'hi', label: 'हिन्दी (Hindi)' },
    { code: 'ta', label: 'தமிழ் (Tamil)' },
    { code: 'kn', label: 'ಕನ್ನಡ (Kannada)' },
    { code: 'ml', label: 'മലയാളം (Malayalam)' },
    { code: 'mr', label: 'मराठी (Marathi)' },
    { code: 'bn', label: 'বাংলা (Bengali)' },
    { code: 'en', label: 'English' },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950 via-cyan-950/80 to-emerald-950 border-2 border-emerald-600 shadow-2xl text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center font-black">
            <Thermometer className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <span>Daily Temperature & GPS Microclimate</span>
              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold ${
                isGpsLive ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              }`}>
                {isGpsLive ? 'GPS Locked' : 'Regional Baseline'}
              </span>
            </h2>
            <p className="text-xs text-emerald-300/80 flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              <span>{locationName}</span>
              {latitude && longitude && (
                <span className="font-mono text-cyan-300">
                  ({latitude.toFixed(3)}°N, {longitude.toFixed(3)}°E)
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={onRequestGps}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs shadow-lg flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
          >
            <Radio className="w-4 h-4 animate-pulse" />
            <span>Update By Live GPS</span>
          </button>

          <button
            onClick={onRefreshWeather}
            className="p-2.5 rounded-xl bg-emerald-900/80 hover:bg-emerald-800 text-emerald-300 hover:text-white transition"
            title="Refresh weather station"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* PLANTING SUITABILITY TODAY: "IS IT GOOD TO WEAR/GROW A PLANT OR NOT TODAY" */}
      <div className={`p-6 rounded-3xl border-2 shadow-2xl space-y-3 ${
        plantingSuitability.isGood 
          ? 'bg-emerald-950/90 border-emerald-500 text-white' 
          : 'bg-amber-950/90 border-amber-500 text-white'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-white/10 gap-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{plantingSuitability.isGood ? '🌱' : '⚠️'}</span>
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-emerald-300 font-bold block">
                Agronomic Sowing & Planting Feasibility Verdict
              </span>
              <h3 className="text-xl font-black text-white">
                {plantingSuitability.verdictTitle}
              </h3>
            </div>
          </div>

          <button
            onClick={() => handleBroadcast(currentLanguage)}
            className={`px-4 py-2.5 rounded-2xl font-black text-xs flex items-center gap-2 shadow-lg transition active:scale-95 cursor-pointer ${
              isPlayingBroadcast 
                ? 'bg-yellow-300 text-slate-950 animate-pulse' 
                : 'bg-yellow-500 hover:bg-yellow-400 text-slate-950'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span>{isPlayingBroadcast ? 'Broadcasting...' : '🔊 Broadcast Planting Verdict Voice'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-1">
            <span className="font-bold text-amber-300 block">📢 తెలుగు వాతావరణం & మొక్కలు నాటే నివేదిక:</span>
            <p className="text-emerald-100 leading-relaxed font-medium">
              {plantingSuitability.teluguMessage}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-1">
            <span className="font-bold text-orange-300 block">📢 हिन्दी मौसम व पौधारोपण परामर्श:</span>
            <p className="text-emerald-100 leading-relaxed font-medium">
              {plantingSuitability.hindiMessage}
            </p>
          </div>
        </div>

        {lastSpokenText && (
          <p className="p-2.5 rounded-xl bg-black/50 text-[11px] text-yellow-300 italic border border-yellow-500/30">
            "{lastSpokenText}"
          </p>
        )}
      </div>

      {/* METEOROLOGICAL METRICS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div className="p-4 rounded-3xl bg-emerald-950/70 border border-emerald-800 text-white">
          <span className="text-[11px] text-emerald-400 font-bold block mb-1">Temperature</span>
          <div className="text-3xl font-black text-white">{weather.temperature}°C</div>
          <span className="text-[10px] text-emerald-300">High {maxTemp}° / Low {minTemp}°</span>
        </div>

        <div className="p-4 rounded-3xl bg-emerald-950/70 border border-emerald-800 text-white">
          <span className="text-[11px] text-cyan-400 font-bold block mb-1">Humidity</span>
          <div className="text-3xl font-black text-white">{weather.humidity}%</div>
          <span className="text-[10px] text-cyan-300">Optimal transpiration</span>
        </div>

        <div className="p-4 rounded-3xl bg-emerald-950/70 border border-emerald-800 text-white">
          <span className="text-[11px] text-blue-400 font-bold block mb-1">Rain Probability</span>
          <div className="text-3xl font-black text-white">{weather.rainProbability}%</div>
          <span className="text-[10px] text-blue-300">{weather.rainStatus}</span>
        </div>

        <div className="p-4 rounded-3xl bg-emerald-950/70 border border-emerald-800 text-white">
          <span className="text-[11px] text-amber-400 font-bold block mb-1">Wind Speed</span>
          <div className="text-3xl font-black text-white">{weather.windSpeed} km/h</div>
          <span className="text-[10px] text-amber-300">Safe for spraying</span>
        </div>
      </div>

      {/* MULTILINGUAL TEMPERATURE AUDITIONS */}
      <div className="p-5 rounded-3xl bg-emerald-950/80 border border-emerald-800 shadow-xl space-y-3">
        <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider block flex items-center gap-1.5">
          <Volume2 className="w-4 h-4 text-cyan-400" />
          <span>Listen to Daily Temperature & Planting Suitability in Your Own Language:</span>
        </span>
        <div className="flex flex-wrap items-center gap-2">
          {languageOptions.map(l => (
            <button
              key={l.code}
              onClick={() => handleBroadcast(l.code)}
              className="px-3 py-1.5 rounded-xl bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 hover:text-white border border-emerald-700/80 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
            >
              <Volume2 className="w-3.5 h-3.5 text-yellow-300" />
              <span>{l.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* DEDICATED ALARM DISPATCH */}
      <div className="p-5 rounded-3xl bg-red-950/60 border-2 border-red-700 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-base font-black text-white flex items-center gap-2">
            <span>🚨 Emergency Farm Alarms</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 font-mono">
              Siren + Voice
            </span>
          </h4>
          <p className="text-xs text-red-200/80 mt-0.5">
            Loud agricultural emergency warble siren with spoken vernacular warnings.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => triggerTeluguAlarm()}
            className="px-4 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-black text-xs shadow-lg flex items-center gap-1.5 active:scale-95 transition cursor-pointer"
          >
            <Volume2 className="w-4 h-4" />
            <span>📢 తెలుగు సైరన్ (TELUGU)</span>
          </button>

          <button
            onClick={() => triggerHindiAlarm()}
            className="px-4 py-2.5 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-black text-xs shadow-lg flex items-center gap-1.5 active:scale-95 transition cursor-pointer"
          >
            <Volume2 className="w-4 h-4" />
            <span>📢 हिन्दी सायरन (HINDI)</span>
          </button>
        </div>
      </div>

    </div>
  );
};
