import { LanguageCode } from '../types';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export type AlertSoundCategory = 'animal' | 'insect' | 'soil' | 'weather' | 'safe' | 'HIGH' | 'WARNING' | 'INFO';

/**
 * Generates specific audible sounds for farm telemetry and detection:
 * - 'animal': loud sweeping ultrasonic predator deterrence siren
 * - 'insect': rapid high-frequency pest buzzer
 * - 'soil': deep cautionary resonance
 * - 'safe': bright uplifting chime
 */
export function playAlertSound(type: AlertSoundCategory = 'HIGH') {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    if (type === 'animal' || type === 'HIGH') {
      // 1. WILDLIFE / ANIMAL INTRUSION / HIGH EMERGENCY: Alternating urgent siren
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'square';

      // Rapid urgent warble
      osc1.frequency.setValueAtTime(800, now);
      osc1.frequency.linearRampToValueAtTime(1600, now + 0.15);
      osc1.frequency.linearRampToValueAtTime(750, now + 0.3);
      osc1.frequency.linearRampToValueAtTime(1600, now + 0.45);
      osc1.frequency.linearRampToValueAtTime(750, now + 0.6);
      osc1.frequency.linearRampToValueAtTime(1600, now + 0.75);

      osc2.frequency.setValueAtTime(400, now);
      osc2.frequency.linearRampToValueAtTime(800, now + 0.15);
      osc2.frequency.linearRampToValueAtTime(380, now + 0.3);
      osc2.frequency.linearRampToValueAtTime(800, now + 0.45);

      gainNode.gain.setValueAtTime(0.01, now);
      gainNode.gain.linearRampToValueAtTime(0.45, now + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.95);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.95);
      osc2.stop(now + 0.95);

    } else if (type === 'insect') {
      // 2. INSECT / PEST DETECTION: Rapid high-pitch double buzzer
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(1250, now);
      osc.frequency.setValueAtTime(1650, now + 0.08);
      osc.frequency.setValueAtTime(1250, now + 0.16);
      osc.frequency.setValueAtTime(1800, now + 0.24);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.35, now + 0.04);
      gain.gain.setValueAtTime(0.05, now + 0.14);
      gain.gain.linearRampToValueAtTime(0.35, now + 0.18);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.55);

    } else if (type === 'soil' || type === 'WARNING') {
      // 3. SOIL DEFICIENCY / CAUTION: Dual resonant tone
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(660, now + 0.18);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.55);

    } else if (type === 'weather') {
      // 4. WEATHER RISK / RAIN PULSE
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.linearRampToValueAtTime(540, now + 0.25);
      osc.frequency.linearRampToValueAtTime(280, now + 0.5);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.6);

    } else {
      // 5. SAFE / HEALTHY: Uplifting C-Major Arpeggio (C5 -> E5 -> G5 -> C6)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
      osc.frequency.setValueAtTime(1046.50, now + 0.3); // C6

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.25, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.6);
    }
  } catch (err) {
    console.warn('AudioContext playback error:', err);
  }
}

// Global cached voices
let cachedVoices: SpeechSynthesisVoice[] = [];
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  cachedVoices = window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoices = window.speechSynthesis.getVoices();
  };
}

/**
 * Speaks text using the browser's native SpeechSynthesis in the requested language.
 */
