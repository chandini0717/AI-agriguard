import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Send, 
  Bell, 
  CheckCircle2, 
  AlertTriangle, 
  Volume2, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  RefreshCw, 
  Radio, 
  FileText, 
  Check, 
  Bug, 
  PawPrint, 
  Droplets, 
  Flame, 
  Trash2,
  Copy,
  Users,
  UserPlus,
  ShieldAlert,
  Sliders,
  XCircle,
  Eye,
  Key,
  Save,
  StopCircle,
  CheckCheck
} from 'lucide-react';
import { LanguageCode, RegisteredUser, AlertHistoryItem, SmsGatewayConfig } from '../types';
import { 
  dispatchMobilePushAndSms, 
  triggerDeviceVibration, 
  playAlertSound,
  startContinuousSirenLoop,
  stopContinuousSirenLoop,
  isContinuousSirenActive
} from '../services/audioAlertService';

interface OwnerMobileAlertsViewProps {
  currentLanguage: LanguageCode;
  locationName?: string;
  defaultCrop?: string;
}

export const OwnerMobileAlertsView: React.FC<OwnerMobileAlertsViewProps> = ({
  currentLanguage,
  locationName = 'Kakinada, Andhra Pradesh',
  defaultCrop = 'Tomato',
}) => {
  // 1. User Management State (Maximum 10 Users)
  const [users, setUsers] = useState<RegisteredUser[]>([]);
  const [totalUsers, setTotalUsers] = useState<number>(7);
  const [isLimitReached, setIsLimitReached] = useState<boolean>(false);
  const [maxLimit] = useState<number>(10);
  const [activeRecipientId, setActiveRecipientId] = useState<string>('');

  // Form State for Adding New User
  const [newUserName, setNewUserName] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserCrop, setNewUserCrop] = useState('');
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [userError, setUserError] = useState<string | null>(null);
  const [userSuccess, setUserSuccess] = useState<string | null>(null);

  // 2. Gateway Configuration & Test State
  const [gatewayConfig, setGatewayConfig] = useState<SmsGatewayConfig>({
    provider: 'Fast2SMS',
    sirenDurationSeconds: 30,
    language: 'all',
  });
  const [fast2smsInputKey, setFast2smsInputKey] = useState('');
  const [isFast2smsConfigured, setIsFast2smsConfigured] = useState(false);
  const [fast2smsMaskedKey, setFast2smsMaskedKey] = useState('');
  const [saveKeyStatus, setSaveKeyStatus] = useState<string | null>(null);
  const [saveKeyError, setSaveKeyError] = useState<string | null>(null);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [configSuccess, setConfigSuccess] = useState<string | null>(null);

  // Last Dispatched SMS Info (for immediate viewing and direct device SMS launch)
  const [lastDispatchedSms, setLastDispatchedSms] = useState<{
    recipient: string;
    ownerName: string;
    crop: string;
    message: string;
    smsUri?: string;
    gateway: string;
  } | null>(null);

  // Test SMS State
  const [testStatus, setTestStatus] = useState<{
    state: 'idle' | 'sending' | 'success' | 'failed';
    message: string;
  }>({ state: 'idle', message: '' });

  // 3. Siren & Event Triggering State
  const [isTriggering, setIsTriggering] = useState(false);
  const [sirenCountdown, setSirenCountdown] = useState<number>(0);
  const [activeDetectionTitle, setActiveDetectionTitle] = useState<string | null>(null);

  // 4. Alert History State
  const [alertHistory, setAlertHistory] = useState<AlertHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [selectedRecipientUser, setSelectedRecipientUser] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Load initial data on mount
  useEffect(() => {
    fetchUsers();
    fetchConfig();
    fetchAlertHistory();

    const handleCountdown = (e: any) => {
      if (e.detail?.remainingSeconds !== undefined) {
        setSirenCountdown(e.detail.remainingSeconds);
      }
    };

    const handleAlertStopped = () => {
      setSirenCountdown(0);
      setActiveDetectionTitle(null);
    };

    window.addEventListener('farm:siren:countdown', handleCountdown);
    window.addEventListener('farm:alert:stopped', handleAlertStopped);

    return () => {
      window.removeEventListener('farm:siren:countdown', handleCountdown);
      window.removeEventListener('farm:alert:stopped', handleAlertStopped);
    };
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        const userList: RegisteredUser[] = data.users || [];
        setUsers(userList);
        setTotalUsers(data.total !== undefined ? data.total : userList.length);
        setIsLimitReached(Boolean(data.isLimitReached));

        // Auto-select active recipient
        const savedPhone = localStorage.getItem('farmer_mobile_number');
        if (savedPhone) {
          const match = userList.find(u => u.mobileNumber.replace(/[^0-9]/g, '') === savedPhone.replace(/[^0-9]/g, ''));
          if (match) {
            setActiveRecipientId(match.id);
            return;
          }
        }
        if (userList.length > 0 && !activeRecipientId) {
          setActiveRecipientId(userList[0].id);
        }
      }
    } catch (e) {
      console.warn('Could not fetch registered users:', e);
    }
  };

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/sms/config');
      if (res.ok) {
        const data = await res.json();
        if (data.config) {
          setGatewayConfig(prev => ({ ...prev, ...data.config }));
          const configured = Boolean(data.config.fast2smsConfigured);
          setIsFast2smsConfigured(configured);
          setFast2smsMaskedKey(data.config.fast2smsApiKeyMasked || (configured ? '••••••••••••••••' : ''));
        }
      }
    } catch (e) {
      console.warn('Could not fetch SMS config:', e);
    }
  };

  const fetchAlertHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const res = await fetch('/api/alerts/history');
      if (res.ok) {
        const data = await res.json();
        setAlertHistory(data.alerts || []);
      }
    } catch (e) {
      console.warn('Could not fetch alert history:', e);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Add User (Strict Max 10 Check) & Set as Active Recipient
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserError(null);
    setUserSuccess(null);

    if (totalUsers >= maxLimit) {
      setUserError('User limit reached. Maximum 10 users are allowed.');
      return;
    }

    if (!newUserName.trim() || !newUserPhone.trim() || !newUserCrop.trim()) {
      setUserError('Please fill in Name, Mobile Phone Number, and Field/Crop Name.');
      return;
    }

    setIsAddingUser(true);
    try {
      const cleanPhone = newUserPhone.trim();
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newUserName.trim(),
          mobileNumber: cleanPhone,
          cropName: newUserCrop.trim(),
          fieldLocation: locationName,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setUserSuccess(`✅ Field owner "${newUserName}" (${cleanPhone}) registered & set as Active SMS Target!`);
        localStorage.setItem('farmer_mobile_number', cleanPhone);
        localStorage.setItem('farmer_name', newUserName.trim());
        localStorage.setItem('farmer_crop', newUserCrop.trim());
        setNewUserName('');
        setNewUserPhone('');
        setNewUserCrop('');
        if (data.user?.id) {
          setActiveRecipientId(data.user.id);
          setSelectedRecipientUser(data.user.id);
        }
        if (data.users) {
          setUsers(data.users);
          setTotalUsers(data.total);
          setIsLimitReached(data.isLimitReached);
        } else {
          fetchUsers();
        }
      } else {
        setUserError(data.error || 'Failed to add user');
      }
    } catch (err: any) {
      setUserError('Network error while registering user: ' + err.message);
    } finally {
      setIsAddingUser(false);
    }
  };

  // Delete User (frees up slot permanently, NO blocking popup!)
  const handleDeleteUser = async (userId: string, userName: string) => {
    try {
      const res = await fetch(`/api/users/${userId}`, { method: 'DELETE' });
      if (res.ok) {
        const data = await res.json();
        setUserSuccess(`🗑️ Successfully removed field owner "${userName}". Slot freed up!`);
        setTimeout(() => setUserSuccess(null), 4000);
        
        const remainingUsers: RegisteredUser[] = data.users || users.filter(u => u.id !== userId);
        setUsers(remainingUsers);
        setTotalUsers(data.total !== undefined ? data.total : remainingUsers.length);
        setIsLimitReached(Boolean(data.isLimitReached));

        // Clean up active recipient & localStorage so deleted number never comes back on its own
        const savedPhone = localStorage.getItem('farmer_mobile_number') || '';
        const deletedUser = users.find(u => u.id === userId);
        const isSavedPhoneMatch = deletedUser && savedPhone.replace(/[^0-9]/g, '').slice(-10) === deletedUser.mobileNumber.replace(/[^0-9]/g, '').slice(-10);

        if (activeRecipientId === userId || isSavedPhoneMatch) {
          const nextActive = remainingUsers.length > 0 ? remainingUsers[0] : null;
          if (nextActive) {
            setActiveRecipientId(nextActive.id);
            setSelectedRecipientUser(nextActive.id);
            localStorage.setItem('farmer_mobile_number', nextActive.mobileNumber);
            localStorage.setItem('farmer_name', nextActive.name);
            localStorage.setItem('farmer_crop', nextActive.cropName);
          } else {
            setActiveRecipientId('');
            setSelectedRecipientUser('');
            localStorage.removeItem('farmer_mobile_number');
            localStorage.removeItem('farmer_name');
            localStorage.removeItem('farmer_crop');
          }
        }
      } else {
        setUserError('Failed to remove user.');
      }
    } catch (e: any) {
      setUserError('Network error while deleting user: ' + e.message);
    }
  };

  // Clear all default sample users leaving only user-registered phone numbers
  const handleClearDefaultUsers = async () => {
    try {
      const res = await fetch('/api/users/clear-defaults', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setUserSuccess('🗑️ Removed sample mock users. Only your registered numbers remain!');
        setTimeout(() => setUserSuccess(null), 4000);
        const remainingUsers: RegisteredUser[] = data.users || [];
        setUsers(remainingUsers);
        setTotalUsers(data.total || remainingUsers.length);
        setIsLimitReached(false);

        if (remainingUsers.length > 0) {
          setActiveRecipientId(remainingUsers[0].id);
          setSelectedRecipientUser(remainingUsers[0].id);
          localStorage.setItem('farmer_mobile_number', remainingUsers[0].mobileNumber);
          localStorage.setItem('farmer_name', remainingUsers[0].name);
          localStorage.setItem('farmer_crop', remainingUsers[0].cropName);
        }
      }
    } catch (e: any) {
      setUserError('Could not clear defaults: ' + e.message);
    }
  };

  // Set specific user as active recipient
  const handleSetActiveRecipient = (user: RegisteredUser) => {
    setActiveRecipientId(user.id);
    setSelectedRecipientUser(user.id);
    localStorage.setItem('farmer_mobile_number', user.mobileNumber);
    localStorage.setItem('farmer_name', user.name);
    localStorage.setItem('farmer_crop', user.cropName);
    setUserSuccess(`⭐ ${user.name} (${user.mobileNumber}) set as Active Alert Target! All camera & sensor SMS will go here.`);
    setTimeout(() => setUserSuccess(null), 4000);
  };

  // Trigger alert and siren specifically for THIS OWNER
  const handleTriggerOwnerSpecificAlert = async (user: RegisteredUser, category: 'deer' | 'cow' | 'boar' | 'pest' | 'disease' = 'deer') => {
    setIsTriggering(true);
    setUserError(null);
    setUserSuccess(null);
    const label = category === 'deer' ? '🦌 Deer Intrusion' : category === 'cow' ? '🐄 Cow Intrusion' : category === 'boar' ? '🐗 Wild Animal' : (category === 'pest' ? '🐛 Pest Attack' : '🌿 Crop Disease');
    setActiveDetectionTitle(`🚨 ${label} Triggered for ${user.name}!`);

    // Auto-select this owner as the active target so camera and sensor alerts target this owner
    handleSetActiveRecipient(user);

    // 1. Siren ON immediately with personalized voice alert
    const animalNameTelugu = category === 'deer' ? 'జింక' : category === 'cow' ? 'ఆవు/పశువు' : category === 'boar' ? 'అడవి పంది' : (category === 'pest' ? 'పురుగుల దాడి' : 'పంట తెగులు');
    startContinuousSirenLoop({
      category: ['deer', 'cow', 'boar'].includes(category) ? 'animal' : 'insect',
      title: `🚨 ${label.toUpperCase()} - ${user.name.toUpperCase()} (${user.cropName.toUpperCase()})`,
      speechText: `హెచ్చరిక! ${user.name} గారి ${user.cropName} పొలంలో ${animalNameTelugu} గుర్తించబడింది! సైరన్ మోగుతోంది!`,
      language: currentLanguage,
      durationSeconds: gatewayConfig.sirenDurationSeconds || 30,
    });

    // 2. Dispatch SMS tailored to THIS OWNER
    try {
      const res = await fetch('/api/notifications/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          problem: label,
          crop: user.cropName,
          severity: 'HIGH',
          location: user.fieldLocation || locationName,
          mobileNumber: user.mobileNumber,
          ownerName: user.name,
          broadcastAllUsers: false,
          language: gatewayConfig.language || 'all',
          isHealthy: false,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setUserSuccess(`🚨 Siren ON! SMS accepted by the gateway for ${user.name} (${user.mobileNumber}).`);
        setTimeout(() => setUserSuccess(null), 5000);
        setLastDispatchedSms({
          recipient: user.mobileNumber,
          ownerName: user.name,
          crop: user.cropName,
          message: data.smsBody,
          smsUri: data.smsUri,
          gateway: data.gateway,
        });
        fetchAlertHistory();
      } else {
        setUserError(data.error || data.status || 'The SMS gateway did not accept the alert.');
        fetchAlertHistory();
      }
    } catch (e: any) {
      console.warn('Error triggering owner alert:', e);
      setUserError(`Could not contact the SMS service: ${e.message}`);
    } finally {
      setIsTriggering(false);
    }
  };

  // Send Test SMS directly to a specific user
  const handleSendTestSmsToUser = async (user: RegisteredUser) => {
    if (!isFast2smsConfigured && !gatewayConfig.fast2smsConfigured && !fast2smsInputKey.trim()) {
      setTestStatus({
        state: 'failed',
        message: 'Fast2SMS API Key is not configured.',
      });
      return;
    }

    setTestStatus({ state: 'sending', message: `Contacting Fast2SMS for ${user.name} (${user.mobileNumber})...` });

    try {
      const res = await fetch('/api/sms/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobileNumber: user.mobileNumber,
          ownerName: user.name,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTestStatus({
          state: 'success',
          message: 'SMS request accepted by Fast2SMS.',
        });
        setLastDispatchedSms({
          recipient: user.mobileNumber,
          ownerName: user.name,
          crop: user.cropName,
          message: data.message || 'SMS request accepted by Fast2SMS.',
          smsUri: data.smsUri,
          gateway: 'Fast2SMS',
        });
        fetchAlertHistory();
      } else {
        if (data.isConfigMissing || data.error?.includes('not configured')) {
          setTestStatus({
            state: 'failed',
            message: 'Fast2SMS API Key is not configured.',
          });
        } else {
          setTestStatus({
            state: 'failed',
            message: data.error || data.status || 'Fast2SMS rejected the request.',
          });
        }
      }
    } catch (err: any) {
      setTestStatus({
        state: 'failed',
        message: 'Fast2SMS Network Error: ' + err.message,
      });
    }
  };

  // Save Fast2SMS API Key (Requirements 1, 2, 3, 8)
  const handleSaveFast2smsKey = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!fast2smsInputKey.trim()) {
      setSaveKeyError('Please paste your Fast2SMS API Key before saving.');
      return;
    }
    setIsSavingConfig(true);
    setSaveKeyError(null);
    setSaveKeyStatus(null);

    try {
      const res = await fetch('/api/sms/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...gatewayConfig,
          provider: 'Fast2SMS',
          fast2smsApiKey: fast2smsInputKey.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsFast2smsConfigured(true);
        setFast2smsMaskedKey('••••••••••••••••');
        setFast2smsInputKey('');
        setSaveKeyStatus('✅ Fast2SMS API Key saved securely to FAST2SMS_API_KEY!');
        setTimeout(() => setSaveKeyStatus(null), 4000);
        fetchConfig();
      } else {
        setSaveKeyError(data.error || 'Failed to save Fast2SMS API Key.');
      }
    } catch (err: any) {
      setSaveKeyError('Network error while saving key: ' + err.message);
    } finally {
      setIsSavingConfig(false);
    }
  };

  // Save SMS Gateway Configuration
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingConfig(true);
    setConfigSuccess(null);

    try {
      const res = await fetch('/api/sms/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gatewayConfig),
      });

      if (res.ok) {
        setConfigSuccess('✅ SMS Gateway credentials and Siren settings saved successfully!');
        setTimeout(() => setConfigSuccess(null), 4000);
      }
    } catch (err) {
      console.warn('Failed to save config:', err);
    } finally {
      setIsSavingConfig(false);
    }
  };

  // 📱 Send Test SMS Button (Using Fast2SMS API - Requirements 9, 10, 11, 12)
  const handleSendTestSms = async () => {
    // 10. If the API key is missing, show: “Fast2SMS API Key is not configured.”
    if (!isFast2smsConfigured && !gatewayConfig.fast2smsConfigured && !fast2smsInputKey.trim()) {
      setTestStatus({
        state: 'failed',
        message: 'Fast2SMS API Key is not configured.',
      });
      return;
    }

    const activeTarget = users.find(u => u.id === selectedRecipientUser) || 
                         users.find(u => u.id === activeRecipientId) || 
                         users[0];
    const targetPhone = activeTarget?.mobileNumber || '+91 6303015695';
    const ownerName = activeTarget?.name || 'Field Owner';

    setTestStatus({ state: 'sending', message: `Contacting Fast2SMS for ${targetPhone}...` });

    try {
      const res = await fetch('/api/sms/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobileNumber: targetPhone,
          ownerName,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // 11. If the API request succeeds, show: “SMS request accepted by Fast2SMS.”
        setTestStatus({
          state: 'success',
          message: 'SMS request accepted by Fast2SMS.',
        });
        setLastDispatchedSms({
          recipient: targetPhone,
          ownerName,
          crop: activeTarget?.cropName || defaultCrop,
          message: data.message || 'SMS request accepted by Fast2SMS.',
          smsUri: data.smsUri,
          gateway: 'Fast2SMS',
        });
        fetchAlertHistory();
      } else {
        // 10. If the API key is missing
        if (data.isConfigMissing || data.error?.includes('not configured')) {
          setTestStatus({
            state: 'failed',
            message: 'Fast2SMS API Key is not configured.',
          });
        } else {
          // 12. If it fails, show the actual error returned by Fast2SMS without exposing the API key
          setTestStatus({
            state: 'failed',
            message: data.error || data.status || 'Fast2SMS rejected the request.',
          });
        }
      }
    } catch (err: any) {
      setTestStatus({
        state: 'failed',
        message: 'Fast2SMS Network Error: ' + err.message,
      });
    }
  };

  // Trigger real-time detection event
  const triggerDetectionEvent = async (event: {
    category: 'deer' | 'cow' | 'boar' | 'monkey' | 'pest' | 'disease' | 'fire' | 'soil';
    label: string;
    crop?: string;
    isHighPriorityAnimalOrFire: boolean;
  }) => {
    setIsTriggering(true);
    setUserError(null);
    setUserSuccess(null);
    const targetUser = users.find(u => u.id === selectedRecipientUser);
    const crop = targetUser?.cropName || event.crop || defaultCrop;

    setActiveDetectionTitle(`${event.label} Detected in ${crop}!`);

    // 1. SIREN ON (if animal or fire) - Configurable period, e.g. 30 seconds
    if (event.isHighPriorityAnimalOrFire) {
      startContinuousSirenLoop({
        category: 'animal',
        title: `🚨 ${event.label.toUpperCase()} DETECTED! SIREN ACTIVATED`,
        speechText: `హెచ్చరిక! పొలంలోకి ${event.label} వచ్చింది! అత్యవసర సైరన్ మోగించబడింది! పంటను రక్షించండి!`,
        language: currentLanguage,
        durationSeconds: gatewayConfig.sirenDurationSeconds || 30,
      });
    } else if (event.category === 'pest' || event.category === 'disease') {
      playAlertSound('HIGH');
    } else {
      playAlertSound('soil');
    }

    // 2. SMS = SEND IMMEDIATELY (Do NOT wait for siren to finish!)
    try {
      const formattedTime = new Date().toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });

      const res = await fetch('/api/notifications/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: event.category,
          problem: `${event.label} Detected`,
          crop,
          severity: 'HIGH',
          location: locationName,
          mobileNumber: targetUser?.mobileNumber,
          ownerName: targetUser?.name,
          broadcastAllUsers: selectedRecipientUser === 'all',
          language: gatewayConfig.language || 'all',
          isHealthy: false,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const recipientText = (data.recipients || [])
          .map((recipient: { ownerName: string; mobileNumber: string }) => `${recipient.ownerName} (${recipient.mobileNumber})`)
          .join(', ');
        setUserSuccess(`SMS accepted by gateway for ${recipientText || data.recipient || 'the registered mobile number'}.`);
        fetchAlertHistory();
      } else {
        setUserError(data.error || data.status || 'The SMS gateway did not accept the alert.');
        fetchAlertHistory();
      }
    } catch (e) {
      console.warn('SMS dispatch error:', e);
      setUserError('Could not contact the SMS service. Check the server connection and try again.');
    } finally {
      setIsTriggering(false);
    }
  };

  const handleStopSiren = () => {
    stopContinuousSirenLoop();
    setSirenCountdown(0);
    setActiveDetectionTitle(null);
  };

  const handleClearHistory = async () => {
    try {
      await fetch('/api/alerts/history', { method: 'DELETE' });
      setAlertHistory([]);
    } catch (e) {
      console.warn('Could not clear history:', e);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      
      {/* ============================================================== */}
      {/* 1. TOP HEADER & LIMITED USER ACCESS BANNER */}
      {/* ============================================================== */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950 via-teal-950 to-emerald-950 border-2 border-emerald-500 shadow-2xl text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center font-black shadow-lg">
              <ShieldCheck className="w-7 h-7 text-yellow-300" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  Real-Time AI Crop Monitoring & Security System
                </h2>
                {/* Registered Users Count Badge (Required: Registered Users: 7/10) */}
                <span className={`px-3 py-1 rounded-full text-xs font-mono font-black border flex items-center gap-1.5 shadow ${
                  isLimitReached 
                    ? 'bg-red-500/20 text-red-300 border-red-500/50' 
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                }`}>
                  <Users className="w-3.5 h-3.5" />
                  <span>Registered Users: {totalUsers}/{maxLimit}</span>
                </span>
              </div>
              <p className="text-xs text-emerald-300/80 mt-1">
                AI Detection Confirmed → Siren ON (30s) → Real SMS Dispatched Immediately to Registered Mobile Phone.
              </p>
            </div>
          </div>

          {/* Quick Siren Status Indicator */}
          {sirenCountdown > 0 ? (
            <div className="p-3 rounded-2xl bg-red-600/90 border border-yellow-300 text-white flex items-center gap-2.5 animate-pulse shadow-lg">
              <Volume2 className="w-5 h-5 text-yellow-300 animate-bounce" />
              <div>
                <div className="text-xs font-black text-yellow-300">🔊 SIREN = ON ({sirenCountdown}s)</div>
                <div className="text-[10px] opacity-90">Auto-shutoff in {sirenCountdown}s</div>
              </div>
              <button
                onClick={handleStopSiren}
                className="px-2.5 py-1 rounded-xl bg-black/60 hover:bg-black/80 text-white text-[10px] font-black uppercase cursor-pointer"
              >
                Stop
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-2xl bg-black/40 border border-emerald-800 text-xs text-emerald-300 font-mono">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-ping" />
              <span>Siren = STANDBY (30s Timer)</span>
            </div>
          )}
        </div>

        {/* User Limit Reached Notice Banner (Requirement 1) */}
        {isLimitReached && (
          <div className="mt-4 p-3.5 rounded-2xl bg-red-950/80 border-2 border-red-500 text-white text-xs flex items-center gap-2.5 font-bold animate-in fade-in">
            <AlertTriangle className="w-5 h-5 text-yellow-300 flex-shrink-0" />
            <div>
              <span className="text-yellow-300 uppercase tracking-wide">User limit reached. Maximum 10 users are allowed.</span>
              <p className="text-[11px] text-red-200/90 font-normal">
                To register a new field owner, delete an existing user using the trash icon or click "Clear Sample Users".
              </p>
            </div>
          </div>
        )}

        {/* Capacity Bar */}
        <div className="mt-5 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-mono text-emerald-300">
            <span>User Quota Usage ({totalUsers} of {maxLimit} Slots Allocated)</span>
            <span className="font-bold">{Math.round((totalUsers / maxLimit) * 100)}%</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-black/60 overflow-hidden p-0.5 border border-emerald-800">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                isLimitReached ? 'bg-gradient-to-r from-amber-500 to-red-500' : 'bg-gradient-to-r from-emerald-400 to-teal-400'
              }`}
              style={{ width: `${(totalUsers / maxLimit) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 1.5 INSTANT DISPATCHED SMS CARD & DIRECT MOBILE LAUNCHER */}
      {/* ============================================================== */}
      {lastDispatchedSms && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-cyan-950 via-slate-900 to-emerald-950 border-2 border-cyan-400 shadow-2xl text-white space-y-3 animate-in fade-in slide-in-from-top-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-cyan-800 gap-2">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                <Smartphone className="w-5 h-5 text-cyan-300 animate-pulse" />
              </span>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-black text-sm text-cyan-200">
                    📱 Direct SMS Dispatched to: {lastDispatchedSms.ownerName}
                  </h4>
                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/30 text-cyan-200 font-mono text-xs font-bold border border-cyan-400/50">
                    {lastDispatchedSms.recipient}
                  </span>
                </div>
                <p className="text-[11px] text-cyan-300/80">
                  Target Field: {lastDispatchedSms.crop} | Gateway: {lastDispatchedSms.gateway} | Status: ✅ Sent
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {lastDispatchedSms.smsUri && (
                <a
                  href={lastDispatchedSms.smsUri}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg active:scale-95 transition cursor-pointer"
                  title="Open this message directly in your phone's SMS app"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>📲 Open in Phone SMS App</span>
                </a>
              )}
              <button
                onClick={() => copyToClipboard(lastDispatchedSms.message, 'last-sms')}
                className="px-3 py-2 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-700 text-cyan-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                {copiedId === 'last-sms' ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy SMS</span>
              </button>
              <button
                onClick={() => setLastDispatchedSms(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                title="Dismiss"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-black/60 border border-cyan-900/60 font-mono text-xs text-cyan-100 whitespace-pre-wrap leading-relaxed shadow-inner">
            {lastDispatchedSms.message}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. REGISTRATION SECTION & REGISTERED USERS LIST */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (5 cols): Registration Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-5 rounded-3xl bg-emerald-950/90 border border-emerald-800 shadow-xl text-white space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-800">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-400" />
                <h3 className="font-black text-base text-white">
                  Register Field Owner ({totalUsers}/{maxLimit})
                </h3>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono">
                {maxLimit - totalUsers} slots left
              </span>
            </div>

            <form onSubmit={handleAddUser} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-emerald-300 font-bold mb-1">
                  Owner Name <span className="text-red-400">*</span>:
                </label>
                <input
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g. Ravi Kumar"
                  disabled={isLimitReached}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-emerald-700 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-emerald-300 font-bold mb-1">
                  Mobile Phone Number (SMS Target) <span className="text-red-400">*</span>:
                </label>
                <input
                  type="text"
                  value={newUserPhone}
                  onChange={(e) => setNewUserPhone(e.target.value)}
                  placeholder="+91 98491 55432"
                  disabled={isLimitReached}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-emerald-700 text-cyan-300 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-cyan-400 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-emerald-300 font-bold mb-1">
                  Field / Crop Name <span className="text-red-400">*</span>:
                </label>
                <input
                  type="text"
                  value={newUserCrop}
                  onChange={(e) => setNewUserCrop(e.target.value)}
                  placeholder="e.g. Tomato (North Sector)"
                  disabled={isLimitReached}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-emerald-700 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:opacity-50"
                />
              </div>

              {userError && (
                <div className="p-3 rounded-xl bg-red-950/80 border border-red-600 text-red-200 text-xs font-bold animate-in fade-in">
                  {userError}
                </div>
              )}

              {userSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-200 text-xs font-bold animate-in fade-in">
                  {userSuccess}
                </div>
              )}

              <button
                type="submit"
                disabled={isAddingUser || isLimitReached}
                className={`w-full py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow cursor-pointer transition active:scale-95 ${
                  isLimitReached 
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                }`}
              >
                {isAddingUser ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                <span>{isLimitReached ? 'Limit Reached (10/10)' : '+ Register User'}</span>
              </button>
            </form>
          </div>

          {/* SMS Gateway Configuration & Test Button (Requirements 1, 2, 8, 9, 10, 11, 12) */}
          <div className="hidden p-5 rounded-3xl bg-emerald-950/90 border border-emerald-800 shadow-xl text-white space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-800">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-cyan-400" />
                <h3 className="font-black text-base text-white">
                  SMS Gateway Configuration
                </h3>
              </div>
              <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border ${
                isFast2smsConfigured
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/50'
              }`}>
                {isFast2smsConfigured ? '● FAST2SMS_API_KEY Active' : '○ Key Missing'}
              </span>
            </div>

            {/* Fast2SMS API Key Input & Save API Key Button (Requirements 1, 2, 3, 8) */}
            <form onSubmit={handleSaveFast2smsKey} className="space-y-3.5 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-emerald-300 font-bold flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-yellow-300" />
                    <span>Fast2SMS API Key</span>
                  </label>
                  {isFast2smsConfigured && (
                    <span className="text-[11px] font-mono text-emerald-300 font-bold">
                      Saved: {fast2smsMaskedKey || '••••••••••••••••'}
                    </span>
                  )}
                </div>

                <div className="relative">
                  <input
                    type="password"
                    value={fast2smsInputKey}
                    onChange={(e) => setFast2smsInputKey(e.target.value)}
                    placeholder={isFast2smsConfigured ? '••••••••••••••••' : '[ Paste your Fast2SMS API Key here ]'}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-emerald-700 text-cyan-300 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder:text-gray-500"
                  />
                </div>
                <p className="text-[10px] text-emerald-400/80 mt-1">
                  Stored securely on backend environment variable: <code className="bg-black/50 px-1 py-0.5 rounded text-cyan-200 font-mono">FAST2SMS_API_KEY</code>. Masked after saving.
                </p>
              </div>

              {/* Save API Key Button (Requirement 2) */}
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={isSavingConfig}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow cursor-pointer active:scale-95 transition"
                >
                  {isSavingConfig ? <RefreshCw className="w-4 h-4 animate-spin text-slate-950" /> : <Save className="w-4 h-4 text-slate-950" />}
                  <span>Save API Key</span>
                </button>
              </div>

              {saveKeyStatus && (
                <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500 text-emerald-200 text-xs font-bold animate-in fade-in flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{saveKeyStatus}</span>
                </div>
              )}

              {saveKeyError && (
                <div className="p-2.5 rounded-xl bg-red-950/80 border border-red-600 text-red-200 text-xs font-bold animate-in fade-in flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-300 flex-shrink-0" />
                  <span>{saveKeyError}</span>
                </div>
              )}
            </form>

            {/* Siren Duration & Language Controls */}
            <div className="pt-2 border-t border-emerald-800/80 grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="block text-emerald-300 font-bold mb-1">Siren Duration (s):</label>
                <input
                  type="number"
                  min="5"
                  max="120"
                  value={gatewayConfig.sirenDurationSeconds}
                  onChange={(e) => {
                    const val = Number(e.target.value) || 30;
                    setGatewayConfig(prev => ({ ...prev, sirenDurationSeconds: val }));
                    fetch('/api/sms/config', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ sirenDurationSeconds: val }),
                    }).catch(console.warn);
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-emerald-700 text-white font-mono focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>
              <div>
                <label className="block text-emerald-300 font-bold mb-1">SMS Language:</label>
                <select
                  value={gatewayConfig.language}
                  onChange={(e) => {
                    const lang = e.target.value as any;
                    setGatewayConfig(prev => ({ ...prev, language: lang }));
                    fetch('/api/sms/config', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ language: lang }),
                    }).catch(console.warn);
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-emerald-700 text-yellow-300 font-bold focus:outline-none focus:ring-2 focus:ring-cyan-400"
                >
                  <option value="all">Telugu + Hindi + English</option>
                  <option value="te">తెలుగు (Telugu)</option>
                  <option value="hi">हिन्दी (Hindi)</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>

            {/* Test SMS Button (Requirements 9, 10, 11, 12) */}
            <div className="pt-3 border-t border-emerald-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-cyan-400" />
                  <span>SMS Connectivity Verification:</span>
                </span>
                <span className="text-[10px] text-emerald-300 font-mono">
                  Fast2SMS API
                </span>
              </div>

              <button
                onClick={handleSendTestSms}
                disabled={testStatus.state === 'sending'}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow cursor-pointer active:scale-95 transition"
              >
                {testStatus.state === 'sending' ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                ) : (
                  <Send className="w-4 h-4 text-slate-950" />
                )}
                <span>📱 Test SMS</span>
              </button>

              {/* Status Output according to Requirements 10, 11, 12 */}
              {testStatus.message && (
                <div className={`p-3 rounded-xl text-xs font-bold font-mono animate-in fade-in flex items-center gap-2 ${
                  testStatus.state === 'success' 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                    : testStatus.state === 'failed' 
                    ? 'bg-red-500/20 text-red-300 border border-red-500/40' 
                    : 'bg-black/50 text-cyan-300 border border-cyan-500/40'
                }`}>
                  {testStatus.state === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  ) : testStatus.state === 'failed' ? (
                    <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  ) : (
                    <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin flex-shrink-0" />
                  )}
                  <span>{testStatus.message}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (7 cols): Registered Users Table & Detection Simulation */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Registered Users Table (Requirement 1 & Per-Owner Actions) */}
          <div className="p-5 rounded-3xl bg-emerald-950/90 border border-emerald-800 shadow-xl text-white space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-emerald-800 gap-2">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-black text-base text-white">
                    Registered Field Owners ({totalUsers}/{maxLimit})
                  </h3>
                  <p className="text-[10px] text-emerald-300/80">
                    Click any owner's "Siren & SMS" button to trigger their personalized alert and siren!
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {users.some(u => u.id.startsWith('usr-0')) && (
                  <button
                    onClick={handleClearDefaultUsers}
                    className="px-2.5 py-1 rounded-xl bg-red-950/70 hover:bg-red-900 border border-red-700 text-red-200 text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                    title="Remove pre-seeded dummy users and keep only your registered numbers"
                  >
                    <Trash2 className="w-3 h-3 text-red-300" />
                    <span>Clear Sample Users</span>
                  </button>
                )}
                <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full ${
                  isLimitReached ? 'bg-red-500 text-white' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}>
                  {isLimitReached ? 'MAX LIMIT REACHED (10/10)' : `${maxLimit - totalUsers} SLOTS AVAILABLE`}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-emerald-800/80 text-[11px] text-emerald-300 font-bold uppercase tracking-wider bg-black/20">
                    <th className="py-2.5 px-3">Owner</th>
                    <th className="py-2.5 px-3">Mobile Number</th>
                    <th className="py-2.5 px-3">Crop Field</th>
                    <th className="py-2.5 px-3 text-right">Owner Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-900/60">
                  {users.map((u, index) => {
                    const isActive = activeRecipientId === u.id;
                    return (
                      <tr key={u.id} className={`hover:bg-emerald-900/40 transition ${isActive ? 'bg-emerald-900/20' : ''}`}>
                        <td className="py-2.5 px-3 font-bold text-white">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-emerald-800 text-[10px] font-mono flex items-center justify-center text-emerald-200 flex-shrink-0">
                              {index + 1}
                            </span>
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold text-white">{u.name}</span>
                                {isActive && (
                                  <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-bold">
                                    ⭐ Active Target
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-emerald-400/70 block">
                                {u.fieldLocation || 'Field Sector'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-cyan-300 font-bold whitespace-nowrap">
                          {u.mobileNumber}
                        </td>
                        <td className="py-2.5 px-3 text-emerald-200 whitespace-nowrap">
                          {u.cropName}
                        </td>
                        <td className="py-2.5 px-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* 1. Siren & Personalized Alert Button */}
                            <button
                              onClick={() => handleTriggerOwnerSpecificAlert(u, 'deer')}
                              disabled={isTriggering}
                              className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-[11px] flex items-center gap-1 shadow cursor-pointer active:scale-95 transition"
                              title={`Trigger Siren & Dispatch Emergency SMS to ${u.name} (${u.mobileNumber})`}
                            >
                              <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                              <span>Siren & SMS</span>
                            </button>

                            {/* 2. Direct Test SMS Button */}
                            <button
                              onClick={() => handleSendTestSmsToUser(u)}
                              disabled={testStatus.state === 'sending'}
                              className="px-2 py-1 rounded-lg bg-cyan-700/80 hover:bg-cyan-600 text-cyan-100 font-bold text-[10px] flex items-center gap-1 border border-cyan-600 cursor-pointer active:scale-95 transition"
                              title={`Send test SMS directly to ${u.mobileNumber}`}
                            >
                              <Send className="w-3 h-3" />
                              <span>Test</span>
                            </button>

                            {/* 3. Set Active Recipient Button */}
                            {!isActive && (
                              <button
                                onClick={() => handleSetActiveRecipient(u)}
                                className="p-1 rounded-lg bg-emerald-950/70 hover:bg-emerald-800 text-emerald-300 border border-emerald-700 text-[10px] font-bold cursor-pointer"
                                title={`Set ${u.name} as primary active target for camera alerts`}
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* 4. Delete User Button (Instant, No Window.confirm blocker) */}
                            <button
                              onClick={() => handleDeleteUser(u.id, u.name)}
                              className="p-1 rounded-lg text-emerald-400 hover:text-red-300 hover:bg-red-950/70 border border-transparent hover:border-red-800 transition cursor-pointer"
                              title={`Remove ${u.name} permanently to free 1 slot`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {users.length === 0 && (
              <div className="p-6 text-center text-emerald-300/70 text-xs border border-dashed border-emerald-800 rounded-2xl">
                No registered owners yet. Register your phone number on the left to receive immediate SMS alerts directly on your phone!
              </div>
            )}
          </div>

          {/* Real-Time Detection Triggers (Requirement 2, 3, 5) */}
          <div className="p-5 rounded-3xl bg-emerald-950/90 border border-emerald-800 shadow-xl text-white space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-emerald-800 gap-2">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-rose-400 animate-bounce" />
                <h3 className="font-black text-base text-white">
                  Real-Time AI Detection & Immediate SMS Dispatch
                </h3>
              </div>
              
              {/* Recipient Filter */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-emerald-300 text-[11px]">Send to:</span>
                <select
                  value={selectedRecipientUser}
                  onChange={(e) => setSelectedRecipientUser(e.target.value)}
                  className="px-2.5 py-1 rounded-xl bg-black/60 border border-emerald-700 text-cyan-300 font-bold text-xs"
                >
                  <option value="all">📢 Broadcast to All {users.length} Registered Owners</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.mobileNumber})</option>
                  ))}
                </select>
              </div>
            </div>

            <p className="text-xs text-emerald-200/80">
              When the camera/AI detects any dangerous condition below:
              <strong> Siren = ON (30s)</strong> and <strong>SMS = SEND IMMEDIATELY</strong> to the registered owner's phone.
            </p>

            {/* 8 Event Trigger Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              
              {/* 🦌 Deer */}
              <button
                onClick={() => triggerDetectionEvent({
                  category: 'deer',
                  label: '🦌 Deer',
                  crop: 'Tomato',
                  isHighPriorityAnimalOrFire: true,
                })}
                disabled={isTriggering}
                className="p-3 rounded-2xl bg-amber-950/80 hover:bg-amber-900 border border-amber-700 text-white text-left flex flex-col justify-between cursor-pointer active:scale-95 transition shadow"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">🦌</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-600 text-white font-black">SIREN ON</span>
                </div>
                <div className="mt-2">
                  <div className="font-black text-xs text-amber-200">Deer Intrusion</div>
                  <div className="text-[9px] text-amber-300/70">30s Siren + SMS</div>
                </div>
              </button>

              {/* 🐄 Cow */}
              <button
                onClick={() => triggerDetectionEvent({
                  category: 'cow',
                  label: '🐄 Cow',
                  crop: 'Tomato',
                  isHighPriorityAnimalOrFire: true,
                })}
                disabled={isTriggering}
                className="p-3 rounded-2xl bg-amber-950/80 hover:bg-amber-900 border border-amber-700 text-white text-left flex flex-col justify-between cursor-pointer active:scale-95 transition shadow"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">🐄</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-600 text-white font-black">SIREN ON</span>
                </div>
                <div className="mt-2">
                  <div className="font-black text-xs text-amber-200">Cow / Cattle</div>
                  <div className="text-[9px] text-amber-300/70">30s Siren + SMS</div>
                </div>
              </button>

              {/* 🐗 Wild Boar */}
              <button
                onClick={() => triggerDetectionEvent({
                  category: 'boar',
                  label: '🐗 Wild Boar',
                  crop: 'Tomato',
                  isHighPriorityAnimalOrFire: true,
                })}
                disabled={isTriggering}
                className="p-3 rounded-2xl bg-red-950/80 hover:bg-red-900 border border-red-700 text-white text-left flex flex-col justify-between cursor-pointer active:scale-95 transition shadow"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">🐗</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-600 text-white font-black">SIREN ON</span>
                </div>
                <div className="mt-2">
                  <div className="font-black text-xs text-red-200">Wild Animal</div>
                  <div className="text-[9px] text-red-300/70">30s Siren + SMS</div>
                </div>
              </button>

              {/* 🐒 Monkey */}
              <button
                onClick={() => triggerDetectionEvent({
                  category: 'monkey',
                  label: '🐒 Monkey',
                  crop: 'Tomato',
                  isHighPriorityAnimalOrFire: true,
                })}
                disabled={isTriggering}
                className="p-3 rounded-2xl bg-amber-950/80 hover:bg-amber-900 border border-amber-700 text-white text-left flex flex-col justify-between cursor-pointer active:scale-95 transition shadow"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">🐒</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-600 text-white font-black">SIREN ON</span>
                </div>
                <div className="mt-2">
                  <div className="font-black text-xs text-amber-200">Monkey Troop</div>
                  <div className="text-[9px] text-amber-300/70">30s Siren + SMS</div>
                </div>
              </button>

              {/* 🐛 Pest */}
              <button
                onClick={() => triggerDetectionEvent({
                  category: 'pest',
                  label: '🐛 Pest Attack',
                  crop: 'Tomato',
                  isHighPriorityAnimalOrFire: false,
                })}
                disabled={isTriggering}
                className="p-3 rounded-2xl bg-rose-950/80 hover:bg-rose-900 border border-rose-700 text-white text-left flex flex-col justify-between cursor-pointer active:scale-95 transition shadow"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">🐛</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-600 text-white font-black">SIREN OFF</span>
                </div>
                <div className="mt-2">
                  <div className="font-black text-xs text-rose-200">Pest Attack</div>
                  <div className="text-[9px] text-rose-300/70">Instant SMS Alert</div>
                </div>
              </button>

              {/* 🌿 Crop Disease */}
              <button
                onClick={() => triggerDetectionEvent({
                  category: 'disease',
                  label: '🌿 Crop Disease',
                  crop: 'Tomato',
                  isHighPriorityAnimalOrFire: false,
                })}
                disabled={isTriggering}
                className="p-3 rounded-2xl bg-emerald-900/80 hover:bg-emerald-800 border border-emerald-600 text-white text-left flex flex-col justify-between cursor-pointer active:scale-95 transition shadow"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">🌿</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-600 text-white font-black">SIREN OFF</span>
                </div>
                <div className="mt-2">
                  <div className="font-black text-xs text-emerald-200">Crop Disease</div>
                  <div className="text-[9px] text-emerald-300/70">Instant SMS Alert</div>
                </div>
              </button>

              {/* 🔥 Fire */}
              <button
                onClick={() => triggerDetectionEvent({
                  category: 'fire',
                  label: '🔥 Fire Hazard',
                  crop: 'Tomato',
                  isHighPriorityAnimalOrFire: true,
                })}
                disabled={isTriggering}
                className="p-3 rounded-2xl bg-red-950/90 hover:bg-red-900 border-2 border-red-500 text-white text-left flex flex-col justify-between cursor-pointer active:scale-95 transition shadow animate-pulse"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">🔥</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-600 text-white font-black">SIREN ON</span>
                </div>
                <div className="mt-2">
                  <div className="font-black text-xs text-red-200">Fire / Smoke</div>
                  <div className="text-[9px] text-red-300/70">30s Siren + SMS</div>
                </div>
              </button>

              {/* 💧 Critical Soil Moisture */}
              <button
                onClick={() => triggerDetectionEvent({
                  category: 'soil',
                  label: '💧 Low Moisture',
                  crop: 'Tomato',
                  isHighPriorityAnimalOrFire: false,
                })}
                disabled={isTriggering}
                className="p-3 rounded-2xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-700 text-white text-left flex flex-col justify-between cursor-pointer active:scale-95 transition shadow"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">💧</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-600 text-slate-950 font-black">SIREN OFF</span>
                </div>
                <div className="mt-2">
                  <div className="font-black text-xs text-cyan-200">Low Moisture</div>
                  <div className="text-[9px] text-cyan-300/70">Instant SMS Alert</div>
                </div>
              </button>

            </div>
          </div>

        </div>

      </div>

      {/* ============================================================== */}
      {/* 3. ALERT HISTORY TABLE (Requirement 6) */}
      {/* ============================================================== */}
      <div className="p-6 rounded-3xl bg-emerald-950/80 border border-emerald-800 shadow-2xl text-white space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-emerald-800 gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-lg text-white">
                Alert History & Audited Dispatch Log
              </h3>
              <p className="text-xs text-emerald-300/80">
                Matches required audit columns: Owner | Detection | SMS Status | Siren Status
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchAlertHistory}
              disabled={isLoadingHistory}
              className="p-2 rounded-xl bg-emerald-900/60 hover:bg-emerald-800 text-emerald-300 text-xs font-bold border border-emerald-700 flex items-center gap-1.5 transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingHistory ? 'animate-spin' : ''}`} />
              <span>Refresh Log</span>
            </button>
            <button
              onClick={handleClearHistory}
              className="p-2 rounded-xl bg-red-950/60 hover:bg-red-900/80 text-red-300 text-xs font-bold border border-red-800 flex items-center gap-1.5 transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          </div>
        </div>

        {/* EXACT TABLE AS REQUIRED IN REQUIREMENT 6 */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-emerald-800/80 text-[11px] text-emerald-300 font-bold uppercase tracking-wider bg-black/30">
                <th className="py-3 px-4">Owner</th>
                <th className="py-3 px-4">Detection</th>
                <th className="py-3 px-4">SMS Status</th>
                <th className="py-3 px-4">Siren Status</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Dispatched Message</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-900/50">
              {alertHistory.map((item) => (
                <tr key={item.id} className="hover:bg-emerald-900/30 transition">
                  {/* Owner */}
                  <td className="py-3 px-4 font-bold text-white whitespace-nowrap">
                    <div>{item.ownerName}</div>
                    <div className="text-[10px] text-cyan-300 font-mono">{item.mobileNumber}</div>
                  </td>

                  {/* Detection */}
                  <td className="py-3 px-4 font-bold text-yellow-300 whitespace-nowrap">
                    {item.detectedProblem}
                  </td>

                  {/* SMS Status */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold font-mono">
                      {item.smsStatus}
                    </span>
                  </td>

                  {/* Siren Status */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold font-mono ${
                      item.sirenStatus === '🔊 ON' 
                        ? 'bg-red-500/20 text-red-300 border border-red-500/50' 
                        : 'bg-slate-800 text-slate-300'
                    }`}>
                      {item.sirenStatus}
                    </span>
                  </td>

                  {/* Date & Time */}
                  <td className="py-3 px-4 text-emerald-200/90 font-mono text-[11px] whitespace-nowrap">
                    {item.date} {item.time}
                  </td>

                  {/* Dispatched Message */}
                  <td className="py-3 px-4 text-[11px] text-emerald-100 max-w-xs font-mono">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate">{item.messageText.slice(0, 75)}...</span>
                      <button
                        onClick={() => copyToClipboard(item.messageText, item.id)}
                        className="text-cyan-400 hover:underline flex-shrink-0 cursor-pointer"
                        title="Copy full SMS"
                      >
                        {copiedId === item.id ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {alertHistory.length === 0 && (
          <div className="p-8 text-center text-emerald-400/60 text-xs">
            No alerts recorded yet. Click any detection trigger above or perform a camera scan to generate alerts.
          </div>
        )}
      </div>

    </div>
  );
};
