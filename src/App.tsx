import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MainDashboard } from './components/MainDashboard';
import { CropCard } from './components/CropCard';
import { AddCropModal } from './components/AddCropModal';
import { DedicatedCropView } from './components/DedicatedCropView';
import { LiveDetectionView } from './components/LiveDetectionView';
import { PestDetectionView } from './components/PestDetectionView';
import { RagAssistantView } from './components/RagAssistantView';
import { AnimalProtectionCard } from './components/AnimalProtectionCard';
import { WeatherCard } from './components/WeatherCard';
import { SoilHealthCard } from './components/SoilHealthCard';
import { FarmLocationCard } from './components/FarmLocationCard';
import { AlertsView } from './components/AlertsView';
import { CropEncyclopediaView } from './components/CropEncyclopediaView';
import { CameraModal } from './components/CameraModal';
import { TemperatureDailyView } from './components/TemperatureDailyView';
import { SoilTestingView } from './components/SoilTestingView';
import { VideoSurveillanceView } from './components/VideoSurveillanceView';
import { FutureTemperatureCalendarModal } from './components/FutureTemperatureCalendarModal';
import { FutureTemperatureCalendarView } from './components/FutureTemperatureCalendarView';
import { CropProblemsRemediesView } from './components/CropProblemsRemediesView';
import { LiveCameraScanView } from './components/LiveCameraScanView';
import { OwnerMobileAlertsView } from './components/OwnerMobileAlertsView';
import { ActiveSirenEmergencyBar } from './components/ActiveSirenEmergencyBar';
import { MobileNotificationModal } from './components/MobileNotificationModal';

import { 
  CropItem, 
  LanguageCode, 
  WeatherData, 
  SoilHealthData, 
  AnimalDetectionResult, 
  AlertItem, 
  SupportedAnimal 
} from './types';
import { CROPS_DATABASE } from './data/cropsDatabase';
import { playAlertSound, speakVoiceAlert } from './services/audioAlertService';
import { APP_LANGUAGES } from './utils/translations';