export function speakVoiceAlert(text: string, language: LanguageCode = 'en') {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }

  const synth = window.speechSynthesis;
  const langMap: Record<LanguageCode, string> = {
    en: 'en-IN',
    te: 'te-IN',
    hi: 'hi-IN',
    ta: 'ta-IN',
    kn: 'kn-IN',
    ml: 'ml-IN',
    mr: 'mr-IN',
    bn: 'bn-IN',
  };
  const targetLang = langMap[language] || 'en-US';

  const speak = () => {
    try {
      const voices = synth.getVoices();
      cachedVoices = voices;
      const prefix = targetLang.slice(0, 2).toLowerCase();
      const matchingVoice = voices.find(v => v.lang.toLowerCase() === targetLang.toLowerCase())
        || voices.find(v => v.lang.toLowerCase().startsWith(`${prefix}-`))
        || voices.find(v => v.lang.toLowerCase() === prefix);

      if (language === 'te' && !matchingVoice) {
        window.dispatchEvent(new CustomEvent('farm:speech:unavailable', {
          detail: { language, requestedVoice: targetLang },
        }));
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = targetLang;
      utterance.rate = 0.88;
      utterance.pitch = 1.0;
      if (matchingVoice) utterance.voice = matchingVoice;
      utterance.onerror = (event) => {
        console.warn(`Speech synthesis failed for ${targetLang}:`, event.error);
        window.dispatchEvent(new CustomEvent('farm:speech:error', {
          detail: { language, error: event.error },
        }));
      };

      synth.cancel();
      synth.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis error:', err);
    }
  };

  try {
    if (synth.getVoices().length === 0) {
      let voiceLoadTimeout = 0;
      const onVoicesChanged = () => {
        cachedVoices = synth.getVoices();
        if (cachedVoices.length > 0) {
          synth.removeEventListener('voiceschanged', onVoicesChanged);
          window.clearTimeout(voiceLoadTimeout);
          speak();
        }
      };
      voiceLoadTimeout = window.setTimeout(() => {
        synth.removeEventListener('voiceschanged', onVoicesChanged);
        speak();
      }, 1200);
      synth.addEventListener('voiceschanged', onVoicesChanged);
      return;
    }
    speak();
  } catch (err) {
    console.warn('Speech synthesis error:', err);
  }
}

/**
 * Evaluates whether current temperature and microclimate is GOOD TO PLANT/WEAR CROPS today.
 */
export function evaluatePlantingSuitability(temperature: number, rainProb = 0): {
  isGood: boolean;
  verdictTitle: string;
  teluguMessage: string;
  hindiMessage: string;
  englishMessage: string;
} {
  const isGood = temperature >= 18 && temperature <= 35 && rainProb < 75;

  if (isGood) {
    return {
      isGood: true,
      verdictTitle: '✅ GOOD TO WEAR / PLANT CROPS TODAY',
      teluguMessage: `నేటి ఉష్ణోగ్రత ${temperature} డిగ్రీల సెల్సియస్. నేడు మొక్కలు లేదా పంటలు నాటడానికి చాలా మంచి రోజు, అనుకూలంగా ఉంది (Good to plant today).`,
      hindiMessage: `आज का तापमान ${temperature} डिग्री सेल्सियस है। आज पौधे या फसल लगाने के लिए बहुत अच्छा और उपयुक्त दिन है (Good to plant today)।`,
      englishMessage: `Today's temperature is ${temperature}°C. Today is GOOD TO PLANT OR WEAR CROPS with optimal root zone moisture and weather conditions.`,
    };
  } else {
    return {
      isGood: false,
      verdictTitle: '⚠️ NOT IDEAL TO PLANT CROPS TODAY',
      teluguMessage: `నేటి ఉష్ణోగ్రత ${temperature} డిగ్రీలు. వాతావరణ పరిస్థితుల వల్ల నేడు కొత్త మొక్కలు నాటడం మంచిది కాదు (Not good to plant today).`,
      hindiMessage: `आज का तापमान ${temperature} डिग्री है। मौसम की परिस्थितियों के कारण आज पौधे लगाना उचित नहीं है (Not good to plant today)।`,
      englishMessage: `Today's temperature is ${temperature}°C. Today is NOT ADVISABLE to plant crops due to extreme heat or precipitation risks.`,
    };
  }
}

/**
 * AUTOMATIC ALARM DISPATCH (Triggered automatically without requiring manual click):
 * Automatically sounds the siren and speaks in the user's selected language!
 */
