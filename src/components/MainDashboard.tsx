import React, { useState } from 'react';
import { 
  Sprout, 
  PlusCircle, 
  Bug, 
  Camera, 
  ArrowRight, 
  Sparkles, 
  Thermometer, 
  MapPin, 
  Volume2, 
  Radio, 
  SunMedium, 
  Droplets, 
  CloudRain, 
  AlertTriangle,
  Calendar,
  CheckCircle2,
  TrendingUp,
  Clock,
  Smartphone,
  Send,
  PawPrint,
  Flame
} from 'lucide-react';
import { 
  CropItem, 
  LanguageCode, 
  WeatherData, 
  SoilHealthData, 
  AlertItem 
} from '../types';
import { TRANSLATIONS } from '../utils/translations';
import { CropCard } from './CropCard';
import { WeatherCard } from './WeatherCard';
import { SoilHealthCard } from './SoilHealthCard';
import { FarmLocationCard } from './FarmLocationCard';
import { CropHealthCard } from './CropHealthCard';
import { RecentAlertsCard } from './RecentAlertsCard';
import { FarmOverviewCard } from './FarmOverviewCard';
import { FutureTemperatureCalendarModal } from './FutureTemperatureCalendarModal';
import { 
  triggerTeluguAlarm, 
  triggerHindiAlarm, 
  speakDailyTemperatureUpdate,
  speakFutureCalendarForecast,
  dispatchMobilePushAndSms
} from '../services/audioAlertService';

interface MainDashboardProps {
  crops: CropItem[];
  onOpenCrop: (crop: CropItem) => void;
  onRemoveCrop: (cropId: string) => void;
  onOpenAddModal: () => void;
  onOpenCamera?: () => void;
  weather: WeatherData;
  onRefreshWeather: () => void;
  soil: SoilHealthData;
  onUpdateSoil: (updated: SoilHealthData) => void;
  isGpsLive: boolean;
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  locationName: string;
  onRequestGps: () => void;
  alerts: AlertItem[];
  onViewAllAlerts: () => void;
  onNavigateToTab: (tab: string) => void;
  currentLanguage: LanguageCode;
}

