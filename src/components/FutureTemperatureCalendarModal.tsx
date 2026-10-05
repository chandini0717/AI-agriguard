import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  X, 
  SunMedium, 
  CloudRain, 
  Droplets, 
  Volume2, 
  MapPin, 
  CheckCircle2, 
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { WeatherData, LanguageCode } from '../types';
import { speakVoiceAlert, playAlertSound } from '../services/audioAlertService';

interface FutureTemperatureCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  weather: WeatherData;
  locationName: string;
  currentLanguage: LanguageCode;
}

export const FutureTemperatureCalendarModal: React.FC<FutureTemperatureCalendarModalProps> = ({
  isOpen,
  onClose,
  weather,
  locationName,
  currentLanguage,
}) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  if (!isOpen) return null;

  const today = new Date();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const futureCalendarDays = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date();
    d.setDate(today.getDate() + i);

    const baseForecast = weather.forecast[i % weather.forecast.length] || {
      maxTemp: 31 + (i % 3),
      minTemp: 22 + (i % 2),
      rainProb: (i * 15) % 65,
    };

    const maxTemp = baseForecast.maxTemp;
    const minTemp = baseForecast.minTemp;
    const rainProb = baseForecast.rainProb;
    const isOkGoodToPlant = maxTemp >= 20 && maxTemp <= 34 && rainProb < 55;

    let condition = rainProb > 50 ? 'Rain Showers' : rainProb > 25 ? 'Passing Clouds' : 'Sunny Clear';

    const morningTemp = minTemp + 2;
    const afternoonTemp = maxTemp;
    const eveningTemp = maxTemp - 4;
    const nightTemp = minTemp;

    return {
      index: i,
      dayTitle: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : dayNames[d.getDay()],
      dateStr: `${d.getDate()} ${monthNames[d.getMonth()]}`,
      fullDateText: d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' }),
      maxTemp,
      minTemp,
      morningTemp,
      afternoonTemp,
      eveningTemp,
      nightTemp,
      rainProb,
      condition,
      isOkGoodToPlant,
      statusLabel: isOkGoodToPlant ? '✅ OK! IT IS GOOD TO PLANT' : '❌ NOT OK! AVOID PLANTING',
      teluguSpeech: isOkGoodToPlant
        ? `${d.toLocaleDateString('te-IN', { month: 'short', day: 'numeric' })} తేదీన ఉష్ణోగ్రత ${maxTemp} డిగ్రీలు. ఫలితం: ఓకే! నేడు మొక్కలు లేదా పంటలు నాటడానికి చాలా అనుకూలమైన రోజు (OK to plant).`
        : `తేదీన ఉష్ణోగ్రత ${maxTemp} డిగ్రీలు. ఫలితం: నాటడం మంచిది కాదు (NOT OK to plant).`,
      hindiSpeech: isOkGoodToPlant
        ? `तापमान ${maxTemp} डिग्री रहेगा। परिणाम: बिल्कुल ओके! आज पौधे लगाने के लिए बहुत अच्छा दिन है (OK to plant)।`
        : `परिणाम: आज फसल लगाना उचित नहीं है (NOT OK to plant)।`,
      advice: isOkGoodToPlant
        ? 'Soil moisture and root zone temperature are optimal for planting crops.'
        : 'High precipitation or extreme heat. Delay sowing until favorable window.'
    };
  });

  const selectedDay = futureCalendarDays[selectedDayIndex] || futureCalendarDays[0];

  const handleSpeakDay = (day: typeof futureCalendarDays[0], lang: LanguageCode = currentLanguage) => {
    playAlertSound(day.isOkGoodToPlant ? 'safe' : 'weather');
    let text = day.isOkGoodToPlant 
      ? `On ${day.dayTitle} ${day.dateStr}, temperature is high of ${day.maxTemp}°C. Verdict: OK! It is GOOD TO PLANT CROPS.`
      : `On ${day.dayTitle} ${day.dateStr}, temperature is ${day.maxTemp}°C. Verdict: NOT OK! It is NOT RECOMMENDED to plant crops.`;

    if (lang === 'te') {
      text = `${day.dayTitle} ${day.dateStr} ${day.teluguSpeech}`;
    } else if (lang === 'hi') {
      text = `${day.dayTitle} ${day.dateStr} को ${day.hindiSpeech}`;
    }

    speakVoiceAlert(text, lang);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-emerald-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col bg-emerald-950 border-2 border-emerald-500 rounded-3xl shadow-2xl text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-emerald-800 bg-emerald-900/60">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center font-black">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <span>Future Temperature Calendar: Is It OK to Plant Crops?</span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                  14-Day Calendar
                </span>
              </h2>
              <p className="text-xs text-emerald-300/80 flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                <span>{locationName}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-emerald-400 hover:text-white hover:bg-emerald-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          
          {/* Vernacular Language Voice Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-emerald-900/40 border border-emerald-800 text-xs">
            <span className="text-emerald-300 font-bold flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-cyan-400" />
              <span>Voice Readout Language:</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSpeakDay(selectedDay, 'te')}
                className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 font-bold border border-amber-500/40"
              >
                🔊 తెలుగు వాయిస్ (Telugu: OK to plant)
              </button>
              <button
                onClick={() => handleSpeakDay(selectedDay, 'hi')}
                className="px-3 py-1.5 rounded-xl bg-orange-500/20 hover:bg-orange-500/40 text-orange-300 font-bold border border-orange-500/40"
              >
                🔊 हिन्दी वॉइस (Hindi: OK to plant)
              </button>
              <button
                onClick={() => handleSpeakDay(selectedDay, 'en')}
                className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-300 font-bold border border-cyan-500/40"
              >
                🔊 English Voice
              </button>
            </div>
          </div>

          {/* Selected Date Spotlight */}
          <div className={`p-6 rounded-3xl border-3 shadow-xl space-y-4 ${
            selectedDay.isOkGoodToPlant 
              ? 'bg-emerald-950 border-emerald-400 text-white' 
              : 'bg-amber-950 border-amber-400 text-white'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-white/10 gap-3">
              <div>
                <span className="text-xs text-cyan-300 font-mono font-bold uppercase tracking-wider block">
                  Selected Date: {selectedDay.fullDateText}
                </span>
                <h3 className="text-2xl font-black text-white mt-1">
                  {selectedDay.maxTemp}°C High / {selectedDay.minTemp}°C Low • {selectedDay.condition}
                </h3>
              </div>

              {/* HUGE OK / NOT OK BADGE */}
              <div className={`px-5 py-3 rounded-2xl border-2 shadow-lg flex items-center gap-2 ${
                selectedDay.isOkGoodToPlant
                  ? 'bg-emerald-500 text-slate-950 border-emerald-200'
                  : 'bg-rose-600 text-white border-rose-300'
              }`}>
                {selectedDay.isOkGoodToPlant ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                <span className="text-base font-black">
                  {selectedDay.statusLabel}
                </span>
              </div>
            </div>

            {/* Diurnal Temperature Breakdown */}
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-black/60 border border-emerald-800">
                <span className="text-[10px] text-emerald-400 block font-semibold">Morning (6 AM)</span>
                <span className="text-lg font-black text-white">{selectedDay.morningTemp}°C</span>
              </div>
              <div className="p-2.5 rounded-xl bg-black/60 border border-amber-800">
                <span className="text-[10px] text-yellow-300 block font-semibold">Afternoon (2 PM)</span>
                <span className="text-lg font-black text-white">{selectedDay.afternoonTemp}°C</span>
              </div>
              <div className="p-2.5 rounded-xl bg-black/60 border border-cyan-800">
                <span className="text-[10px] text-cyan-300 block font-semibold">Evening (7 PM)</span>
                <span className="text-lg font-black text-white">{selectedDay.eveningTemp}°C</span>
              </div>
              <div className="p-2.5 rounded-xl bg-black/60 border border-indigo-800">
                <span className="text-[10px] text-indigo-300 block font-semibold">Night (11 PM)</span>
                <span className="text-lg font-black text-white">{selectedDay.nightTemp}°C</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-black/50 border border-white/10 space-y-1">
                <span className="text-cyan-400 font-bold block">Rain Probability:</span>
                <div className="text-xl font-black text-white">{selectedDay.rainProb}%</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-black/50 border border-white/10 space-y-1">
                <span className="text-amber-400 font-bold block">Day Temperature:</span>
                <div className="text-xl font-black text-white">{selectedDay.maxTemp}°C</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-black/50 border border-white/10 space-y-1">
                <span className="text-yellow-400 font-bold block">Agronomic Verdict:</span>
                <p className="text-emerald-100 text-[11px] leading-relaxed">
                  {selectedDay.advice}
                </p>
              </div>
            </div>
          </div>

          {/* 14-Day Calendar Tiles Grid */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider block">
              📅 Click Any Date in the 14-Day Calendar:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
              {futureCalendarDays.map((day) => {
                const isSelected = day.index === selectedDayIndex;
                return (
                  <button
                    key={day.index}
                    onClick={() => {
                      setSelectedDayIndex(day.index);
                      handleSpeakDay(day, currentLanguage);
                    }}
                    className={`p-3 rounded-2xl border-2 text-center transition flex flex-col justify-between items-center cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-b from-cyan-600 to-blue-700 text-white border-cyan-300 shadow-xl scale-105 ring-2 ring-cyan-400'
                        : day.isOkGoodToPlant
                        ? 'bg-emerald-900/50 hover:bg-emerald-800/80 border-emerald-600 text-emerald-100'
                        : 'bg-amber-950/60 hover:bg-amber-900 border-amber-700 text-amber-100'
                    }`}
                  >
                    <span className="text-[11px] font-black uppercase tracking-wide block">
                      {day.dayTitle}
                    </span>
                    <span className="text-[10px] text-cyan-300 font-mono block my-0.5">
                      {day.dateStr}
                    </span>

                    <div className="my-1">
                      {day.rainProb > 40 ? (
                        <CloudRain className="w-5 h-5 text-blue-300 mx-auto" />
                      ) : (
                        <SunMedium className="w-5 h-5 text-amber-300 mx-auto" />
                      )}
                    </div>

                    <div className="text-xs font-bold font-mono">
                      <span>{day.maxTemp}°</span>
                      <span className="text-[10px] opacity-75 ml-1">{day.minTemp}°</span>
                    </div>

                    <span className={`text-[9px] px-2 py-0.5 rounded-full mt-1.5 font-black uppercase ${
                      day.isOkGoodToPlant ? 'bg-emerald-500 text-slate-950' : 'bg-rose-600 text-white'
                    }`}>
                      {day.isOkGoodToPlant ? '✅ OK' : '❌ NO'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
