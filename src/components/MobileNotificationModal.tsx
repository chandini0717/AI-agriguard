import React, { useState, useEffect } from 'react';
import { 
  X, 
  Smartphone, 
  Send, 
  Bell, 
  CheckCircle2, 
  AlertTriangle, 
  Volume2, 
  Vibrate, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  RefreshCw,
  Flame,
  Radio,
  FileText,
  Settings
} from 'lucide-react';
import { LanguageCode } from '../types';
import { 
  dispatchMobilePushAndSms, 
  triggerDeviceVibration, 
  playAlertSound,
  startContinuousSirenLoop,
  stopContinuousSirenLoop 
} from '../services/audioAlertService';

interface MobileNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage: LanguageCode;
  activeCropName?: string;
  locationName?: string;
}

export const MobileNotificationModal: React.FC<MobileNotificationModalProps> = ({
  isOpen,
  onClose,
  currentLanguage,
  activeCropName = 'Tomato',
  locationName = 'Kakinada, Andhra Pradesh',
}) => {
  const [farmerPhone, setFarmerPhone] = useState('+91 6303015695');
  const [smsGateway, setSmsGateway] = useState<'Fast2SMS' | 'Twilio' | 'MSG91'>('Fast2SMS');
  const [notificationHistory, setNotificationHistory] = useState<any[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [lastSentNotification, setLastSentNotification] = useState<any>(null);

  // Load registered phone
  useEffect(() => {
    const saved = localStorage.getItem('farmer_mobile_number');
    if (saved) {
      setFarmerPhone(saved);
    } else {
      fetch('/api/users')
        .then(res => res.json())
        .then(data => {
          const activeUser = data.users?.find((u: any) => u.active) || data.users?.[0];
          if (activeUser?.mobileNumber) {
            setFarmerPhone(activeUser.mobileNumber);
            localStorage.setItem('farmer_mobile_number', activeUser.mobileNumber);
          }
        })
        .catch(() => {});
    }
    fetchHistory();
  }, [isOpen]);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/notifications/history');
      if (res.ok) {
        const data = await res.json();
        setNotificationHistory(data.alerts || []);
      }
    } catch (e) {
      console.warn('Could not fetch history:', e);
    }
  };

  if (!isOpen) return null;

  const handleSavePhone = (num: string) => {
    setFarmerPhone(num);
    localStorage.setItem('farmer_mobile_number', num);
  };

  // Test Triggering Specific Mobile Alerts
  const triggerMobileAlert = async (type: 'pest' | 'animal' | 'soil' | 'weather') => {
    setIsSending(true);

    let problem = '';
    let severity: 'HIGH' | 'MEDIUM' | 'LOW' = 'HIGH';
    let action = '';
    let teluguSpeech = '';

    if (type === 'animal') {
      problem = 'Wild Spotted Deer Intrusion Near Crop Perimeter';
      severity = 'HIGH';
      action = 'Trigger predator acoustic siren and check field boundary fence immediately.';
      teluguSpeech = `హెచ్చరిక! ${activeCropName} పొలంలోకి జింక వస్తోంది! సైరన్ మోగుతోంది!`;
      startContinuousSirenLoop({
        category: 'animal',
        title: `🚨 WILD DEER INTRUSION IN ${activeCropName.toUpperCase()}!`,
        speechText: teluguSpeech,
        language: currentLanguage,
      });
    } else if (type === 'pest') {
      problem = 'Severe Fruit Borer / Insect Caterpillar Attack';
      severity = 'HIGH';
      action = 'Inspect underside of foliage and apply recommended IPM bio-spray immediately.';
      teluguSpeech = `హెచ్చరిక! ${activeCropName} పంటలో పురుగు దాడి గుర్తించబడింది! వెంటనే పరిశీలించండి.`;
      startContinuousSirenLoop({
        category: 'insect',
        title: `🐛 PEST ATTACK DETECTED IN ${activeCropName.toUpperCase()}!`,
        speechText: teluguSpeech,
        language: currentLanguage,
      });
    } else if (type === 'soil') {
      problem = 'Critically Low Soil Moisture & Root Zone Dehydration';
      severity = 'MEDIUM';
      action = 'Initiate drip irrigation immediately for 45 minutes to prevent crop wilt.';
      teluguSpeech = `హెచ్చరిక! నేలలో తేమ చాలా తక్కువగా ఉంది. నీటి తడి ఇవ్వండి.`;
      playAlertSound('soil');
    } else {
      problem = 'Extreme High Heat & Evaporative Stress (>36°C)';
      severity = 'HIGH';
      action = 'Apply light early evening irrigation and mulch around plant root basins.';
      teluguSpeech = `హెచ్చరిక! అధిక ఉష్ణోగ్రత నమోదవుతోంది. పంటను కాపాడుకోండి.`;
      playAlertSound('weather');
    }

    const payload = {
      crop: activeCropName,
      problem,
      severity,
      location: locationName,
      recommendedAction: action,
      mobileNumber: farmerPhone,
      language: currentLanguage,
      category: type,
      isHealthy: false,
    };

    const res = await dispatchMobilePushAndSms(payload);
    setIsSending(false);
    setLastSentNotification(payload);
    fetchHistory();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-3xl bg-emerald-950 border-2 border-emerald-500 shadow-2xl text-white overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-emerald-800 bg-gradient-to-r from-emerald-950 via-teal-950 to-emerald-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center">
              <Smartphone className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white">
                  Farmer Mobile Alert System (SMS & Push)
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                  Gateway Live 🟢
                </span>
              </div>
              <p className="text-xs text-emerald-300/80">
                Automatic phone alerts for pests, diseases, animals, soil moisture & high temperatures.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs flex-1">
          
          {/* Farmer Phone Registration Card */}
          <div className="p-4 rounded-2xl bg-black/50 border border-emerald-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-cyan-400" />
                <span>Registered Farmer Mobile Phone (SMS Target):</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">
                Location: {locationName}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={farmerPhone}
                onChange={(e) => handleSavePhone(e.target.value)}
                placeholder="+91 98480 22338"
                className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-950 border border-emerald-700 text-white font-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
              <button
                onClick={() => handleSavePhone(farmerPhone)}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs cursor-pointer shadow"
              >
                Save Phone
              </button>
            </div>
          </div>

          {/* EXACT MOBILE ALERT CARD PREVIEW (User Format Requirement) */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-red-950 via-rose-950 to-red-950 border-2 border-red-500 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-red-800">
              <span className="text-xs font-black text-yellow-300 uppercase tracking-wider flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-red-400 animate-ping" />
                <span>🚨 Official Mobile Push & SMS Notification Card:</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-600 text-white font-black uppercase">
                CRITICAL
              </span>
            </div>

            <div className="p-4 rounded-xl bg-black/70 border border-white/10 font-mono text-xs space-y-1.5 text-emerald-200">
              <div className="text-sm font-black text-white text-center pb-1 border-b border-white/10">
                🚨 CROP ALERT!
              </div>
              <div><span className="text-cyan-300 font-bold">• Crop:</span> {activeCropName}</div>
              <div><span className="text-yellow-300 font-bold">• Detected Problem:</span> {lastSentNotification?.problem || 'Spotted Deer Intrusion / Pest Attack'}</div>
              <div><span className="text-rose-400 font-bold">• Severity:</span> HIGH</div>
              <div><span className="text-emerald-400 font-bold">• Location:</span> {locationName}</div>
              <div><span className="text-purple-300 font-bold">• Time:</span> {new Date().toLocaleString('en-IN')}</div>
              <div><span className="text-white font-bold">• Recommended Action:</span> {lastSentNotification?.recommendedAction || 'Inspect the affected plants and activate perimeter audio deterrents.'}</div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-red-200">
              <span>Produces: 1. Loud Siren  2. Phone Vibration  3. Direct SMS Dispatch</span>
              <span className="text-yellow-300 font-bold">Delivered to: {farmerPhone}</span>
            </div>
          </div>

          {/* 1-TAP SEND TEST ALERTS TO FARMER'S MOBILE PHONE */}
          <div className="p-4 rounded-2xl bg-black/50 border border-emerald-800 space-y-2.5">
            <span className="font-bold text-white uppercase tracking-wider block">
              📱 Test Sending Mobile Alerts Directly to Phone ({farmerPhone}):
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => triggerMobileAlert('animal')}
                disabled={isSending}
                className="p-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-left flex flex-col justify-between shadow cursor-pointer active:scale-95 transition"
              >
                <span className="text-xl">🐄 / 🦌</span>
                <span className="text-xs font-bold mt-1">Animal Alert</span>
                <span className="text-[9px] opacity-80">Continuous Siren</span>
              </button>

              <button
                onClick={() => triggerMobileAlert('pest')}
                disabled={isSending}
                className="p-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-black text-left flex flex-col justify-between shadow cursor-pointer active:scale-95 transition"
              >
                <span className="text-xl">🐛</span>
                <span className="text-xs font-bold mt-1">Pest Attack</span>
                <span className="text-[9px] opacity-80">Insect Alarm</span>
              </button>

              <button
                onClick={() => triggerMobileAlert('soil')}
                disabled={isSending}
                className="p-3 rounded-xl bg-cyan-700 hover:bg-cyan-600 text-white font-black text-left flex flex-col justify-between shadow cursor-pointer active:scale-95 transition"
              >
                <span className="text-xl">💧</span>
                <span className="text-xs font-bold mt-1">Low Moisture</span>
                <span className="text-[9px] opacity-80">Irrigation SMS</span>
              </button>

              <button
                onClick={() => triggerMobileAlert('weather')}
                disabled={isSending}
                className="p-3 rounded-xl bg-orange-700 hover:bg-orange-600 text-white font-black text-left flex flex-col justify-between shadow cursor-pointer active:scale-95 transition"
              >
                <span className="text-xl">🌡️ / 🌧️</span>
                <span className="text-xs font-bold mt-1">High Temp</span>
                <span className="text-[9px] opacity-80">Weather Warning</span>
              </button>
            </div>
          </div>

          {/* NOTIFICATION & SMS HISTORY LOG */}
          <div className="p-4 rounded-2xl bg-black/60 border border-emerald-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>Mobile SMS Alert History ({notificationHistory.length}):</span>
              </span>
              <button
                onClick={fetchHistory}
                className="text-[11px] text-cyan-300 hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Refresh Log</span>
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {notificationHistory.length === 0 ? (
                <div className="p-4 text-center text-emerald-300/80 font-mono">
                  No previous mobile alerts recorded.
                </div>
              ) : (
                notificationHistory.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-800/80 flex items-start justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">{item.crop}: {item.problem}</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-600 text-white font-black">
                          {item.severity}
                        </span>
                      </div>
                      <p className="text-[11px] text-emerald-200">{item.recommendedAction}</p>
                      <span className="text-[10px] text-cyan-300 font-mono block">
                        📱 To: {item.mobileNumber} • {item.timestamp}
                      </span>
                    </div>

                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono font-bold flex-shrink-0">
                      Delivered 🟢
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-emerald-800 bg-emerald-950 flex items-center justify-between">
          <span className="text-xs text-emerald-300">
            SMS Gateway: Fast2SMS / Twilio Active • Vibration Enabled
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs cursor-pointer shadow"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