export function autoTriggerAlarmSoundAndSpeech(options: {
  category: 'animal' | 'insect' | 'soil' | 'weather';
  englishMessage: string;
  teluguMessage: string;
  hindiMessage: string;
  language: LanguageCode;
}) {
  playAlertSound(options.category);

  let messageToSpeak = options.englishMessage;
  if (options.language === 'te') {
    messageToSpeak = options.teluguMessage;
  } else if (options.language === 'hi') {
    messageToSpeak = options.hindiMessage;
  }

  setTimeout(() => {
    speakVoiceAlert(messageToSpeak, options.language);
  }, 350);
}

/**
 * DEDICATED TELUGU ALARM:
 * Plays emergency loud agricultural siren, then speaks clearly in Telugu voice including the GPS location!
 */
export function triggerTeluguAlarm(locationName?: string, customText?: string) {
  playAlertSound('HIGH');
  const loc = locationName ? `జి.పి.యస్ స్థానం ${locationName} వద్ద ` : '';
  const teluguMessage = customText || `హెచ్చరిక! ${loc}పొలంలో అత్యవసర అలారం మోగించబడింది! పంటను వెంటనే తనిఖీ చేయండి!`;
  setTimeout(() => {
    speakVoiceAlert(teluguMessage, 'te');
  }, 400);
}

/**
 * DEDICATED HINDI ALARM:
 * Plays emergency loud agricultural siren, then speaks clearly in Hindi voice including the GPS location!
 */
export function triggerHindiAlarm(locationName?: string, customText?: string) {
  playAlertSound('HIGH');
  const loc = locationName ? `जीपीएस स्थान ${locationName} के ` : '';
  const hindiMessage = customText || `सावधान! ${loc}खेत में आपातकालीन अलार्म बज रहा है! फसल की तुरंत जांच करें!`;
  setTimeout(() => {
    speakVoiceAlert(hindiMessage, 'hi');
  }, 400);
}

/**
 * DEDICATED ENGLISH ALARM:
 * Plays emergency loud agricultural siren, then speaks in English voice with GPS location.
 */
export function triggerEnglishAlarm(locationName?: string, customText?: string) {
  playAlertSound('HIGH');
  const loc = locationName ? `at GPS location ${locationName} ` : '';
  const englishMessage = customText || `Warning! Agricultural alarm sounding ${loc}in the field. Inspect crops immediately!`;
  setTimeout(() => {
    speakVoiceAlert(englishMessage, 'en');
  }, 400);
}

/**
 * Speaks the Future Temperature Dates Calendar in the user's native language:
 */
export function speakFutureCalendarForecast(
  forecast: Array<{ day: string; date?: string; maxTemp: number; minTemp: number; rainProb: number }>,
  locationName: string,
  language: LanguageCode
) {
  playAlertSound('weather');

  const loc = locationName ? ` (${locationName})` : '';
  let speech = '';

  if (language === 'te') {
    speech = `భవిష్యత్ ఉష్ణోగ్రత మరియు వాతావరణ క్యాలెండర్${loc}: `;
    forecast.slice(0, 5).forEach((f) => {
      speech += `${f.day}: గరిష్టం ${f.maxTemp} డిగ్రీలు, కనిష్టం ${f.minTemp} డిగ్రీలు, వర్షం అవకాశం ${f.rainProb} శాతం. `;
    });
  } else if (language === 'hi') {
    speech = `आगामी दिनों का तापमान व मौसम कैलेंडर${loc}: `;
    forecast.slice(0, 5).forEach((f) => {
      speech += `${f.day}: अधिकतम ${f.maxTemp} डिग्री, न्यूनतम ${f.minTemp} डिग्री, वर्षा संभावना ${f.rainProb} प्रतिशत। `;
    });
  } else {
    speech = `Future temperature dates forecast calendar${loc}: `;
    forecast.slice(0, 5).forEach((f) => {
      speech += `${f.day}: High ${f.maxTemp} degrees, Low ${f.minTemp} degrees, rain probability ${f.rainProb} percent. `;
    });
  }

  setTimeout(() => {
    speakVoiceAlert(speech, language);
  }, 400);

  return speech;
}

