import { LanguageCode } from '../types';

export interface Translations {
  appTitle: string;
  appSubtitle: string;
  location: string;
  temp: string;
  humidity: string;
  rain: string;
  gpsStatus: string;
  connected: string;
  demoData: string;
  notConnected: string;
  noRain: string;
  notifications: string;
  language: string;

  // Nav
  navHome: string;
  navLiveCameraScan: string;
  navMobileAlerts: string;
  navMyCrops: string;
  navFutureCalendar: string;
  navCropProblems: string;
  navTemperatureWeather: string;
  navSoilTesting: string;
  navVideoAnimals: string;
  navLiveDetection: string;
  navPestDetection: string;
  navRagAdvisory: string;
  navAnimalProtection: string;
  navSoilAnalysis: string;
  navWeather: string;
  navFarmLocation: string;
  navAlerts: string;
  navReports: string;
  navKnowledge: string;
  navSettings: string;

  // Sections
  myCrops: string;
  addNewCrop: string;
  openCrop: string;
  remove: string;
  status: string;
  healthy: string;
  monitoring: string;
  needsAttention: string;
  highRisk: string;
  lastDetection: string;
  noRecentPest: string;
  soil: string;

  // Add modal
  searchPlaceholder: string;
  selectCategory: string;
  all: string;
  cereals: string;
  vegetables: string;
  commercialCrops: string;
  fruits: string;
  pulses: string;
  fieldName: string;
  optionalLocation: string;
  optionalCamera: string;
  optionalSensors: string;
  addCropButton: string;
  addToMyCrops: string;
  preview: string;
  cropName: string;
  category: string;

  // Monitoring
  cropMonitoring: string;
  liveDetection: string;
  soilHealth: string;
  weather: string;
  cropHealth: string;
  pestStatus: string;
  animalProtection: string;
  openWebcam: string;
  uploadMedia: string;
  stopCamera: string;
  snapshotDetect: string;

  // Disease Detection
  aiDiseaseDetection: string;
  uploadLeafPrompt: string;
  analyzeLeaf: string;
  prediction: string;
  confidence: string;
  severity: string;
  riskLevel: string;
  symptoms: string;
  causes: string;
  immediateAction: string;
  treatmentRecommendation: string;
  preventionMeasures: string;
  disclaimerText: string;

  // Animal
  animalStatus: string;
  animalSafe: string;
  animalIntrusion: string;
  triggerAlarmSound: string;
  testAlarm: string;

  // RAG Chat
  ragTitle: string;
  ragSubtitle: string;
  askPlaceholder: string;
  send: string;
  sourcesUsed: string;
  relevance: string;
  vivaExplainer: string;

  // Weather & Soil
  rainProb: string;
  windSpeed: string;
  cloudCondition: string;
  soilMoisture: string;
  soilPh: string;
  npkRatio: string;
  uploadSoilImage: string;
  soilDisclaimer: string;

  // Alerts
  recentAlerts: string;
  viewAllAlerts: string;
  highPriority: string;
  warningPriority: string;
  infoPriority: string;
  farmOverview: string;
}

export const APP_LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
] as const;