export default function App() {
  // 1. Language state with persistent local storage
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem('agri_lang');
    return APP_LANGUAGES.some(language => language.code === saved)
      ? saved as LanguageCode
      : 'en';
  });

  useEffect(() => {
    document.documentElement.lang = currentLanguage;
    localStorage.setItem('agri_lang', currentLanguage);
  }, [currentLanguage]);

  const handleLanguageChange = (lang: LanguageCode) => {
    if (!APP_LANGUAGES.some(language => language.code === lang)) return;
    setCurrentLanguage(lang);
  };

  // 2. Navigation tab state
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // 3. Crops state (initialized with Tomato, Chilli, Rice, Maize)
  const [crops, setCrops] = useState<CropItem[]>(() => {
    const saved = localStorage.getItem('agri_crops');
    if (saved) {
      try {
        const parsed: CropItem[] = JSON.parse(saved);
        // Refresh images from CROPS_DATABASE to reflect latest high-def assets
        return parsed.map(c => {
          const match = CROPS_DATABASE.find(db => db.name.toLowerCase() === c.name.toLowerCase());
          return match ? { ...c, image: match.image } : c;
        });
      } catch (e) {
        // fallback
      }
    }

    const defaultCrops: CropItem[] = [
      {
        id: 'crop-tom-1',
        name: 'Tomato',
        teluguName: 'టమాటా',
        scientificName: 'Solanum lycopersicum',
        category: 'Vegetables',
        emoji: '🍅',
        image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80',
        fieldName: 'Field Sector A (Tomato Plot)',
        status: 'Healthy',
        lastDetection: 'No Recent Pest (Clean Scan)',
        temperature: 28,
        humidity: 72,
        soilMoisture: 68,
        soilPh: 6.5,
        soilCondition: 'Good',
        connectedSensors: 3,
        activeCamera: true,
        supportedPests: ['Tomato Fruit Borer', 'Whitefly', 'Aphids'],
        commonDiseases: ['Late Blight', 'Early Blight', 'Bacterial Spot'],
        addedAt: '2026-09-20',
      },
      {
        id: 'crop-chi-2',
        name: 'Chilli',
        teluguName: 'మిరప',
        scientificName: 'Capsicum annuum',
        category: 'Vegetables',
        emoji: '🌶️',
        image: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=800&q=80',
        fieldName: 'Field Sector B (Chilli Ridge)',
        status: 'Monitoring',
        lastDetection: 'Thrips Detected (Mild)',
        temperature: 29,
        humidity: 70,
        soilMoisture: 62,
        soilPh: 6.8,
        soilCondition: 'Good',
        connectedSensors: 3,
        activeCamera: true,
        supportedPests: ['Chilli Thrips', 'Yellow Mite', 'Aphids'],
        commonDiseases: ['Anthracnose', 'Powdery Mildew', 'Dieback'],
        addedAt: '2026-09-21',
      },
      {
        id: 'crop-rice-3',
        name: 'Rice',
        teluguName: 'వరి',
        scientificName: 'Oryza sativa',
        category: 'Cereals',
        emoji: '🌾',
        image: 'https://images.unsplash.com/photo-1536657464919-892534f60d6e?auto=format&fit=crop&w=800&q=80',
        fieldName: 'Paddy Basin North Block',
        status: 'Healthy',
        lastDetection: 'Stem Borer (Trap Monitored)',
        temperature: 28,
        humidity: 78,
        soilMoisture: 85,
        soilPh: 6.2,
        soilCondition: 'Good',
        connectedSensors: 4,
        activeCamera: true,
        supportedPests: ['Stem Borer', 'BPH', 'Leaf Folder'],
        commonDiseases: ['Rice Blast', 'Sheath Blight'],
        addedAt: '2026-09-22',
      },
      {
        id: 'crop-maize-4',
        name: 'Maize',
        teluguName: 'మొక్కజొన్న',
        scientificName: 'Zea mays',
        category: 'Cereals',
        emoji: '🌽',
        image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=800&q=80',
        fieldName: 'Maize Field East 3',
        status: 'Needs Attention',
        lastDetection: 'Fall Armyworm (Active Whorl)',
        temperature: 29,
        humidity: 71,
        soilMoisture: 58,
        soilPh: 6.6,
        soilCondition: 'Moderate',
        connectedSensors: 2,
        activeCamera: true,
        supportedPests: ['Fall Armyworm', 'Stem Borer', 'Shoot Fly'],
        commonDiseases: ['Turcicum Leaf Blight'],
        addedAt: '2026-09-25',
      },
      {
        id: 'crop-pom-5',
        name: 'Pomegranate',
        teluguName: 'దానిమ్మ',
        scientificName: 'Punica granatum',
        category: 'Fruits',
        emoji: '🍎',
        image: 'https://images.unsplash.com/photo-1541344999736-83eca272f6fc?auto=format&fit=crop&w=800&q=80',
        fieldName: 'Orchard Block 2 (Pomegranate)',
        status: 'Healthy',
        lastDetection: 'No Recent Pest (Clean Fruit Flush)',
        temperature: 28,
        humidity: 65,
        soilMoisture: 60,
        soilPh: 6.8,
        soilCondition: 'Good',
        connectedSensors: 3,
        activeCamera: true,
        supportedPests: ['Fruit Borer (Virachola)', 'Thrips', 'Stem Borer'],
        commonDiseases: ['Bacterial Blight / Telya', 'Fruit Spot'],
        addedAt: '2026-09-28',
      },
    ];

    return defaultCrops;
  });

  useEffect(() => {
    localStorage.setItem('agri_crops', JSON.stringify(crops));
  }, [crops]);

  // 4. Modal and Dedicated View state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [selectedCropForDetail, setSelectedCropForDetail] = useState<CropItem | null>(null);

  // 5. Environmental & Weather Data
  const [weather, setWeather] = useState<WeatherData>({
    temperature: 28,
    humidity: 72,
    rainStatus: 'No Rain',
    rainProbability: 25,
    windSpeed: 11,
    cloudCondition: 'Partly Cloudy',
    isDemo: false,
    forecast: [
      { day: 'Today', maxTemp: 30, minTemp: 22, rainProb: 25 },
      { day: 'Tomorrow', maxTemp: 29, minTemp: 21, rainProb: 40 },
      { day: 'Wed', maxTemp: 28, minTemp: 20, rainProb: 65 },
      { day: 'Thu', maxTemp: 29, minTemp: 21, rainProb: 30 },
      { day: 'Fri', maxTemp: 31, minTemp: 22, rainProb: 15 },
    ],
  });

  const fetchLiveWeather = async (lat?: number, lon?: number) => {
    try {
      const q = lat && lon ? `?lat=${lat}&lon=${lon}` : '';
      const res = await fetch(`/api/weather${q}`);
      if (res.ok) {
        const data = await res.json();
        setWeather({
          temperature: data.current.temperature,
          humidity: data.current.humidity,
          rainStatus: data.current.rainStatus,
          rainProbability: data.current.rainProbability,
          windSpeed: data.current.windSpeed,
          cloudCondition: data.current.cloudCondition,
          isDemo: data.isDemo || false,
          forecast: data.forecast || weather.forecast,
        });
      }
    } catch (e) {
      console.warn('Weather fetch fallback');
    }
  };

  useEffect(() => {
    fetchLiveWeather();
  }, []);

  // 6. Soil Health Data
  const [soil, setSoil] = useState<SoilHealthData>({
    soilMoisture: 68,
    soilPh: 6.5,
    nitrogen: 220,
    phosphorus: 24,
    potassium: 280,
    temperature: 24,
    soilCondition: 'Good',
    cropSuitability: 'Suitable',
    explanation: 'Well-balanced N-P-K nutrient status with neutral pH 6.5. Good organic matter retention.',
    isImageAnalysisIndication: false,
  });

  // 7. Location & GPS: Defaulted to Kakinada, Andhra Pradesh
  const [isGpsLive, setIsGpsLive] = useState(true);
  const [latitude, setLatitude] = useState<number | null>(16.9891);
  const [longitude, setLongitude] = useState<number | null>(82.2475);
  const [accuracy, setAccuracy] = useState<number | null>(12);
  const [locationName, setLocationName] = useState('Kakinada, Andhra Pradesh');
  const [isMobileAlertModalOpen, setIsMobileAlertModalOpen] = useState(false);

  const handleRequestGps = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setLatitude(lat);
        setLongitude(lon);
        setAccuracy(pos.coords.accuracy);
        setIsGpsLive(true);

        let resolvedName = `GPS Location (${lat.toFixed(3)}°N, ${lon.toFixed(3)}°E)`;
        try {
          const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
          if (geoRes.ok) {
            const geoData = await geoRes.json();
            const place = geoData.locality || geoData.city || geoData.principalSubdivision;
            if (place) {
              resolvedName = `${place}, ${geoData.principalSubdivision || geoData.countryName}`;
            }
          }
        } catch (e) {
          console.warn('Reverse geocode lookup error:', e);
        }

        setLocationName(resolvedName);
        fetchLiveWeather(lat, lon);
      },
      (err) => {
        console.warn('GPS denied or unavailable:', err);
        setIsGpsLive(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // 8. Animal Intrusion surveillance state
  const [animalDetection, setAnimalDetection] = useState<AnimalDetectionResult | null>(null);

  const handleSimulateAnimalIntrusion = (animal: SupportedAnimal) => {
    const isMonkey = animal === 'Monkey';
    const detection: AnimalDetectionResult = {
      id: `anim-${Date.now()}`,
      animal,
      confidence: 89,
      location: 'Field Sector A - Perimeter Fence',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      riskLevel: isMonkey ? 'High' : 'Medium',
      status: 'Animal Detected',
      evidenceImage: isMonkey 
        ? 'https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?auto=format&fit=crop&w=800&q=80'
        : 'https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?auto=format&fit=crop&w=800&q=80',
      cameraName: 'PTZ-CAM-03',
      alertTriggered: true,
    };

    setAnimalDetection(detection);
    playAlertSound('HIGH');

    const voiceText = currentLanguage === 'te' 
      ? `హెచ్చరిక! పొలంలో ${animal} గుర్తించబడింది.` 
      : `Alert! A ${animal} has been detected in the farm perimeter.`;
    speakVoiceAlert(voiceText, currentLanguage);

    handleAddAlert({
      id: `alert-anim-${Date.now()}`,
      type: 'animal',
      title: `⚠️ ${animal} Detected`,
      message: `${animal} entered Field Sector A with 89% confidence. Sonic siren triggered.`,
      teluguVoiceText: `హెచ్చరిక! పొలంలో ${animal} గుర్తించబడింది.`,
      englishVoiceText: `Alert! A ${animal} has been detected in the farm.`,
      timestamp: detection.timestamp,
      location: detection.location,
      severity: 'HIGH',
      read: false,
    });
  };

  const handleClearAnimalIntrusion = () => {
    setAnimalDetection(null);
  };

  // 9. Alerts Stream state
  const [alerts, setAlerts] = useState<AlertItem[]>([
    {
      id: 'al-1',
      type: 'pest',
      title: 'Tomato Fruit Borer Detected',
      message: 'Tomato Fruit Borer (Helicoverpa armigera) detected in Field Sector A with 92% confidence.',
      teluguVoiceText: 'హెచ్చరిక! టమాటా పొలంలో పురుగు గుర్తించబడింది.',
      englishVoiceText: 'Alert! A pest has been detected in the tomato field.',
      timestamp: '10:42 AM',
      location: 'Field Sector A',
      severity: 'HIGH',
      read: false,
    },
    {
      id: 'al-2',
      type: 'animal',
      title: 'Monkey Movement on Boundary',
      message: 'Monkey troop detected along the northern orchard fence. Bio-acoustic deterrent activated.',
      teluguVoiceText: 'హెచ్చరిక! పొలంలో కోతి గుర్తించబడింది.',
      englishVoiceText: 'Alert! A monkey has been detected in the farm.',
      timestamp: '09:15 AM',
      location: 'North Fence',
      severity: 'HIGH',
      read: false,
    },
    {
      id: 'al-3',
      type: 'soil',
      title: 'Soil Moisture Low in Maize Block',
      message: 'Soil moisture dropped below 60% in Maize Field East 3. Drip irrigation recommended.',
      teluguVoiceText: 'హెచ్చరిక! నేలలో తేమ తక్కువగా ఉంది.',
      englishVoiceText: 'Warning! Soil moisture is low.',
      timestamp: '08:30 AM',
      location: 'Maize Field East 3',
      severity: 'WARNING',
      read: false,
    },
    {
      id: 'al-4',
      type: 'weather',
      title: 'Heavy Rain Warning Evening',
      message: 'Convective rain shower forecasted for evening hours. Delay foliar chemical spraying.',
      teluguVoiceText: 'హెచ్చరిక! సాయంత్రం భారీ వర్షం పడే అవకాశం ఉంది.',
      englishVoiceText: 'Warning! Heavy rain expected in the evening.',
      timestamp: '07:00 AM',
      location: 'Farm Regional Forecast',
      severity: 'INFO',
      read: true,
    }
  ]);

  const handleAddAlert = (alert: AlertItem) => {
    setAlerts(prev => [alert, ...prev]);
  };

  const handleClearAllAlerts = () => {
    setAlerts([]);
  };

  // 10. RAG contextual opener
  const [ragContext, setRagContext] = useState<{ crop: string; disease: string; imageBase64?: string }>({
    crop: 'Tomato',
    disease: 'Late Blight',
  });

  const handleOpenRagWithContext = (cropName: string, diseaseOrPest?: string, imageBase64?: string) => {
    setRagContext({ crop: cropName, disease: diseaseOrPest || 'General Management', imageBase64 });
    setSelectedCropForDetail(null);
    setCurrentTab('rag-advisory');
  };

  // 11. Add new crop handler
  const handleAddNewCrop = (newCrop: CropItem) => {
    setCrops(prev => [newCrop, ...prev]);
    handleAddAlert({
      id: `al-crop-${Date.now()}`,
      type: 'sensor',
      title: `🌱 New Crop Activated: ${newCrop.name}`,
      message: `${newCrop.name} added to ${newCrop.fieldName}. Connected to 3 IoT sensors and PTZ camera.`,
      teluguVoiceText: `కొత్త పంట ${newCrop.name} విజయవంతంగా చేర్చబడింది.`,
      englishVoiceText: `New crop ${newCrop.name} added successfully.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      location: newCrop.fieldName,
      severity: 'INFO',
      read: false,
    });
  };

  // 12. Remove crop handler
  const handleRemoveCrop = (cropId: string) => {
    setCrops(prev => prev.filter(c => c.id !== cropId));
  };

  // 13. Open crop detail view
  const handleOpenCropDetail = (crop: CropItem) => {
    setSelectedCropForDetail(crop);
  };

  return (
    <div className="min-h-screen bg-[#071a12] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-emerald-950">
      
      {/* Background Farm Texture Graphic */}
      <div className="fixed inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] z-0"></div>

      {/* TOP HEADER */}
      <Header
        currentLanguage={currentLanguage}
        onLanguageChange={handleLanguageChange}
        locationName={locationName}
        isGpsLive={isGpsLive}
        onToggleGps={handleRequestGps}
        temperature={weather.temperature}
        humidity={weather.humidity}
        rainStatus={weather.rainStatus}
        alerts={alerts}
        onNavigate={(tab) => {
          setSelectedCropForDetail(null);
          setCurrentTab(tab);
        }}
        onOpenCamera={() => {
          setSelectedCropForDetail(null);
          setCurrentTab('live-camera');
        }}
        onOpenMobileNotifications={() => {
          setSelectedCropForDetail(null);
          setCurrentTab('mobile-sms');
        }}
      />

      {/* BODY WITH SIDEBAR AND MAIN CONTENT */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        
        {/* Responsive Sidebar */}
        <Sidebar
          currentTab={selectedCropForDetail ? '' : currentTab}
          onSelectTab={(tab) => {
            setSelectedCropForDetail(null);
            setCurrentTab(tab);
          }}
          currentLanguage={currentLanguage}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          cropCount={crops.length}
          alertCount={alerts.filter(a => a.severity === 'HIGH').length}
        />

        {/* Main View Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          
          {/* If a dedicated crop is selected, render Dedicated Crop Page */}
          {selectedCropForDetail ? (
            <DedicatedCropView
              crop={selectedCropForDetail}
              onBack={() => setSelectedCropForDetail(null)}
              weather={weather}
              soil={soil}
              currentLanguage={currentLanguage}
              onOpenRagAdvisoryWithContext={handleOpenRagWithContext}
              onTriggerAlert={handleAddAlert}
            />
          ) : (
            <>
              {currentTab === 'dashboard' && (
                <MainDashboard
                  crops={crops}
                  onOpenCrop={handleOpenCropDetail}
                  onRemoveCrop={handleRemoveCrop}
                  onOpenAddModal={() => setIsAddModalOpen(true)}
                  onOpenCamera={() => setIsCameraModalOpen(true)}
                  weather={weather}
                  onRefreshWeather={() => fetchLiveWeather(latitude || undefined, longitude || undefined)}
                  soil={soil}
                  onUpdateSoil={setSoil}
                  isGpsLive={isGpsLive}
                  latitude={latitude}
                  longitude={longitude}
                  accuracy={accuracy}
                  locationName={locationName}
                  onRequestGps={handleRequestGps}
                  alerts={alerts}
                  onViewAllAlerts={() => setCurrentTab('alerts')}
                  onNavigateToTab={(tab) => setCurrentTab(tab)}
                  currentLanguage={currentLanguage}
                />
              )}

              {currentTab === 'live-camera' && (
                <LiveCameraScanView
                  currentLanguage={currentLanguage}
                  onAddAlert={handleAddAlert}
                  locationName={locationName}
                />
              )}

              {currentTab === 'mobile-sms' && (
                <OwnerMobileAlertsView
                  currentLanguage={currentLanguage}
                  locationName={locationName}
                  defaultCrop={crops[0]?.name || 'Tomato'}
                />
              )}

              {currentTab === 'my-crops' && (
                <div className="space-y-6 max-w-6xl mx-auto">
                  <div className="flex items-center justify-between pb-4 border-b border-emerald-800">
                    <h2 className="text-2xl font-black text-white">🌱 All Planted Crops</h2>
                    <button
                      onClick={() => setIsAddModalOpen(true)}
                      className="px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-xs shadow"
                    >
                      + ADD NEW CROP
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {crops.map(crop => (
                      <div key={crop.id}>
                        <CropCard
                          crop={crop}
                          onOpenCrop={handleOpenCropDetail}
                          onRemoveCrop={handleRemoveCrop}
                          currentLanguage={currentLanguage}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(currentTab === 'live-detection' || currentTab === 'video-surveillance') && (
                <VideoSurveillanceView
                  currentLanguage={currentLanguage}
                  onAddAlert={handleAddAlert}
                />
              )}

              {currentTab === 'pest-detection' && (
                <PestDetectionView
                  currentLanguage={currentLanguage}
                  onOpenRagAdvisory={handleOpenRagWithContext}
                  onAddAlert={handleAddAlert}
                />
              )}

              {currentTab === 'rag-advisory' && (
                <RagAssistantView
                  initialCropContext={ragContext.crop}
                  initialDiseaseContext={ragContext.disease}
                  initialImageBase64={ragContext.imageBase64}
                  currentLanguage={currentLanguage}
                />
              )}

              {currentTab === 'future-calendar' && (
                <FutureTemperatureCalendarView
                  weather={weather}
                  locationName={locationName}
                  currentLanguage={currentLanguage}
                />
              )}

              {currentTab === 'crop-problems' && (
                <CropProblemsRemediesView
                  currentLanguage={currentLanguage}
                  onAddAlert={handleAddAlert}
                  locationName={locationName}
                />
              )}

              {(currentTab === 'soil-analysis' || currentTab === 'soil-testing') && (
                <SoilTestingView
                  soilData={soil}
                  onUpdateSoilData={setSoil}
                  currentLanguage={currentLanguage}
                />
              )}

              {(currentTab === 'weather' || currentTab === 'temperature') && (
                <TemperatureDailyView
                  weather={weather}
                  locationName={locationName}
                  isGpsLive={isGpsLive}
                  latitude={latitude}
                  longitude={longitude}
                  onRequestGps={handleRequestGps}
                  onRefreshWeather={() => fetchLiveWeather(latitude || undefined, longitude || undefined)}
                  currentLanguage={currentLanguage}
                />
              )}

              {currentTab === 'farm-location' && (
                <div className="max-w-4xl mx-auto space-y-6">
                  <h2 className="text-2xl font-black text-white">📍 Farm GPS & Boundaries</h2>
                  <FarmLocationCard
                    isGpsLive={isGpsLive}
                    latitude={latitude}
                    longitude={longitude}
                    accuracy={accuracy}
                    locationName={locationName}
                    onRequestGps={handleRequestGps}
                    currentLanguage={currentLanguage}
                  />
                </div>
              )}

              {currentTab === 'alerts' && (
                <AlertsView
                  alerts={alerts}
                  onClearAlerts={handleClearAllAlerts}
                  currentLanguage={currentLanguage}
                />
              )}

              {(currentTab === 'knowledge' || currentTab === 'reports') && (
                <CropEncyclopediaView
                  currentLanguage={currentLanguage}
                  onAddCrop={handleAddNewCrop}
                  myCropNames={crops.map(c => c.name)}
                />
              )}

              {currentTab === 'settings' && (
                <div className="max-w-3xl mx-auto p-6 rounded-3xl bg-emerald-950/80 border border-emerald-800 text-white space-y-4">
                  <h2 className="text-xl font-bold">⚙️ AgriGuard AI Settings</h2>
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="text-emerald-300 font-bold block mb-1">Language</label>
                      <select
                        value={currentLanguage}
                        onChange={(e) => handleLanguageChange(e.target.value as LanguageCode)}
                        className="px-3 py-2 rounded-xl bg-emerald-900 border border-emerald-700 text-white"
                      >
                        {APP_LANGUAGES.map(language => (
                          <option key={language.code} value={language.code}>{language.native}</option>
                        ))}
                      </select>
                    </div>

                    <div className="pt-3 border-t border-emerald-800">
                      <button
                        onClick={() => {
                          playAlertSound('HIGH');
                          speakVoiceAlert(
                            currentLanguage === 'te' 
                              ? 'హెచ్చరిక! అత్యవసర అలారం పరీక్షించబడింది.' 
                              : 'Alert! Emergency alarm system tested successfully.', 
                            currentLanguage
                          );
                        }}
                        className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 font-bold text-white shadow"
                      >
                        Test Loud Siren & Voice Broadcast
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

        </main>
      </div>

      {/* Universal Searchable Add New Crop Modal */}
      <AddCropModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddCrop={handleAddNewCrop}
        currentLanguage={currentLanguage}
      />

      {/* Instant Access Live Camera Modal */}
      <CameraModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        currentLanguage={currentLanguage}
        onAddAlert={handleAddAlert}
      />

      {/* Global Continuous Siren Emergency Bar (With STOP SIREN button) */}
      <ActiveSirenEmergencyBar
        currentLanguage={currentLanguage}
        onOpenMobileNotificationsModal={() => setIsMobileAlertModalOpen(true)}
      />

      {/* Farmer Mobile Alert System Modal (SMS & Push Notifications) */}
      <MobileNotificationModal
        isOpen={isMobileAlertModalOpen}
        onClose={() => setIsMobileAlertModalOpen(false)}
        currentLanguage={currentLanguage}
        activeCropName={crops[0]?.name || 'Tomato'}
        locationName={locationName}
      />

    </div>
  );
}