/**
 * Dedicated Multilingual Daily Temperature Voice Broadcast:
 * Explicitly announces today's temperature AND tells the farmer whether it is GOOD TO PLANT/WEAR A PLANT TODAY!
 */
export function speakDailyTemperatureUpdate(options: {
  temperature: number;
  maxTemp: number;
  minTemp: number;
  humidity: number;
  rainStatus: string;
  locationName?: string;
  language: LanguageCode;
}) {
  playAlertSound('weather');

  const { temperature, maxTemp, minTemp, humidity, rainStatus, locationName, language } = options;
  const loc = locationName ? ` (${locationName})` : '';
  const evalResult = evaluatePlantingSuitability(temperature);

  let message = '';
  switch (language) {
    case 'te':
      message = `నేటి ఉష్ణోగ్రత నివేదిక${loc}: ప్రస్తుత ఉష్ణోగ్రత ${temperature} డిగ్రీల సెల్సియస్. గరిష్ట ఉష్ణోగ్రత ${maxTemp} డిగ్రీలు, కనిష్ట ఉష్ణోగ్రత ${minTemp} డిగ్రీలు. ${evalResult.teluguMessage}`;
      break;
    case 'hi':
      message = `दैनिक मौसम अपडेट${loc}: वर्तमान तापमान ${temperature} डिग्री सेल्सियस है। अधिकतम तापमान ${maxTemp} डिग्री रहेगा। ${evalResult.hindiMessage}`;
      break;
    case 'ta':
      message = `இன்றைய வெப்பநிலை அறிக்கை${loc}: தற்போதைய வெப்பநிலை ${temperature} டிகிரி செல்சியஸ். அதிகபட்சம் ${maxTemp} டிகிரி. இன்று செடிகள் நடுவதற்கு மிகவும் நல்ல நாள் (Good to plant today).`;
      break;
    case 'kn':
      message = `ಇಂದಿನ ತಾಪಮಾನ ವರದಿ${loc}: ಪ್ರಸ್ತುತ ತಾಪಮಾನ ${temperature} ಡಿಗ್ರಿ ಸೆಲ್ಸಿಯಸ್. ಗರಿಷ್ಠ ${maxTemp} ಡಿಗ್ರಿ. ಇಂದು ಗಿಡಗಳನ್ನು ನೆಡಲು ಉತ್ತಮ ದಿನವಾಗಿದೆ (Good to plant today).`;
      break;
    case 'ml':
      message = `ഇന്നത്തെ താപനില റിപ്പോർട്ട്${loc}: നിലവിലെ താപനില ${temperature} ഡിഗ്രി സെൽഷ്യസ്. ചെടികൾ നടാൻ ഇന്ന് അനുകൂലമായ ദിവസമാണ്.`;
      break;
    case 'mr':
      message = `आजचा हवामान अहवाल${loc}: चालू तापमान ${temperature} अंश सेल्सिअस आहे. आज रोपे लावण्यासाठी अतिशय चांगला दिवस आहे.`;
      break;
    case 'bn':
      message = `আজকের তাপমাত্রার আপডেট${loc}: বর্তমান তাপমাত্রা ${temperature} ডিগ্রি সেলসিয়াস। আজ চারা রোপণের জন্য উপযুক্ত দিন।`;
      break;
    default:
      message = `Daily farm weather update${loc}: Current temperature is ${temperature} degrees Celsius, high of ${maxTemp}°C and low of ${minTemp}°C. ${evalResult.englishMessage}`;
      break;
  }

  setTimeout(() => {
    speakVoiceAlert(message, language);
  }, 400);

  return message;
}

/**
 * Continuous Siren Alarm State & Controller
 */
interface ContinuousAlertState {
  isActive: boolean;
  category: AlertSoundCategory;
  title: string;
  speechText: string;
  language: LanguageCode;
  startTime: number;
}

