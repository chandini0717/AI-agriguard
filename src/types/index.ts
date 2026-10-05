export type CropCategory = 'Cereals' | 'Vegetables' | 'Commercial' | 'Fruits' | 'Pulses & Oilseeds';

export type HealthStatus = 'Healthy' | 'Monitoring' | 'Needs Attention' | 'High Risk';

export interface BoundingBox {
  label: string;
  confidence: number;
  box_2d: [number, number, number, number]; // [ymin, xmin, ymax, xmax] 0-1000 normalized
}

export interface CropItem {
  id: string;
  name: string;
  teluguName: string;
  hindiName?: string;
  scientificName: string;
  category: CropCategory;
  emoji: string;
  image: string;
  fieldName: string;
  status: HealthStatus;
  lastDetection: string;
  temperature: number;
  humidity: number;
  soilMoisture: number;
  soilPh: number;
  soilCondition: 'Good' | 'Moderate' | 'Needs Attention';
  connectedSensors: number;
  activeCamera: boolean;
  supportedPests: string[];
  commonDiseases: string[];
  addedAt: string;
}

export interface PestDetectionResult {
  id: string;
  cropName: string;
  issueName: string;
  detectedCategory: 'disease' | 'pest' | 'healthy' | 'animal' | 'none';
  isHealthy: boolean;
  confidence: number;
  severity: 'Low' | 'Medium' | 'High';
  riskLevel: 'Low' | 'Medium' | 'High';
  symptoms: string[];
  causes: string;
  immediateAction: string;
  treatmentRecommendation: string;
  preventionMeasures: string;
  teluguSummary?: string;
  evidenceImage: string;
  boundingBoxes: BoundingBox[];
  location: string;
  timestamp: string;
  detectionSource: 'Live Webcam' | 'Uploaded Media' | 'Farm IP Camera';
  retrievedSources?: Array<{
    id: string;
    title: string;
    source: string;
    score: number;
  }>;
}

export type SupportedAnimal = 'Monkey' | 'Wild Boar' | 'Deer' | 'Elephant' | 'Cattle' | 'Goat' | 'Dog';

export interface AnimalDetectionResult {
  id: string;
  animal: SupportedAnimal;
  confidence: number;
  location: string;
  timestamp: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  status: 'Safe' | 'Animal Detected';
  evidenceImage: string;
  cameraName: string;
  alertTriggered: boolean;
}

export interface SoilHealthData {
  soilMoisture: number; // %
  soilPh: number; // e.g. 6.5
  nitrogen: number; // kg/ha or ppm
  phosphorus: number;
  potassium: number;
  temperature: number; // °C
  organicCarbon?: number; // %
  soilCondition: 'Good' | 'Moderate' | 'Needs Attention';
  cropSuitability: 'Suitable' | 'Partially Suitable' | 'Not Suitable';
  explanation: string;
  isImageAnalysisIndication?: boolean;
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  rainStatus: 'No Rain' | 'Light Rain' | 'Heavy Rain' | 'Showers';
  rainProbability: number;
  windSpeed: number;
  cloudCondition: string;
  isDemo: boolean;
  forecast: Array<{
    day: string;
    date?: string;
    maxTemp: number;
    minTemp: number;
    rainProb: number;
  }>;
}

export type AlertSeverity = 'HIGH' | 'WARNING' | 'INFO';

export interface AlertItem {
  id: string;
  type: 'pest' | 'animal' | 'soil' | 'weather' | 'camera' | 'sensor';
  title: string;
  message: string;
  teluguVoiceText: string;
  englishVoiceText: string;
  timestamp: string;
  location: string;
  severity: AlertSeverity;
  evidenceImage?: string;
  read: boolean;
}

export type LanguageCode = 'en' | 'te' | 'hi' | 'ta' | 'kn' | 'ml' | 'mr' | 'bn';

export interface ScanHistoryItem {
  id: string;
  cropName: string;
  diseaseOrPest: string;
  status: 'Healthy' | 'Diseased';
  confidence: number;
  severity: 'Low' | 'Medium' | 'High';
  evidenceImage: string;
  timestamp: string;
  fieldLocation: string;
  treatment: string;
  prevention: string;
}

export interface RegisteredUser {
  id: string;
  name: string;
  mobileNumber: string;
  cropName: string;
  fieldLocation?: string;
  registeredAt: string;
  active: boolean;
}

export interface SmsGatewayConfig {
  provider: 'Fast2SMS' | 'Twilio' | 'MSG91' | 'Direct Gateway';
  fast2smsApiKey?: string;
  fast2smsConfigured?: boolean;
  fast2smsApiKeyMasked?: string;
  twilioAccountSid?: string;
  twilioAuthToken?: string;
  twilioFromNumber?: string;
  msg91AuthKey?: string;
  msg91SenderId?: string;
  sirenDurationSeconds: number;
  language: 'all' | 'te' | 'hi' | 'en';
}

export interface AlertHistoryItem {
  id: string;
  ownerName: string;
  mobileNumber: string;
  cropName: string;
  detectedProblem: string;
  detectedCategory: string;
  date: string;
  time: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  smsStatus: '✅ Sent' | '❌ Failed';
  sirenStatus: '🔊 ON' | 'OFF';
  messageText: string;
  gateway: string;
}

export interface FieldOwnerProfile {
  ownerName: string;
  mobileNumber: string;
  cropName: string;
  fieldLocation: string;
  smsGateway: 'Fast2SMS' | 'Twilio' | 'MSG91' | 'Direct Gateway';
  smsLanguage: 'all' | 'te' | 'hi' | 'en';
  autoSmsEnabled: boolean;
  registeredAt?: string;
}

export interface SmsAlertRecord {
  id: string;
  mobileNumber: string;
  crop: string;
  problem: string;
  severity: string;
  location: string;
  recommendedAction: string;
  message: string;
  timestamp: string;
  status: 'DELIVERED' | 'SENT' | 'SIMULATED';
  gateway: string;
  alertCategory?: 'pest' | 'animal' | 'soil' | 'weather';
  languagesIncluded?: string;
  sirenStatus?: '🔊 ON' | 'OFF';
}
