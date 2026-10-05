import React, { useState } from 'react';
import { 
  PawPrint, 
  ShieldCheck, 
  AlertTriangle, 
  Volume2, 
  Camera, 
  Radio,
  CheckCircle2,
  BellRing
} from 'lucide-react';
import { AnimalDetectionResult, SupportedAnimal, LanguageCode } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import { playAlertSound, speakVoiceAlert } from '../services/audioAlertService';

interface AnimalProtectionCardProps {
  currentDetection: AnimalDetectionResult | null;
  onSimulateIntrusion?: (animal: SupportedAnimal) => void;
  onClearIntrusion?: () => void;
  currentLanguage: LanguageCode;
}

export const AnimalProtectionCard: React.FC<AnimalProtectionCardProps> = ({
  currentDetection,
  onSimulateIntrusion,
  onClearIntrusion,
  currentLanguage,
}) => {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;

  const supportedAnimals: { name: SupportedAnimal; emoji: string; telugu: string }[] = [
    { name: 'Monkey', emoji: '🐒', telugu: 'కోతి' },
    { name: 'Wild Boar', emoji: '🐗', telugu: 'అడవి పంది' },
    { name: 'Deer', emoji: '🦌', telugu: 'జింక' },
    { name: 'Elephant', emoji: '🐘', telugu: 'ఏనుగు' },
    { name: 'Cattle', emoji: '🐂', telugu: 'పశువులు' },
    { name: 'Goat', emoji: '🐐', telugu: 'మేక' },
    { name: 'Dog', emoji: '🐕', telugu: 'కుక్క' },
  ];

  const handleTestSiren = () => {
    playAlertSound('HIGH');
    const msg = currentLanguage === 'te' 
      ? 'హెచ్చరిక! పొలంలో జంతువు గుర్తించబడింది. సైరన్ మోగించబడింది.' 
      : 'Alert! Wild animal intrusion detected. Alarm sound activated.';
    speakVoiceAlert(msg, currentLanguage);
  };

  const isIntruded = currentDetection && currentDetection.status === 'Animal Detected';

  return (
    <div className={`rounded-3xl border p-5 shadow-xl text-white flex flex-col justify-between transition-all duration-300 ${
      isIntruded 
        ? 'bg-red-950/80 border-red-700/90 shadow-red-950/40 ring-1 ring-red-500/40' 
        : 'bg-emerald-950/70 border-emerald-800/80'
    }`}>
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-emerald-800/70">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl border ${
            isIntruded 
              ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse' 
              : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
          }`}>
            <PawPrint className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base tracking-tight flex items-center gap-2">
              {t.animalProtection}
              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold ${
                isIntruded 
                  ? 'bg-red-500 text-white animate-bounce' 
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}>
                {isIntruded ? 'INTRUSION DETECTED' : 'SAFE'}
              </span>
            </h3>
            <p className="text-[11px] text-emerald-300/70">
              Surveillance against wildlife crop damage
            </p>
          </div>
        </div>

        {/* Test Siren Button */}
        <button
          onClick={handleTestSiren}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600/90 hover:bg-red-500 text-white text-xs font-bold shadow-md shadow-red-950/50 active:scale-95 transition"
          title="Trigger deterrence siren"
        >
          <Volume2 className="w-3.5 h-3.5 text-yellow-300" />
          <span>{t.triggerAlarmSound}</span>
        </button>
      </div>

      {/* Main Status Display */}
      {isIntruded && currentDetection ? (
        <div className="my-3.5 p-4 rounded-2xl bg-red-900/50 border border-red-700/80 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className="text-3xl">⚠️</span>
              <div>
                <h4 className="text-base font-extrabold text-white flex items-center gap-2">
                  <span>{currentDetection.animal}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/30 text-red-200 border border-red-400/30">
                    {currentDetection.confidence}% Confidence
                  </span>
                </h4>
                <p className="text-xs text-red-200 font-mono">
                  📍 {currentDetection.location} • 🕒 {currentDetection.timestamp}
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-xl bg-red-500 text-white text-xs font-black uppercase">
              {currentDetection.riskLevel} Risk
            </span>
          </div>

          {/* Evidence photo preview */}
          {currentDetection.evidenceImage && (
            <div className="relative h-32 rounded-xl overflow-hidden border border-red-700/60 bg-black">
              <img 
                src={currentDetection.evidenceImage} 
                alt={currentDetection.animal} 
                className="w-full h-full object-cover" 
              />
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[10px] text-red-300 font-mono">
                📸 {currentDetection.cameraName} AI Optical Evidence
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <button
              onClick={() => {
                playAlertSound('HIGH');
                speakVoiceAlert(
                  currentLanguage === 'te' 
                    ? `హెచ్చరిక! పొలంలో ${currentDetection.animal} గుర్తించబడింది.` 
                    : `Alert! ${currentDetection.animal} detected in ${currentDetection.location}.`,
                  currentLanguage
                );
              }}
              className="text-xs text-yellow-300 hover:underline flex items-center gap-1 font-bold"
            >
              <BellRing className="w-3.5 h-3.5" /> Replay Voice Alert
            </button>

            {onClearIntrusion && (
              <button
                onClick={onClearIntrusion}
                className="px-3 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-xs font-bold text-white transition"
              >
                Mark Field Safe ✓
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="my-3.5 p-4 rounded-2xl bg-emerald-900/30 border border-emerald-800/60 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">{t.animalSafe}</div>
            <p className="text-xs text-emerald-300/80 leading-relaxed">
              Optical PTZ cameras actively monitoring boundaries. No wildlife breach in last 24h.
            </p>
          </div>
        </div>
      )}

      {/* Supported Animals Target Carousel */}
      <div className="pt-2 border-t border-emerald-800/60">
        <span className="text-[11px] text-emerald-300 font-semibold block mb-1.5">
          Supported Target Animals:
        </span>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {supportedAnimals.map(a => (
            <button
              key={a.name}
              onClick={() => onSimulateIntrusion && onSimulateIntrusion(a.name)}
              className="px-2.5 py-1 rounded-xl bg-emerald-900/40 hover:bg-emerald-800 border border-emerald-800/80 text-[11px] font-medium text-emerald-200 flex items-center gap-1 whitespace-nowrap transition cursor-pointer"
              title={`Simulate ${a.name} intrusion`}
            >
              <span>{a.emoji}</span>
              <span>{a.name}</span>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};