let activeContinuousAlert: ContinuousAlertState | null = null;
let sirenIntervalTimer: any = null;
let speechIntervalTimer: any = null;
let vibrationIntervalTimer: any = null;
let sirenCountdownTimer: any = null;
let remainingSirenSeconds = 0;

/**
 * Triggers device vibration (supported on mobile Android/iOS web views)
 */
export function triggerDeviceVibration(pattern: number[] = [500, 250, 500, 250, 500]) {
  if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch (e) {
      console.warn('Vibration not permitted:', e);
    }
  }
}

/**
 * START CONTINUOUS SIREN LOOP
 * - Loops siren sound every 1.5s
 * - Loops voice alert every 5.5s
 * - Loops mobile vibration
 * - Runs for configurable duration (default: 30 seconds)
 * - Emits 'farm:siren:countdown' and 'farm:alert:started'
 */
export function startContinuousSirenLoop(options: {
  category: AlertSoundCategory;
  title: string;
  speechText: string;
  language: LanguageCode;
  durationSeconds?: number;
}) {
  // Stop existing loop if any
  stopContinuousSirenLoop();

  const totalDuration = options.durationSeconds ?? 30;
  remainingSirenSeconds = totalDuration;

  activeContinuousAlert = {
    isActive: true,
    category: options.category,
    title: options.title,
    speechText: options.speechText,
    language: options.language,
    startTime: Date.now(),
  };

  // 1. Initial immediate blast & vibration
  playAlertSound(options.category);
  triggerDeviceVibration([600, 200, 600, 200, 600]);

  // Initial immediate speech
  setTimeout(() => {
    if (activeContinuousAlert?.isActive) {
      speakVoiceAlert(options.speechText, options.language);
    }
  }, 400);

  // 2. Continuous repeating siren sound every 1.5 seconds
  sirenIntervalTimer = setInterval(() => {
    if (activeContinuousAlert?.isActive) {
      playAlertSound(options.category);
    } else {
      clearInterval(sirenIntervalTimer);
    }
  }, 1500);

  // 3. Continuous repeating voice warning every 5.5 seconds
  speechIntervalTimer = setInterval(() => {
    if (activeContinuousAlert?.isActive) {
      speakVoiceAlert(options.speechText, options.language);
    } else {
      clearInterval(speechIntervalTimer);
    }
  }, 5500);

  // 4. Continuous phone vibration every 2 seconds
  vibrationIntervalTimer = setInterval(() => {
    if (activeContinuousAlert?.isActive) {
      triggerDeviceVibration([500, 200, 500]);
    } else {
      clearInterval(vibrationIntervalTimer);
    }
  }, 2000);

  // 5. Configurable Duration Countdown (e.g. 30 seconds auto-shutoff)
  sirenCountdownTimer = setInterval(() => {
    remainingSirenSeconds -= 1;
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('farm:siren:countdown', {
          detail: {
            remainingSeconds: Math.max(0, remainingSirenSeconds),
            totalSeconds: totalDuration,
          },
        })
      );
    }

    if (remainingSirenSeconds <= 0) {
      stopContinuousSirenLoop();
    }
  }, 1000);

  // Dispatch custom event to notify all components and floating stop button
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('farm:alert:started', {
        detail: {
          ...activeContinuousAlert,
          durationSeconds: totalDuration,
          remainingSeconds: totalDuration,
        },
      })
    );
  }
}

/**
 * STOP CONTINUOUS SIREN LOOP
 * Immediately silences audio, cancels speech synthesis, stops vibration, and clears timers.
 */
export function stopContinuousSirenLoop() {
  if (sirenIntervalTimer) {
    clearInterval(sirenIntervalTimer);
    sirenIntervalTimer = null;
  }
  if (speechIntervalTimer) {
    clearInterval(speechIntervalTimer);
    speechIntervalTimer = null;
  }
  if (vibrationIntervalTimer) {
    clearInterval(vibrationIntervalTimer);
    vibrationIntervalTimer = null;
  }
  if (sirenCountdownTimer) {
    clearInterval(sirenCountdownTimer);
    sirenCountdownTimer = null;
  }
  remainingSirenSeconds = 0;

  // Cancel any active SpeechSynthesis utterance
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }

  // Stop device vibration
  triggerDeviceVibration([0]);

  activeContinuousAlert = null;

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('farm:alert:stopped'));
  }
}