export const MainDashboard: React.FC<MainDashboardProps> = ({
  crops,
  onOpenCrop,
  onRemoveCrop,
  onOpenAddModal,
  onOpenCamera,
  weather,
  onRefreshWeather,
  soil,
  onUpdateSoil,
  isGpsLive,
  latitude,
  longitude,
  accuracy,
  locationName,
  onRequestGps,
  alerts,
  onViewAllAlerts,
  onNavigateToTab,
  currentLanguage,
}) => {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;
  const maxTemp = weather.forecast[0]?.maxTemp || 34;
  const minTemp = weather.forecast[0]?.minTemp || 25;

  const [isFutureCalendarOpen, setIsFutureCalendarOpen] = useState(false);

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-200">
      
      {/* ================================================== */}
      {/* 1. SEPARATE PROMINENT GPS TEMPERATURE & FUTURE CALENDAR ACCESS */}
      {/* ================================================== */}
      <section className="p-6 rounded-3xl bg-gradient-to-br from-emerald-950 via-cyan-950/70 to-emerald-950 border-2 border-emerald-500/60 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-emerald-800/80 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center font-black">
              <Thermometer className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Live GPS Temperature & Weather
                </h2>
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold ${
                  isGpsLive ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}>
                  {isGpsLive ? 'GPS Locked' : 'Regional Baseline'}
                </span>
              </div>
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

          {/* Action Buttons: 1. GPS Temperature, 2. FUTURE CALENDAR BUTTON */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onRequestGps}
              className="px-4 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs shadow-lg flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer border border-cyan-300/50"
            >
              <Radio className="w-4 h-4 animate-pulse" />
              <span>📍 GET TEMPERATURE BY LIVE GPS</span>
            </button>

            {/* DEDICATED FUTURE TEMPERATURE DATES CALENDAR BUTTON */}
            <button
              onClick={() => setIsFutureCalendarOpen(true)}
              className="px-4 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xs shadow-lg flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer border border-amber-200"
            >
              <Calendar className="w-4 h-4 text-slate-950" />
              <span>📅 FUTURE TEMPERATURE CALENDAR (OK TO PLANT)</span>
            </button>
          </div>
        </div>

        {/* Temperature Reading & Native Voice Broadcast Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          
          {/* Temperature Tile */}
          <div className="p-4 rounded-2xl bg-emerald-900/40 border border-emerald-800 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-emerald-300 font-semibold block">Current Temperature</span>
              <div className="text-3xl font-black text-white mt-0.5">{weather.temperature}°C</div>
              <span className="text-[10px] text-emerald-400 font-mono">High: {maxTemp}° / Low: {minTemp}°</span>
            </div>
            <SunMedium className="w-10 h-10 text-amber-400 animate-spin-slow" />
          </div>

          {/* Humidity Tile */}
          <div className="p-4 rounded-2xl bg-emerald-900/40 border border-emerald-800 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-cyan-300 font-semibold block">Relative Humidity</span>
              <div className="text-3xl font-black text-white mt-0.5">{weather.humidity}%</div>
              <span className="text-[10px] text-cyan-400 font-mono">Transpiration safe</span>
            </div>
            <Droplets className="w-10 h-10 text-cyan-400" />
          </div>

          {/* Rain Status Tile */}
          <div className="p-4 rounded-2xl bg-emerald-900/40 border border-emerald-800 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-blue-300 font-semibold block">Rain Forecast</span>
              <div className="text-2xl font-black text-white mt-0.5">{weather.rainStatus}</div>
              <span className="text-[10px] text-blue-400 font-mono">Chance: {weather.rainProbability}%</span>
            </div>
            <CloudRain className="w-10 h-10 text-blue-400" />
          </div>

          {/* Native Audio Broadcast Tile */}
          <div className="p-4 rounded-2xl bg-emerald-900/40 border border-emerald-800 flex flex-col justify-between space-y-2">
            <span className="text-[11px] text-yellow-300 font-bold block flex items-center gap-1">
              <Volume2 className="w-3.5 h-3.5" />
              <span>Voice Temperature Dispatch:</span>
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => speakDailyTemperatureUpdate({
                  temperature: weather.temperature,
                  maxTemp,
                  minTemp,
                  humidity: weather.humidity,
                  rainStatus: weather.rainStatus,
                  locationName,
                  language: 'te',
                })}
                className="px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/40 border border-amber-500/40 text-amber-300 text-[11px] font-bold cursor-pointer transition"
              >
                🔊 తెలుగు
              </button>
              <button
                onClick={() => speakDailyTemperatureUpdate({
                  temperature: weather.temperature,
                  maxTemp,
                  minTemp,
                  humidity: weather.humidity,
                  rainStatus: weather.rainStatus,
                  locationName,
                  language: 'hi',
                })}
                className="px-2.5 py-1 rounded-xl bg-orange-500/20 hover:bg-orange-500/40 border border-orange-500/40 text-orange-300 text-[11px] font-bold cursor-pointer transition"
              >
                🔊 हिन्दी
              </button>
              <button
                onClick={() => speakDailyTemperatureUpdate({
                  temperature: weather.temperature,
                  maxTemp,
                  minTemp,
                  humidity: weather.humidity,
                  rainStatus: weather.rainStatus,
                  locationName,
                  language: 'en',
                })}
                className="px-2.5 py-1 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/40 border border-cyan-500/40 text-cyan-300 text-[11px] font-bold cursor-pointer transition"
              >
                🔊 English
              </button>
            </div>
          </div>

        </div>

        {/* TELUGU & HINDI ALARMS (ANNOUNCES THE ACTUAL GPS LOCATION) */}
        <div className="p-4 rounded-2xl bg-red-950/60 border border-red-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-600 text-white animate-pulse">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-black text-sm text-white flex items-center gap-2">
                <span>Emergency Alarm Siren & GPS Spoken Voice</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 font-mono">
                  Siren + GPS Location Voice
                </span>
              </h4>
              <p className="text-[11px] text-red-200/80">
                Announces the emergency siren with your exact GPS location in Telugu or Hindi.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* TELUGU ALARM BUTTON WITH GPS LOCATION ANNOUNCEMENT */}
            <button
              onClick={() => triggerTeluguAlarm(locationName)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white font-black text-xs shadow-lg flex items-center gap-1.5 transition active:scale-95 cursor-pointer border border-amber-300/40"
            >
              <Volume2 className="w-4 h-4 animate-bounce text-yellow-200" />
              <span>📢 తెలుగు అలారం (GPS స్థానం వాయిస్)</span>
            </button>

            {/* HINDI ALARM BUTTON WITH GPS LOCATION ANNOUNCEMENT */}
            <button
              onClick={() => triggerHindiAlarm(locationName)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-400 hover:to-rose-500 text-white font-black text-xs shadow-lg flex items-center gap-1.5 transition active:scale-95 cursor-pointer border border-orange-300/40"
            >
              <Volume2 className="w-4 h-4 animate-bounce text-yellow-200" />
              <span>📢 हिन्दी अलार्म (GPS स्थान वॉइस)</span>
            </button>
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* 2. FIELD OWNER MOBILE SMS ALERT GATEWAY CARD */}
      {/* ================================================== */}
      <section className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950 via-teal-950 to-emerald-950 border-2 border-cyan-500/70 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-emerald-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center font-black shadow-lg">
              <Smartphone className="w-7 h-7 text-yellow-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-white">
                  📱 Field Owner Mobile SMS Alert System
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold">
                  AUTO-SMS ACTIVE 🟢
                </span>
              </div>
              <p className="text-xs text-emerald-300/80">
                AI camera & sensor detections automatically dispatch direct SMS to the owner in <strong>Telugu (తెలుగు)</strong>, <strong>Hindi (हिन्दी)</strong>, and <strong>English</strong>.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateToTab('mobile-sms')}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs shadow cursor-pointer transition active:scale-95"
          >
            <span>Open SMS Dashboard & Settings</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Test 1-Tap Trigger Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          <button
            onClick={() => {
              dispatchMobilePushAndSms({
                crop: crops[0]?.name || 'Tomato',
                problem: 'Severe Fruit Borer / Insect Attack',
                severity: 'HIGH',
                location: locationName,
                recommendedAction: 'Inspect underside of foliage and spray neem bio-pesticide.',
                category: 'pest',
                language: currentLanguage,
                isHealthy: false,
              });
            }}
            className="p-3 rounded-2xl bg-red-950/80 hover:bg-red-900 border border-red-700/80 text-white font-bold text-xs flex flex-col justify-between cursor-pointer active:scale-95 transition shadow"
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-base">🐛</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-600 text-white font-bold">CRITICAL</span>
            </div>
            <div className="text-left mt-2">
              <div className="font-extrabold text-[11px] text-red-200">Pest Attack SMS</div>
              <div className="text-[9px] text-red-300/70 truncate">Dispatches to registered phone</div>
            </div>
          </button>

          <button
            onClick={() => {
              dispatchMobilePushAndSms({
                crop: crops[0]?.name || 'Tomato',
                problem: 'Spotted Deer Approaching Perimeter',
                severity: 'HIGH',
                location: locationName,
                recommendedAction: 'Trigger acoustic sirens and check field boundary fence.',
                category: 'animal',
                language: currentLanguage,
                isHealthy: false,
              });
            }}
            className="p-3 rounded-2xl bg-amber-950/80 hover:bg-amber-900 border border-amber-700/80 text-white font-bold text-xs flex flex-col justify-between cursor-pointer active:scale-95 transition shadow"
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-base">🦌 / 🐄</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-600 text-white font-bold">URGENT</span>
            </div>
            <div className="text-left mt-2">
              <div className="font-extrabold text-[11px] text-amber-200">Animal Alert SMS</div>
              <div className="text-[9px] text-amber-300/70 truncate">Dispatches to registered phone</div>
            </div>
          </button>

          <button
            onClick={() => {
              dispatchMobilePushAndSms({
                crop: crops[0]?.name || 'Tomato',
                problem: 'Low Soil Moisture (18% - Dehydration)',
                severity: 'HIGH',
                location: locationName,
                recommendedAction: 'Initiate drip irrigation immediately for 45 minutes.',
                category: 'soil',
                language: currentLanguage,
                isHealthy: false,
              });
            }}
            className="p-3 rounded-2xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-700/80 text-white font-bold text-xs flex flex-col justify-between cursor-pointer active:scale-95 transition shadow"
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-base">💧</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-600 text-slate-950 font-bold">WARNING</span>
            </div>
            <div className="text-left mt-2">
              <div className="font-extrabold text-[11px] text-cyan-200">Low Moisture SMS</div>
              <div className="text-[9px] text-cyan-300/70 truncate">Dispatches to registered phone</div>
            </div>
          </button>

          <button
            onClick={() => {
              dispatchMobilePushAndSms({
                crop: crops[0]?.name || 'Tomato',
                problem: 'High Temperature Stress (38.5°C Heatwave)',
                severity: 'HIGH',
                location: locationName,
                recommendedAction: 'Apply evening irrigation and protect canopy.',
                category: 'weather',
                language: currentLanguage,
                isHealthy: false,
              });
            }}
            className="p-3 rounded-2xl bg-purple-950/80 hover:bg-purple-900 border border-purple-700/80 text-white font-bold text-xs flex flex-col justify-between cursor-pointer active:scale-95 transition shadow"
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-base">🌡️</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-600 text-white font-bold">HIGH HEAT</span>
            </div>
            <div className="text-left mt-2">
              <div className="font-extrabold text-[11px] text-purple-200">High Temp SMS</div>
              <div className="text-[9px] text-purple-300/70 truncate">Dispatches to registered phone</div>
            </div>
          </button>
        </div>
      </section>

      {/* ================================================== */}
      {/* 3. MY CROPS SECTION WITH + ADD NEW BUTTON */}
      {/* ================================================== */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-emerald-800/80 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <span>🌱 {t.myCrops}</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                  {crops.length} Active Fields
                </span>
              </h2>
              <p className="text-xs text-emerald-300/80">
                Individual field sensors, pest detection logs, and microclimate telemetry
              </p>
            </div>
          </div>

          {/* Prominent Large "+ ADD NEW" Button */}
          <button
            onClick={onOpenAddModal}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 hover:from-emerald-400 hover:to-green-400 text-emerald-950 font-black text-sm shadow-xl shadow-emerald-950/60 flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer border border-emerald-300/40"
          >
            <PlusCircle className="w-5 h-5 stroke-[2.5]" />
            <span>{t.addNewCrop}</span>
          </button>
        </div>

        {/* Crops Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {crops.map(crop => (
            <CropCard
              key={crop.id}
              crop={crop}
              onOpenCrop={onOpenCrop}
              onRemoveCrop={onRemoveCrop}
              currentLanguage={currentLanguage}
            />
          ))}

          {/* Quick Add Blank Card */}
          <div
            onClick={onOpenAddModal}
            className="rounded-3xl border-2 border-dashed border-emerald-800/80 hover:border-emerald-500 bg-emerald-950/40 hover:bg-emerald-900/40 p-6 flex flex-col items-center justify-center text-center cursor-pointer transition group min-h-[300px]"
          >
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 group-hover:bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3 transition">
              <PlusCircle className="w-7 h-7" />
            </div>
            <h3 className="font-extrabold text-sm text-white group-hover:text-emerald-300 transition">
              {t.addNewCrop}
            </h3>
            <p className="text-xs text-emerald-300/70 mt-1 max-w-[200px]">
              Add Grape, Cotton, Wheat, Sugarcane, Brinjal or any supported crop.
            </p>
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* 2-COLUMN MODULAR CARD GRID: WEATHER & SOIL */}
      {/* ================================================== */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WeatherCard
          weather={weather}
          onRefreshWeather={onRefreshWeather}
          currentLanguage={currentLanguage}
        />

        <SoilHealthCard
          soilData={soil}
          onUpdateSoilData={onUpdateSoil}
          currentLanguage={currentLanguage}
        />
      </section>

      {/* ================================================== */}
      {/* 2-COLUMN MODULAR CARD GRID: FARM LOCATION & FUTURE CALENDAR PREVIEW */}
      {/* ================================================== */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Farm Location Card */}
        <FarmLocationCard
          isGpsLive={isGpsLive}
          latitude={latitude}
          longitude={longitude}
          accuracy={accuracy}
          locationName={locationName}
          onRequestGps={onRequestGps}
          currentLanguage={currentLanguage}
        />

        {/* FUTURE TEMPERATURE DATES CALENDAR CARD (REPLACED ANIMAL PROTECTION) */}
        <div className="p-6 rounded-3xl bg-emerald-950/80 border border-emerald-700/80 shadow-2xl flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-emerald-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">
                  Future Temperature Dates Calendar
                </h3>
                <p className="text-xs text-emerald-300/80">
                  Daily forecast dates and agronomic planting suitability
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsFutureCalendarOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold text-xs flex items-center gap-1 shadow"
            >
              <span>Open Calendar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick upcoming dates preview with OK TO PLANT status */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            {weather.forecast.slice(0, 3).map((f, i) => {
              const isOkToPlant = f.maxTemp >= 20 && f.maxTemp <= 34 && f.rainProb < 55;
              return (
                <div key={i} className="p-3 rounded-2xl bg-black/50 border border-emerald-700/80 text-center flex flex-col justify-between">
                  <span className="font-bold text-emerald-300 block text-[11px]">{f.day}</span>
                  <span className="text-xl font-black text-white block my-1">{f.maxTemp}°C</span>
                  <span className="text-[10px] text-cyan-300 font-mono mb-2">Rain: {f.rainProb}%</span>
                  <span className={`py-0.5 px-1.5 rounded-full text-[9px] font-black uppercase tracking-tight shadow ${
                    isOkToPlant ? 'bg-emerald-500 text-slate-950' : 'bg-rose-600 text-white'
                  }`}>
                    {isOkToPlant ? '✅ OK TO PLANT' : '❌ NOT OK'}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-emerald-800 text-xs text-emerald-300">
            <button
              onClick={() => setIsFutureCalendarOpen(true)}
              className="text-xs text-emerald-300 hover:text-white flex items-center gap-1.5 font-bold cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Click to View Full 14-Day Calendar (OK to Plant)</span>
            </button>
            <button
              onClick={() => speakFutureCalendarForecast(weather.forecast, locationName, currentLanguage)}
              className="text-xs text-yellow-300 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Listen Telugu / Hindi</span>
            </button>
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* AI PEST & DISEASE QUICK SCAN BANNER */}
      {/* ================================================== */}
      <section className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950 via-emerald-900/80 to-emerald-950 border border-emerald-700/80 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center flex-shrink-0">
            <Bug className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono font-bold">
                Computer Vision Model
              </span>
              <span className="text-xs text-emerald-400 font-mono">MobileNet & CNN Inference</span>
            </div>
            <h3 className="text-xl font-black text-white tracking-tight mt-1">
              AI Crop Disease & Spoilage Diagnostic Engine
            </h3>
            <p className="text-xs text-emerald-200/80 leading-relaxed max-w-xl">
              Upload leaf images or video to classify crop spoilage, calculate severity, and retrieve concrete suggestions to develop your crop.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0">
          {onOpenCamera && (
            <button
              onClick={onOpenCamera}
              className="px-4 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-emerald-950 font-black text-xs shadow-lg flex items-center gap-2 transition active:scale-95 cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>📷 OPEN LIVE CAMERA</span>
            </button>
          )}

          <button
            onClick={() => onNavigateToTab('crop-problems')}
            className="px-4 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs shadow-lg flex items-center gap-2 transition active:scale-95 cursor-pointer"
          >
            <AlertTriangle className="w-4 h-4 text-slate-950" />
            <span>Crop Problems & Auto-Siren</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onNavigateToTab('video-surveillance')}
            className="px-4 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white font-extrabold text-xs shadow-lg flex items-center gap-2 transition active:scale-95 cursor-pointer"
          >
            <Bug className="w-4 h-4" />
            <span>Video & Animal Detector</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* ================================================== */}
      {/* 2-COLUMN MODULAR CARD GRID: CROP HEALTH & RECENT ALERTS */}
      {/* ================================================== */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CropHealthCard
          crops={crops}
          onOpenCrop={onOpenCrop}
          currentLanguage={currentLanguage}
        />

        <RecentAlertsCard
          alerts={alerts}
          onViewAllAlerts={onViewAllAlerts}
          currentLanguage={currentLanguage}
        />
      </section>

      {/* ================================================== */}
      {/* FARM OVERVIEW METRICS CARD */}
      {/* ================================================== */}
      <section>
        <FarmOverviewCard
          totalCrops={crops.length}
          activeCameras={crops.filter(c => c.activeCamera).length + 2}
          connectedSensors={crops.reduce((acc, c) => acc + c.connectedSensors, 0)}
          pestsDetectedToday={alerts.filter(a => a.type === 'pest').length}
          animalsDetectedToday={0}
          activeAlerts={alerts.filter(a => a.severity === 'HIGH').length}
          currentLanguage={currentLanguage}
        />
      </section>

      {/* FUTURE TEMPERATURE DATES CALENDAR MODAL */}
      <FutureTemperatureCalendarModal
        isOpen={isFutureCalendarOpen}
        onClose={() => setIsFutureCalendarOpen(false)}
        weather={weather}
        locationName={locationName}
        currentLanguage={currentLanguage}
      />

    </div>
  );
};
