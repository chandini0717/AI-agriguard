import React, { useState } from 'react';
import { 
  Calendar, 
  SunMedium, 
  CloudRain, 
  Droplets, 
  Volume2, 
  MapPin, 
  CheckCircle2, 
  XCircle,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Clock,
  Thermometer
} from 'lucide-react';
import { WeatherData, LanguageCode } from '../types';
import { speakVoiceAlert, playAlertSound } from '../services/audioAlertService';

interface FutureTemperatureCalendarViewProps {
  weather: WeatherData;
  locationName: string;
  currentLanguage: LanguageCode;
}

export const FutureTemperatureCalendarView: React.FC<FutureTemperatureCalendarViewProps> = ({
  weather,
  locationName,
  currentLanguage,
}) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const today = new Date();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // 14-day daily calendar with exact dates, diurnal temperatures (Morning, Afternoon, Evening, Night) and OK/NOT OK status
  const futureCalendarDays = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date();
    d.setDate(today.getDate() + i);

    const baseForecast = weather.forecast[i % weather.forecast.length] || {
      maxTemp: 32 + (i % 3),
      minTemp: 23 + (i % 2),
      rainProb: (i * 14) % 65,
    };

    const maxTemp = baseForecast.maxTemp;
    const minTemp = baseForecast.minTemp;
    const rainProb = baseForecast.rainProb;

    // Daily Diurnal Temperatures
    const morningTemp = minTemp + 2;
    const afternoonTemp = maxTemp;
    const eveningTemp = maxTemp - 4;
    const nightTemp = minTemp;

    // Standard agronomic criteria for whether it is OK / Good to plant
    const isOkGoodToPlant = maxTemp >= 20 && maxTemp <= 34 && rainProb < 55;

    let condition = 'Partly Cloudy';
    if (rainProb > 50) condition = 'Rain Showers';
    else if (rainProb > 25) condition = 'Passing Clouds';
    else condition = 'Sunny Clear';

    const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : dayNames[d.getDay()];
    const dateFormatted = `${d.getDate()} ${monthNames[d.getMonth()]}`;
    const fullDateText = `${dayName}, ${dateFormatted} 2026`;

    return {
      index: i,
      dayTitle: dayName,
      dateStr: dateFormatted,
      fullDateText,
      maxTemp,
      minTemp,
      morningTemp,
      afternoonTemp,
      eveningTemp,
      nightTemp,
      rainProb,
      condition,
      isOkGoodToPlant,
      statusLabel: isOkGoodToPlant ? '✅ OK: GOOD TO PLANT CROPS' : '⚠️ NOT RECOMMENDED: AVOID PLANTING',
      teluguSpeech: isOkGoodToPlant
        ? `${dayName} ${dateFormatted} న ఉష్ణోగ్రత ${maxTemp} డిగ్రీలు. ఫలితం: ఓకే! నేడు పంటలు నాటడానికి చాలా అనుకూలం (OK to plant).`
        : `${dayName} ${dateFormatted} న ఉష్ణోగ్రత ${maxTemp} డిగ్రీలు. అధిక వేడి లేదా వర్షం వల్ల నాటడం మంచిది కాదు (NOT OK to plant).`,
      hindiSpeech: isOkGoodToPlant
        ? `${dayName} ${dateFormatted} को तापमान ${maxTemp} डिग्री रहेगा। परिणाम: बिल्कुल ओके! आज फसल लगाने के लिए उत्तम दिन है (OK to plant)।`
        : `${dayName} ${dateFormatted} को परिणाम: फसल लगाना उचित नहीं है (NOT OK to plant)।`,
      englishSpeech: isOkGoodToPlant
        ? `${fullDateText}: High temperature will be ${maxTemp}°C. Verdict: OK! It is VERY GOOD TO PLANT CROPS today.`
        : `${fullDateText}: High temperature will be ${maxTemp}°C. Verdict: NOT RECOMMENDED! Avoid planting today.`,
      advice: isOkGoodToPlant
        ? 'Soil temperature and moisture levels are ideal for seedling transplantation and rapid root anchoring.'
        : rainProb > 55
        ? 'High rainfall saturation risk. Delay sowing until excess water drains out.'
        : 'High solar radiation stress. Water during early morning and mulch soil base.'
    };
  });

  const selectedDay = futureCalendarDays[selectedDayIndex] || futureCalendarDays[0];

  const handleSpeakDayVerdict = (day: typeof futureCalendarDays[0], lang: LanguageCode = currentLanguage) => {
    setIsSpeaking(true);
    playAlertSound(day.isOkGoodToPlant ? 'safe' : 'weather');

    let text = day.englishSpeech;
    if (lang === 'te') text = day.teluguSpeech;
    else if (lang === 'hi') text = day.hindiSpeech;

    speakVoiceAlert(text, lang);
    setTimeout(() => setIsSpeaking(false), 4500);
  };

  const handleSpeakAllCalendar = (lang: LanguageCode = currentLanguage) => {
    setIsSpeaking(true);
    playAlertSound('weather');

    let speech = '';
    const loc = locationName ? `(${locationName})` : '';

    if (lang === 'te') {
      speech = `రోజువారీ భవిష్యత్ ఉష్ణోగ్రత క్యాలెండర్ నివేదిక ${loc}: `;
      futureCalendarDays.slice(0, 7).forEach((d) => {
        speech += `${d.dayTitle} ${d.dateStr}: పగటి ఉష్ణోగ్రత ${d.maxTemp} డిగ్రీలు, రాత్రి ${d.nightTemp} డిగ్రీలు. ${d.isOkGoodToPlant ? 'ఓకే, నాటడానికి చాలా అనుకూలం!' : 'నాటడం మంచిది కాదు.'} `;
      });
    } else if (lang === 'hi') {
      speech = `दैनिक तापमान और मौसम कैलेंडर ${loc}: `;
      futureCalendarDays.slice(0, 7).forEach((d) => {
        speech += `${d.dayTitle} ${d.dateStr}: दिन का तापमान ${d.maxTemp} डिग्री, रात ${d.nightTemp} डिग्री. ${d.isOkGoodToPlant ? 'ओके, फसल लगाने के लिए उत्तम!' : 'फसल लगाना उचित नहीं.'} `;
      });
    } else {
      speech = `Daily future temperature dates calendar ${loc}: `;
      futureCalendarDays.slice(0, 7).forEach((d) => {
        speech += `${d.dayTitle} ${d.dateStr}: High ${d.maxTemp}°C, Night ${d.nightTemp}°C. ${d.isOkGoodToPlant ? 'Status: OK! Good to plant.' : 'Status: NOT OK.'} `;
      });
    }

    speakVoiceAlert(speech, lang);
    setTimeout(() => setIsSpeaking(false), 6500);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950 via-cyan-950/80 to-emerald-950 border-2 border-emerald-500 shadow-2xl text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center font-black">
            <Calendar className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <span>Daily Future Temperature Dates: Is It OK to Plant Crops?</span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                Daily 14-Day Calendar
              </span>
            </h2>
            <p className="text-xs text-emerald-300/80 flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              <span>Location: {locationName} • Daily Dates and Temperatures</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleSpeakAllCalendar('te')}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow flex items-center gap-1.5 cursor-pointer active:scale-95 transition"
          >
            <Volume2 className="w-4 h-4" />
            <span>🔊 తెలుగులో వినండి (Telugu)</span>
          </button>
          <button
            onClick={() => handleSpeakAllCalendar('hi')}
            className="px-3.5 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 font-black text-xs shadow flex items-center gap-1.5 cursor-pointer active:scale-95 transition"
          >
            <Volume2 className="w-4 h-4" />
            <span>🔊 हिन्दी में सुनें (Hindi)</span>
          </button>
        </div>
      </div>

      {/* SELECTED DATE SPOTLIGHT: CLEAR "OK - GOOD TO PLANT" DISPLAY WITH DIURNAL TEMPS */}
      <div className={`p-6 rounded-3xl border-3 shadow-2xl space-y-4 ${
        selectedDay.isOkGoodToPlant
          ? 'bg-gradient-to-r from-emerald-950 via-green-950 to-emerald-950 border-emerald-400 text-white ring-4 ring-emerald-500/30'
          : 'bg-gradient-to-r from-amber-950 via-rose-950 to-amber-950 border-amber-400 text-white'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-white/10 gap-3">
          <div>
            <span className="text-xs text-cyan-300 font-mono font-bold uppercase tracking-wider block">
              Selected Date: {selectedDay.fullDateText}
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Day High: {selectedDay.maxTemp}°C / Night Low: {selectedDay.minTemp}°C • {selectedDay.condition}
            </h3>
          </div>

          {/* HUGE UNMISTAKABLE OK / NOT OK BADGE */}
          <div className={`px-5 py-3 rounded-2xl border-2 shadow-xl flex items-center gap-2.5 ${
            selectedDay.isOkGoodToPlant
              ? 'bg-emerald-500 text-slate-950 border-emerald-200'
              : 'bg-rose-600 text-white border-rose-300'
          }`}>
            {selectedDay.isOkGoodToPlant ? (
              <CheckCircle2 className="w-7 h-7 stroke-[2.5]" />
            ) : (
              <XCircle className="w-7 h-7 stroke-[2.5]" />
            )}
            <div>
              <span className="text-[10px] uppercase tracking-wider font-mono font-bold block opacity-90">
                Daily Sowing Verdict:
              </span>
              <span className="text-base sm:text-lg font-black tracking-tight block">
                {selectedDay.statusLabel}
              </span>
            </div>
          </div>
        </div>

        {/* DIURNAL 4-POINT DAILY TEMPERATURES (Morning, Afternoon, Evening, Night) */}
        <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-2">
          <span className="text-xs font-bold text-yellow-300 uppercase tracking-wider block flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>Daily Diurnal Temperature Cycle for {selectedDay.dateStr}:</span>
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
            <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-800">
              <span className="text-[11px] text-emerald-400 font-bold block">🌅 Morning (6:00 AM)</span>
              <span className="text-xl font-black text-white">{selectedDay.morningTemp}°C</span>
              <span className="text-[10px] text-emerald-300/80 block mt-0.5">Gentle cool breeze</span>
            </div>

            <div className="p-3 rounded-xl bg-amber-950/80 border border-amber-800">
              <span className="text-[11px] text-yellow-300 font-bold block">☀️ Afternoon (2:00 PM)</span>
              <span className="text-xl font-black text-white">{selectedDay.afternoonTemp}°C</span>
              <span className="text-[10px] text-yellow-300/80 block mt-0.5">Peak day temperature</span>
            </div>

            <div className="p-3 rounded-xl bg-cyan-950/80 border border-cyan-800">
              <span className="text-[11px] text-cyan-300 font-bold block">🌇 Evening (7:00 PM)</span>
              <span className="text-xl font-black text-white">{selectedDay.eveningTemp}°C</span>
              <span className="text-[10px] text-cyan-300/80 block mt-0.5">Mild twilight</span>
            </div>

            <div className="p-3 rounded-xl bg-indigo-950/80 border border-indigo-800">
              <span className="text-[11px] text-indigo-300 font-bold block">🌙 Night (11:00 PM)</span>
              <span className="text-xl font-black text-white">{selectedDay.nightTemp}°C</span>
              <span className="text-[10px] text-indigo-300/80 block mt-0.5">Overnight low</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-1">
            <span className="text-cyan-400 font-bold block">Daily Rain Probability:</span>
            <div className="text-2xl font-black text-white">{selectedDay.rainProb}%</div>
            <p className="text-emerald-200 text-[11px]">{selectedDay.rainProb < 55 ? 'Favorable dry/moderate soil moisture' : 'High precipitation probability'}</p>
          </div>

          <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-1">
            <span className="text-yellow-400 font-bold block">Farmer Planting Advice:</span>
            <p className="text-emerald-100 text-[11px] leading-relaxed">
              {selectedDay.advice}
            </p>
          </div>
        </div>

        {/* Vernacular Language Explanations */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
          <div className="p-3.5 rounded-2xl bg-black/60 border border-emerald-500/40 text-amber-300 space-y-1">
            <span className="font-bold text-white block">📢 తెలుగు రైతు నివేదిక ({selectedDay.dateStr}):</span>
            <p className="text-[12px] font-semibold leading-relaxed">{selectedDay.teluguSpeech}</p>
            <button
              onClick={() => handleSpeakDayVerdict(selectedDay, 'te')}
              className="mt-2 text-[11px] text-yellow-300 hover:underline flex items-center gap-1 font-bold"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>ఈ రోజు వాయిస్ వినండి (Listen Telugu)</span>
            </button>
          </div>

          <div className="p-3.5 rounded-2xl bg-black/60 border border-emerald-500/40 text-orange-300 space-y-1">
            <span className="font-bold text-white block">📢 हिन्दी किसान परामर्श ({selectedDay.dateStr}):</span>
            <p className="text-[12px] font-semibold leading-relaxed">{selectedDay.hindiSpeech}</p>
            <button
              onClick={() => handleSpeakDayVerdict(selectedDay, 'hi')}
              className="mt-2 text-[11px] text-orange-300 hover:underline flex items-center gap-1 font-bold"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>यह दिन सुनें (Listen Hindi)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 14-DAY DAILY CALENDAR TILES GRID: SHOWS "OK TO PLANT" ON EVERY SINGLE EXACT DATE */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
            <span>📅 14-Day Calendar: Daily Dates & Planting Verdicts (Click Any Date):</span>
          </h4>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {futureCalendarDays.map((day) => {
            const isSelected = day.index === selectedDayIndex;
            return (
              <button
                key={day.index}
                onClick={() => {
                  setSelectedDayIndex(day.index);
                  handleSpeakDayVerdict(day, currentLanguage);
                }}
                className={`p-3.5 rounded-2xl border-2 text-center transition flex flex-col justify-between items-center cursor-pointer shadow-lg ${
                  isSelected
                    ? 'bg-gradient-to-b from-cyan-600 to-blue-700 text-white border-cyan-300 scale-105 ring-4 ring-cyan-400'
                    : day.isOkGoodToPlant
                    ? 'bg-emerald-950/90 hover:bg-emerald-900 border-emerald-600 text-emerald-100'
                    : 'bg-amber-950/70 hover:bg-amber-900 border-amber-700 text-amber-100'
                }`}
              >
                <span className="text-[11px] font-black uppercase tracking-wide block">
                  {day.dayTitle}
                </span>
                <span className="text-[11px] text-cyan-300 font-mono font-bold block my-0.5">
                  {day.dateStr}
                </span>

                <div className="my-1.5">
                  {day.rainProb > 45 ? (
                    <CloudRain className="w-6 h-6 text-blue-300 mx-auto" />
                  ) : (
                    <SunMedium className="w-6 h-6 text-amber-300 mx-auto" />
                  )}
                </div>

                <div className="text-xs font-bold font-mono">
                  <span>{day.maxTemp}°C</span>
                  <span className="text-[10px] opacity-75 ml-1">/ {day.minTemp}°</span>
                </div>

                <div className="text-[9px] text-cyan-200 mt-1 font-mono">
                  Rain: {day.rainProb}%
                </div>

                {/* PROMINENT OK / NOT OK BADGE ON EVERY CARD */}
                <div className={`mt-2.5 w-full py-1 rounded-xl text-[10px] font-black uppercase tracking-tight shadow ${
                  day.isOkGoodToPlant
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-rose-600 text-white'
                }`}>
                  {day.isOkGoodToPlant ? '✅ OK TO PLANT' : '❌ NOT OK'}
                </div>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};