export function isContinuousSirenActive(): boolean {
  return !!activeContinuousAlert?.isActive;
}

export function getActiveContinuousAlert(): ContinuousAlertState | null {
  return activeContinuousAlert;
}

/**
 * DISPATCH MOBILE PUSH NOTIFICATION & SMS TO FARMER'S PHONE
 */
export async function dispatchMobilePushAndSms(notification: {
  crop: string;
  problem: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  location: string;
  recommendedAction: string;
  mobileNumber?: string;
  language?: 'all' | LanguageCode;
  category?: 'pest' | 'animal' | 'soil' | 'weather' | 'disease' | 'fire';
  isHealthy?: boolean;
}) {
  // If crop is healthy, do NOT send emergency SMS!
  if (notification.isHealthy) {
    return {
      success: true,
      isHealthy: true,
      smsSent: false,
      message: '✅ Crop is Healthy – No immediate issues detected. No emergency SMS sent.'
    };
  }

  const registeredPhone = notification.mobileNumber || localStorage.getItem('farmer_mobile_number') || '';
  const ownerName = localStorage.getItem('farmer_name') || '';
  const preferredLang = notification.language || (localStorage.getItem('farmer_sms_language') as any) || 'all';

  // 1. Browser Native Web Notification (Push notification on phone / browser)
  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'granted') {
      try {
        new Notification(`🚨 CROP ALERT! - ${notification.crop}`, {
          body: `${notification.problem} detected (${notification.severity}). Location: ${notification.location}. Immediate Action: ${notification.recommendedAction}`,
          icon: '/favicon.ico',
          tag: `crop-alert-${Date.now()}`,
          requireInteraction: true,
        });
      } catch (err) {
        console.warn('Notification constructor error:', err);
      }
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          try {
            new Notification(`🚨 CROP ALERT! - ${notification.crop}`, {
              body: `${notification.problem} (${notification.severity})! Check field immediately.`,
            });
          } catch (e) {}
        }
      });
    }
  }

  // 2. Device Vibration
  triggerDeviceVibration([700, 200, 700, 200, 700]);

  // 3. Dispatch SMS API request to backend (Twilio / Fast2SMS / MSG91)
  try {
    const smsRes = await fetch('/api/notifications/sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mobileNumber: registeredPhone,
        ownerName: ownerName,
        crop: notification.crop,
        problem: notification.problem,
        severity: notification.severity,
        location: notification.location,
        recommendedAction: notification.recommendedAction,
        category: notification.category || 'pest',
        language: preferredLang,
        isHealthy: false,
      }),
    });

    const data = await smsRes.json();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('farm:sms:sent', { detail: data }));
    }
    return {
      success: smsRes.ok && Boolean(data.success),
      smsDetails: data,
      message: data.error || data.status || data.message,
    };
  } catch (err) {
    console.warn('SMS dispatch network error:', err);
    return {
      success: false,
      message: err instanceof Error ? err.message : 'SMS dispatch network error',
    };
  }
}

/**
 * Triggers both audible siren and spoken voice message with automatic sound mapping.
 */
export function triggerFullAlert(options: {
  type: 'animal' | 'insect' | 'soil' | 'weather' | 'safe';
  severity?: 'HIGH' | 'WARNING' | 'INFO';
  englishText: string;
  teluguText: string;
  hindiText?: string;
  language: LanguageCode;
}) {
  playAlertSound(options.type);

  let voiceText = options.englishText;
  if (options.language === 'te') {
    voiceText = options.teluguText;
  } else if (options.language === 'hi' && options.hindiText) {
    voiceText = options.hindiText;
  }

  setTimeout(() => {
    speakVoiceAlert(voiceText, options.language);
  }, 350);
}