export const TRANSLATIONS: Record<LanguageCode, Translations> = {
  en: {
    appTitle: 'AgriGuard AI',
    appSubtitle: 'Smart Farm Monitoring & Protection',
    location: 'Farm Location',
    temp: 'Temperature',
    humidity: 'Humidity',
    rain: 'Rain Status',
    gpsStatus: 'GPS Status',
    connected: 'Connected',
    demoData: 'Demo Data',
    notConnected: 'Not Connected',
    noRain: 'No Rain',
    notifications: 'Notifications',
    language: 'Language',

    navHome: 'Dashboard',
    navLiveCameraScan: 'Live Camera Scan',
    navMobileAlerts: 'Owner Mobile SMS Alerts',
    navMyCrops: 'My Crops',
    navFutureCalendar: 'Future Temp Calendar',
    navCropProblems: 'Crop Problems & Remedies',
    navTemperatureWeather: 'Temperature & GPS Weather',
    navSoilTesting: 'Soil Testing & Health',
    navVideoAnimals: 'Upload Video & Animals',
    navLiveDetection: 'Live Detection',
    navPestDetection: 'Pest & Disease Scan',
    navRagAdvisory: 'RAG Advisory AI',
    navAnimalProtection: 'Animal Protection',
    navSoilAnalysis: 'Soil Health',
    navWeather: 'Weather',
    navFarmLocation: 'Farm Location',
    navAlerts: 'Alerts',
    navReports: 'Scan Reports',
    navKnowledge: 'Crop Encyclopedia',
    navSettings: 'Settings',

    myCrops: 'MY CROPS',
    addNewCrop: '+ ADD NEW',
    openCrop: 'OPEN CROP',
    remove: 'REMOVE',
    status: 'Status',
    healthy: 'Healthy',
    monitoring: 'Monitoring',
    needsAttention: 'Needs Attention',
    highRisk: 'High Risk',
    lastDetection: 'Last Detection',
    noRecentPest: 'No Recent Pest',
    soil: 'Soil',

    searchPlaceholder: 'Search any crop, vegetable, or fruit (e.g., Tomato, Grape, Chilli, Rice)...',
    selectCategory: 'Category',
    all: 'All',
    cereals: 'Cereals',
    vegetables: 'Vegetables',
    commercialCrops: 'Commercial Crops',
    fruits: 'Fruits',
    pulses: 'Pulses & Oilseeds',
    fieldName: 'Field Name (e.g., North Block A)',
    optionalLocation: 'Optional GPS Coordinates',
    optionalCamera: 'Connected Camera ID (Optional)',
    optionalSensors: 'Active Soil/Microclimate Sensors',
    addCropButton: 'ADD CROP',
    addToMyCrops: 'ADD TO MY CROPS',
    preview: 'Crop Preview',
    cropName: 'Crop / Product Name',
    category: 'Category',

    cropMonitoring: 'CROP MONITORING',
    liveDetection: 'LIVE DETECTION',
    soilHealth: 'SOIL HEALTH',
    weather: 'WEATHER',
    cropHealth: 'CROP HEALTH',
    pestStatus: 'PEST STATUS',
    animalProtection: 'ANIMAL PROTECTION',
    openWebcam: '📷 OPEN WEBCAM',
    uploadMedia: '📁 UPLOAD IMAGE / VIDEO',
    stopCamera: 'STOP CAMERA',
    snapshotDetect: 'SCAN FOR PESTS',

    aiDiseaseDetection: 'AI Disease & Pest Detection',
    uploadLeafPrompt: 'Drop leaf image or take photo with camera',
    analyzeLeaf: 'Analyze Leaf with Deep Learning',
    prediction: 'AI Prediction',
    confidence: 'Confidence',
    severity: 'Severity',
    riskLevel: 'Risk Level',
    symptoms: 'Symptoms',
    causes: 'Cause',
    immediateAction: 'Immediate Action (24h)',
    treatmentRecommendation: 'Treatment Recommendation',
    preventionMeasures: 'Prevention Measures',
    disclaimerText: 'Informational decision-support tool. Always consult a qualified agricultural extension officer before chemical spray.',

    animalStatus: 'Animal Surveillance Status',
    animalSafe: 'Field Perimeter Safe',
    animalIntrusion: 'ANIMAL INTRUSION DETECTED',
    triggerAlarmSound: 'TEST ALARM SOUND',
    testAlarm: 'Loud Alarm Sirens',

    ragTitle: 'RAG-Powered Agricultural Advisory',
    ragSubtitle: 'Context-grounded advice with verified agricultural literature references',
    askPlaceholder: 'Ask any crop protection, symptom, or treatment question...',
    send: 'Ask Advisory AI',
    sourcesUsed: 'Sources / Knowledge Used',
    relevance: 'Relevance',
    vivaExplainer: 'Explainability & Grounding',

    rainProb: 'Rain Probability',
    windSpeed: 'Wind Speed',
    cloudCondition: 'Cloud Condition',
    soilMoisture: 'Soil Moisture',
    soilPh: 'Soil pH',
    npkRatio: 'NPK Nutrient Ratio',
    uploadSoilImage: '📷 Upload Soil Image',
    soilDisclaimer: 'Image analysis is an indication only, not a laboratory soil test.',

    recentAlerts: 'RECENT ALERTS',
    viewAllAlerts: 'VIEW ALL ALERTS',
    highPriority: 'HIGH',
    warningPriority: 'WARNING',
    infoPriority: 'INFO',
    farmOverview: 'FARM OVERVIEW',
  },

  te: {
    appTitle: 'అగ్రిగార్డ్ AI (AgriGuard AI)',
    appSubtitle: 'స్మార్ట్ వ్యవసాయ పర్యవేక్షణ & రక్షణ',
    location: 'పొలం లొకేషన్',
    temp: 'ఉష్ణోగ్రత',
    humidity: 'తేమ శాతం',
    rain: 'వర్షం స్థితి',
    gpsStatus: 'GPS స్థితి',
    connected: 'కనెక్ట్ అయింది',
    demoData: 'డెమో డేటా',
    notConnected: 'కనెక్ట్ కాలేదు',
    noRain: 'వర్షం లేదు',
    notifications: 'నోటిఫికేషన్లు',
    language: 'భాష',

    navHome: 'ప్రధాన డ్యాష్‌బోర్డ్',
    navLiveCameraScan: 'లైవ్ కెమెరా స్కాన్',
    navMobileAlerts: 'యజమాని మొబైల్ SMS హెచ్చరికలు',
    navFutureCalendar: 'భవిష్యత్తు ఉష్ణోగ్రత క్యాలెండర్',
    navCropProblems: 'పంట సమస్యలు & పరిష్కారాలు',
    navTemperatureWeather: 'ఉష్ణోగ్రత & GPS వాతావరణం',
    navSoilTesting: 'నేల పరీక్ష & ఆరోగ్యం',
    navVideoAnimals: 'వీడియో అప్‌లోడ్ & జంతువులు',
    navMyCrops: 'నా పంటలు',
    navLiveDetection: 'లైవ్ డిటెక్షన్',
    navPestDetection: 'తెగులు & పురుగు గుర్తింపు',
    navRagAdvisory: 'RAG వ్యవసాయ సలహా AI',
    navAnimalProtection: 'జంతువుల రక్షణ',
    navSoilAnalysis: 'నేల ఆరోగ్యం',
    navWeather: 'వాతావరణం',
    navFarmLocation: 'పొలం లొకేషన్',
    navAlerts: 'హెచ్చరికలు',
    navReports: 'స్కాన్ నివేదికలు',
    navKnowledge: 'పంటల విజ్ఞాన సర్వస్వం',
    navSettings: 'సెట్టింగ్‌లు',

    myCrops: 'నా పంటలు (MY CROPS)',
    addNewCrop: '+ కొత్త పంట చేర్చు',
    openCrop: 'పంట వివరాలు',
    remove: 'తొలగించు',
    status: 'స్థితి',
    healthy: 'ఆరోగ్యంగా ఉంది',
    monitoring: 'పర్యవేక్షణలో ఉంది',
    needsAttention: 'శ్రద్ధ అవసరం',
    highRisk: 'అధిక ప్రమాదం',
    lastDetection: 'చివరిగా గుర్తించినది',
    noRecentPest: 'ఇటీవల పురుగులు లేవు',
    soil: 'నేల',

    searchPlaceholder: 'ఏదైనా పంట, కూరగాయ లేదా పండ్ల పేరు వెతకండి (ఉదా: టమాటా, మిరప, వరి, ద్రాక్ష)...',
    selectCategory: 'వర్గం',
    all: 'అన్నీ',
    cereals: 'ధాన్యాలు',
    vegetables: 'కూరగాయలు',
    commercialCrops: 'వాణిజ్య పంటలు',
    fruits: 'పండ్లు',
    pulses: 'పప్పుధాన్యాలు',
    fieldName: 'పొలం పేరు (ఉదా: పొలం బ్లాక్ A)',
    optionalLocation: 'GPS వివరాలు (ఐచ్ఛికం)',
    optionalCamera: 'కెమెరా ID (ఐచ్ఛికం)',
    optionalSensors: 'యాక్టివ్ సెన్సార్లు',
    addCropButton: 'పంటను చేర్చు',
    addToMyCrops: 'నా పంటలలో చేర్చు',
    preview: 'పంట వివరాల ప్రివ్యూ',
    cropName: 'పంట / ఉత్పత్తుల పేరు',
    category: 'వర్గం',

    cropMonitoring: 'పంట పర్యవేక్షణ',
    liveDetection: 'లైవ్ కెమెరా డిటెక్షన్',
    soilHealth: 'నేల ఆరోగ్యం',
    weather: 'వాతావరణం',
    cropHealth: 'పంట ఆరోగ్యం',
    pestStatus: 'పురుగుల స్థితి',
    animalProtection: 'జంతువుల నుండి రక్షణ',
    openWebcam: '📷 వెబ్‌క్యామ్ ప్రారంభించు',
    uploadMedia: '📁 ఫోటో / వీడియో అప్‌లోడ్ చేయండి',
    stopCamera: 'కెమెరా ఆపు',
    snapshotDetect: 'పురుగులను గుర్తించండి',

    aiDiseaseDetection: 'AI పంట తెగులు & పురుగు గుర్తింపు',
    uploadLeafPrompt: 'ఆకు ఫోటోను అప్‌లోడ్ చేయండి లేదా తీయండి',
    analyzeLeaf: 'డీప్ లెర్నింగ్ ద్వారా పరిశీలించండి',
    prediction: 'AI ఫలితం',
    confidence: 'ఖచ్చితత్వం (Confidence)',
    severity: 'తీవ్రత',
    riskLevel: 'రిస్క్ స్థాయి',
    symptoms: 'లక్షణాలు',
    causes: 'కారణం',
    immediateAction: 'తక్షణ చర్యలు (24 గంటలు)',
    treatmentRecommendation: 'చికిత్స & మందుల వివరాలు',
    preventionMeasures: 'నివారణ పద్ధతులు',
    disclaimerText: 'గమనిక: ఇది సమాచార సూచన మాత్రమే. పురుగుమందులు వాడే ముందు వ్యవసాయ అధికారిని సంప్రదించండి.',

    animalStatus: 'జంతువుల పర్యవేక్షణ స్థితి',
    animalSafe: 'పొలంలో జంతువులు లేవు (సురక్షితం)',
    animalIntrusion: 'హెచ్చరిక! పొలంలోకి జంతువులు వచ్చాయి',
    triggerAlarmSound: 'సైరన్ మోగించండి',
    testAlarm: 'అలారం సౌండ్ టెస్ట్',

    ragTitle: 'RAG వ్యవసాయ సలహాదారు',
    ragSubtitle: 'అధికారిక వ్యవసాయ శాస్త్ర గ్రంథాల ఆధారిత మార్గదర్శకత్వం',
    askPlaceholder: 'పంట సమస్యలు లేదా నివారణ గురించి అడగండి...',
    send: 'ప్రశ్నించండి',
    sourcesUsed: 'ఉపయోగించిన ఆధార గ్రంథాలు (Sources)',
    relevance: 'సరిపోలే శాతం',
    vivaExplainer: 'AI వివరణ ప్యానెల్',

    rainProb: 'వర్షం సంభావ్యత',
    windSpeed: 'గాలి వేగం',
    cloudCondition: 'మేఘావృతం',
    soilMoisture: 'నేలలో తేమ',
    soilPh: 'నేల pH విలువ',
    npkRatio: 'NPK పోషకాల నిష్పత్తి',
    uploadSoilImage: '📷 మట్టి ఫోటో అప్‌లోడ్ చేయండి',
    soilDisclaimer: 'మట్టి ఫోటో కేవలం ప్రాథమిక అంచనా మాత్రమే, ఇది ల్యాబ్ పరీక్ష కాదు.',

    recentAlerts: 'ఇటీవలి హెచ్చరికలు',
    viewAllAlerts: 'అన్ని హెచ్చరికలు చూడండి',
    highPriority: 'అత్యవసరం (HIGH)',
    warningPriority: 'హెచ్చరిక (WARNING)',
    infoPriority: 'సమాచారం (INFO)',
    farmOverview: 'పొలం అవలోకనం',
  },

  hi: {
    appTitle: 'एग्रीगार्ड AI (AgriGuard AI)',
    appSubtitle: 'स्मार्ट फार्म मॉनिटरिंग और सुरक्षा',
    location: 'खेत का स्थान',
    temp: 'तापमान',
    humidity: 'आर्द्रता',
    rain: 'वर्षा स्थिति',
    gpsStatus: 'GPS स्थिति',
    connected: 'कनेक्टेड',
    demoData: 'डेमो डेटा',
    notConnected: 'कनेक्ट नहीं है',
    noRain: 'बारिश नहीं',
    notifications: 'सूचनाएं',
    language: 'भाषा',
    navHome: 'डैशबोर्ड',
    navLiveCameraScan: 'लाइव कैमरा स्कैन',
    navMobileAlerts: 'मालिक के मोबाइल SMS अलर्ट',
    navFutureCalendar: 'भविष्य तापमान कैलेंडर',
    navCropProblems: 'फसल समस्याएँ और उपाय',
    navTemperatureWeather: 'तापमान और GPS मौसम',
    navSoilTesting: 'मिट्टी परीक्षण और स्वास्थ्य',
    navVideoAnimals: 'वीडियो अपलोड और पशु',
    navMyCrops: 'मेरी फसलें',
    navLiveDetection: 'लाइव डिटेक्शन',
    navPestDetection: 'कीट एवं रोग पहचान',
    navRagAdvisory: 'RAG कृषि सलाहकार',
    navAnimalProtection: 'पशु सुरक्षा',
    navSoilAnalysis: 'मृदा स्वास्थ्य',
    navWeather: 'मौसम',
    navFarmLocation: 'खेत का स्थान',
    navAlerts: 'अलर्ट',
    navReports: 'स्कैन रिपोर्ट',
    navKnowledge: 'फसल विश्वकोश',
    navSettings: 'सेटिंग्स',
    myCrops: 'मेरी फसलें (MY CROPS)',
    addNewCrop: '+ नई फसल जोड़ें',
    openCrop: 'फसल खोलें',
    remove: 'हटाएं',
    status: 'स्थिति',
    healthy: 'स्वस्थ',
    monitoring: 'निगरानी में',
    needsAttention: 'ध्यान देने योग्य',
    highRisk: 'उच्च जोखिम',
    lastDetection: 'अंतिम पहचान',
    noRecentPest: 'हाल में कोई कीट नहीं',
    soil: 'मिट्टी',
    searchPlaceholder: 'कोई भी फसल, सब्जी या फल खोजें (उदा. टमाटर, मिर्च, धान)...',
    selectCategory: 'श्रेणी',
    all: 'सभी',
    cereals: 'अनाज',
    vegetables: 'सब्जियां',
    commercialCrops: 'व्यावसायिक फसलें',
    fruits: 'फल',
    pulses: 'दलहन एवं तिलहन',
    fieldName: 'खेत का नाम',
    optionalLocation: 'वैकल्पिक स्थान',
    optionalCamera: 'कैमरा आईडी',
    optionalSensors: 'सक्रिय सेंसर',
    addCropButton: 'फसल जोड़ें',
    addToMyCrops: 'मेरी फसलों में जोड़ें',
    preview: 'पूर्वावलोकन',
    cropName: 'फसल का नाम',
    category: 'श्रेणी',
    cropMonitoring: 'फसल निगरानी',
    liveDetection: 'लाइव डिटेक्शन',
    soilHealth: 'मृदा स्वास्थ्य',
    weather: 'मौसम',
    cropHealth: 'फसल स्वास्थ्य',
    pestStatus: 'कीट स्थिति',
    animalProtection: 'पशु संरक्षण',
    openWebcam: '📷 वेबकैम खोलें',
    uploadMedia: '📁 मीडिया अपलोड करें',
    stopCamera: 'कैमरा बंद करें',
    snapshotDetect: 'स्कैन करें',
    aiDiseaseDetection: 'AI रोग एवं कीट पहचान',
    uploadLeafPrompt: 'पत्ती की तस्वीर अपलोड करें',
    analyzeLeaf: 'डीप लर्निंग विश्लेषण',
    prediction: 'पूर्वानुमान',
    confidence: 'सटीकता',
    severity: 'गंभीरता',
    riskLevel: 'जोखिम स्तर',
    symptoms: 'लक्षण',
    causes: 'कारण',
    immediateAction: 'तत्काल कार्रवाई',
    treatmentRecommendation: 'उपचार सिफारिश',
    preventionMeasures: 'रोकथाम उपाय',
    disclaimerText: 'रसायन छिड़काव से पहले कृषि विशेषज्ञ से सलाह अवश्य लें।',
    animalStatus: 'पशु निगरानी स्थिति',
    animalSafe: 'खेत सुरक्षित है',
    animalIntrusion: 'पशु घुसपैठ की चेतावनी',
    triggerAlarmSound: 'अलार्म सायरन बजाएं',
    testAlarm: 'अलार्म परीक्षण',
    ragTitle: 'RAG कृषि सलाहकार',
    ragSubtitle: 'सत्यापित कृषि साहित्य आधारित मार्गदर्शन',
    askPlaceholder: 'फसल सुरक्षा पर कोई भी सवाल पूछें...',
    send: 'पूछें',
    sourcesUsed: 'उपयोग किए गए स्रोत',
    relevance: 'प्रासंगिकता',
    vivaExplainer: 'AI व्याख्या',
    rainProb: 'वर्षा संभावना',
    windSpeed: 'हवा की गति',
    cloudCondition: 'बादल स्थिति',
    soilMoisture: 'मिट्टी की नमी',
    soilPh: 'मिट्टी का pH',
    npkRatio: 'NPK अनुपात',
    uploadSoilImage: '📷 मिट्टी की फोटो अपलोड करें',
    soilDisclaimer: 'फोटो केवल प्रारंभिक संकेत है, प्रयोगशाला परीक्षण नहीं।',
    recentAlerts: 'हालिया अलर्ट',
    viewAllAlerts: 'सभी अलर्ट देखें',
    highPriority: 'अति आवश्यक (HIGH)',
    warningPriority: 'चेतावनी (WARNING)',
    infoPriority: 'सूचना (INFO)',
    farmOverview: 'खेत का अवलोकन',
  },

  // Fallbacks for other regional languages
  ta: {} as any,
  kn: {} as any,
  ml: {} as any,
  mr: {} as any,
  bn: {} as any,
};

// Fill in other Indian languages gracefully from English/Hindi
['ta', 'kn', 'ml', 'mr', 'bn'].forEach(lang => {
  TRANSLATIONS[lang as LanguageCode] = {
    ...TRANSLATIONS.en,
    language: lang === 'ta' ? 'தமிழ்' : lang === 'kn' ? 'ಕನ್ನಡ' : lang === 'ml' ? 'മലയാളം' : lang === 'mr' ? 'मराठी' : 'বাংলা',
  };
});
