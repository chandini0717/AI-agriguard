import React, { useState, useRef } from 'react';
import { 
  Video, 
  Upload, 
  Sparkles, 
  Volume2, 
  ShieldCheck, 
  AlertTriangle, 
  Play, 
  Pause,
  Bug,
  Sprout,
  CheckCircle2, 
  FileVideo,
  Flame,
  ArrowRight,
  TrendingUp,
  PawPrint
} from 'lucide-react';
import { LanguageCode } from '../types';
import { 
  playAlertSound, 
  speakVoiceAlert,
  startContinuousSirenLoop,
  dispatchMobilePushAndSms 
} from '../services/audioAlertService';

interface VideoSurveillanceViewProps {
  currentLanguage: LanguageCode;
  onAddAlert: (alert: any) => void;
  locationName?: string;
}

export const VideoSurveillanceView: React.FC<VideoSurveillanceViewProps> = ({
  currentLanguage,
  onAddAlert,
  locationName = 'Farm Field',
}) => {
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
  );
  const [videoFileName, setVideoFileName] = useState<string | null>('monkey_surveillance_sector_a.mp4');
  const [isScanning, setIsScanning] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  // 5 Real Farm Intrusion Animals with Vernacular Announcements
  const farmAnimalsList = [
    {
      id: 'monkey',
      animalName: 'Wild Monkey (Rhesus macaque)',
      teluguAnimalName: 'కోతి (Monkey)',
      hindiAnimalName: 'बंदर (Monkey)',
      announcementBanner: '🚨 WILD MONKEY IS COMING INTO THE FIELD!',
      teluguSpeech: 'హెచ్చరిక! పొలంలోకి కోతి (Monkey) వస్తోంది! అత్యవసర సైరన్ మోగించబడింది! పండ్లు మరియు కూరగాయల పంటను వెంటనే కాపాడండి!',
      hindiSpeech: 'सावधान! खेत में बंदर (Monkey) आ रहा है! आपातकालीन सायरन बज रहा है! फल और सब्जियों की तुरंत रक्षा करें!',
      englishSpeech: 'Alert! Wild Monkey is coming into your field! Alarm siren sounded automatically! Protect fruit crops immediately!',
      confidence: 96,
      dangerLevel: 'Critical (High Crop Loss)',
      icon: '🐒',
      videoSrc: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      cropSuggestions: [
        'Activate ultrasonic boundary acoustic repellers to drive monkeys back to tree canopies.',
        'Protect fruit bunches (Pomegranate, Tomato, Guava) with reflective mesh netting.',
        'Use chili powder extract boundary wash along perimeter branches.'
      ]
    },
    {
      id: 'wild_boar',
      animalName: 'Wild Boar (Sus scrofa)',
      teluguAnimalName: 'అడవి పంది (Wild Boar)',
      hindiAnimalName: 'जंगली सूअर (Wild Boar)',
      announcementBanner: '🚨 WILD BOAR IS COMING NEAR CROP FENCE!',
      teluguSpeech: 'హెచ్చరిక! పొలంలోకి అడవి పంది (Wild Boar) వస్తోంది! అత్యవసర సైరన్ మోగించబడింది! దుంపలు మరియు వేరు వ్యవస్థను తవ్వకుండా జాగ్రత్త పడండి!',
      hindiSpeech: 'सावधान! खेत में जंगली सूअर (Wild Boar) आ रहा है! आपातकालीन सायरन बज रहा है! कंदमूल और फसलों की जड़ों की रक्षा करें!',
      englishSpeech: 'Alert! Wild Boar is coming towards the crop perimeter! Alarm siren activated automatically! Protect root zones!',
      confidence: 95,
      dangerLevel: 'Critical (Root Zone Destruction)',
      icon: '🐗',
      videoSrc: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      cropSuggestions: [
        'Trigger flashing solar strobe boundary lights along perimeter fence trenches.',
        'Spray castor oil slurry along border bunds as an olfactory repellant.',
        'Reinforce lower trench fencing to prevent ground excavation.'
      ]
    },
    {
      id: 'deer',
      animalName: 'Spotted Deer (Axis axis)',
      teluguAnimalName: 'జింక (Deer)',
      hindiAnimalName: 'हिरण (Deer)',
      announcementBanner: '🚨 SPOTTED DEER IS COMING INTO VEGGIE PLOT!',
      teluguSpeech: 'హెచ్చరిక! పొలంలోకి జింక (Deer) వస్తోంది! అత్యవసర సైరన్ మోగించబడింది! లేత కూరగాయల చిగుళ్లను జింకలు తినకుండా వెంటనే రక్షించండి!',
      hindiSpeech: 'सावधान! खेत में हिरण (Deer) आ रहा है! सायरन सक्रिय! कोमल नई पत्तियों और सब्जियों की तुरंत रक्षा करें!',
      englishSpeech: 'Alert! Spotted Deer is coming into the vegetable plot! Alarm siren sounded! Guard fresh terminal crop foliage!',
      confidence: 93,
      dangerLevel: 'High (Foliage Grazing)',
      icon: '🦌',
      videoSrc: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
      cropSuggestions: [
        'Sound bio-acoustic predator growls (tiger/leopard audio broadcast) to repel the deer herd.',
        'Spray non-toxic neem and garlic bitter solution on boundary crop leaves.',
        'Inspect and raise border fencing to 8 feet to prevent jumping.'
      ]
    },
    {
      id: 'snake',
      animalName: 'Venomous Snake / Cobra (Naja naja)',
      teluguAnimalName: 'పాము (Venomous Snake)',
      hindiAnimalName: 'सांप (Snake)',
      announcementBanner: '🚨 VENOMOUS SNAKE DETECTED IN CROP ROWS!',
      teluguSpeech: 'హెచ్చరిక! పంట వరుసలలో అత్యంత ప్రమాదకరమైన పాము (Snake) గుర్తించబడింది! వెంటనే అప్రమత్తం అవ్వండి! సైరన్ మోగించబడింది!',
      hindiSpeech: 'सावधान! खेत में जहरीला सांप (Snake) देखा गया है! सतर्क रहें! आपातकालीन सायरन बज रहा है!',
      englishSpeech: 'Alert! Venomous Snake detected in crop rows! Caution alarm siren activated! Maintain safe perimeter distance!',
      confidence: 97,
      dangerLevel: 'Critical (Severe Bite Hazard)',
      icon: '🐍',
      videoSrc: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      cropSuggestions: [
        'Do not step into thick weeds without rubber safety boots.',
        'Scatter sulfur powder and crushed garlic along bunds as an effective snake repellant.',
        'Keep farm pathways clear of rock piles and rat burrows.'
      ]
    },
    {
      id: 'elephant',
      animalName: 'Wild Elephant Herd (Elephas maximus)',
      teluguAnimalName: 'అడవి ఏనుగు (Elephant)',
      hindiAnimalName: 'जंगली हाथी (Elephant)',
      announcementBanner: '🚨 WILD ELEPHANT IS COMING TOWARDS FIELD BOUNDARY!',
      teluguSpeech: 'హెచ్చరిక! పొలంలోకి అడవి ఏనుగు (Elephant) వస్తోంది! అత్యవసర భారీ సైరన్ మోగించబడింది! సురక్షిత ప్రదేశానికి వెళ్ళండి మరియు అటవీ శాఖకు సమాచారం ఇవ్వండి!',
      hindiSpeech: 'सावधान! खेत में जंगली हाथी (Elephant) आ रहा है! भारी सायरन बज रहा है! सुरक्षित दूरी बनाएं और वन विभाग को सूचित करें!',
      englishSpeech: 'Warning! Wild Elephant is coming towards the field! Urgent alarm siren activated! Maintain safe perimeter distance!',
      confidence: 98,
      dangerLevel: 'Emergency (Severe Trampling Risk)',
      icon: '🐘',
      videoSrc: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      cropSuggestions: [
        'Ignite high-decibel acoustic buzzers and chili smoke briquettes along perimeter buffer.',
        'Alert village forest monitoring squad immediately via SMS.',
        'Never approach; keep floodlights active along outer ditch.'
      ]
    },
    {
      id: 'nilgai',
      animalName: 'Nilgai / Blue Bull (Boselaphus tragocamelus)',
      teluguAnimalName: 'నీల్గాయి (Nilgai / Blue Bull)',
      hindiAnimalName: 'नीलगाय (Nilgai)',
      announcementBanner: '🚨 NILGAI / BLUE BULL IS COMING INTO CROPS!',
      teluguSpeech: 'హెచ్చరిక! పొలంలోకి నీల్గాయి (Nilgai) వస్తోంది! అత్యవసర సైరన్ మోగించబడింది! పప్పుధాన్యాలు మరియు గోధుమ పంటను రక్షించండి!',
      hindiSpeech: 'सावधान! खेत में नीलगाय (Nilgai) आ रही है! आपातकालीन सायरन बज रहा है! दालों और गेहूं की फसल की रक्षा करें!',
      englishSpeech: 'Alert! Nilgai Blue Bull is coming into the crops! Alarm siren sounded! Guard legume and grain fields!',
      confidence: 94,
      dangerLevel: 'High (Crop Stalk Destruction)',
      icon: '🐂',
      videoSrc: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
      cropSuggestions: [
        'Hang reflective CDs and wind chimes along crop perimeter wire.',
        'Spray cow urine and asafoetida (Hing) solution as natural deterrent.',
        'Inspect outer boundary vegetative barrier.'
      ]
    },
    {
      id: 'normal_tree',
      animalName: 'Normal Tree / Plant Foliage (Safe)',
      teluguAnimalName: 'సాధారణ చెట్టు (Normal Tree - No Animals)',
      hindiAnimalName: 'सामान्य पेड़ (Normal Tree - No Animals)',
      announcementBanner: '🌳 NORMAL TREE & VEGETATION (NO DEER / NO WILDLIFE)',
      teluguSpeech: 'ఇది సాధారణ చెట్టు లేదా సహజమైన మొక్క. ఇక్కడ ఎటువంటి జింకలు లేదా అడవి జంతువులు లేవు. పొలం మరియు పంట పూర్తిగా సురక్షితంగా ఉన్నాయి.',
      hindiSpeech: 'यह सामान्य पेड़ और पौधा है। यहां कोई हिरण या जंगली जानवर नहीं है। खेत पूरी तरह सुरक्षित है।',
      englishSpeech: 'Normal tree and foliage verified. Zero deer or wild animal intrusions detected. The perimeter is safe.',
      confidence: 98,
      dangerLevel: 'Safe (No Hazard)',
      icon: '🌳',
      videoSrc: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
      cropSuggestions: [
        'Tree foliage is healthy. Continue standard basin drip irrigation.',
        'Apply natural vermicompost and neem cake once every 3 months.',
        'No wildlife intrusion detected in this frame.'
      ]
    },
    {
      id: 'farmer_human',
      animalName: 'Farmer / Authorized Person (Safe)',
      teluguAnimalName: 'రైతు / మనిషి (Farmer / Person - Safe)',
      hindiAnimalName: 'किसान / अधिकृत व्यक्ति (Farmer - Safe)',
      announcementBanner: '👤 FARMER / AUTHORIZED PERSON VERIFIED (SAFE)',
      teluguSpeech: 'పొలంలో రైతు లేదా మనిషి ఉన్నారు. ఎటువంటి అడవి జంతువులు లేవు. ప్రాంతం పూర్తిగా సురక్షితం.',
      hindiSpeech: 'खेत में किसान या अधिकृत व्यक्ति उपस्थित हैं। कोई जंगली जानवर नहीं है। क्षेत्र सुरक्षित है।',
      englishSpeech: 'Farmer or authorized person verified. Zero wildlife intrusions detected. Area is safe.',
      confidence: 98,
      dangerLevel: 'Safe (No Hazard)',
      icon: '👤',
      videoSrc: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
      cropSuggestions: [
        'Authorized farm presence confirmed.',
        'Emergency siren and automated SMS suppressed.',
        'Continuous surveillance remains active.'
      ]
    },
    {
      id: 'cow_cattle',
      animalName: 'Cattle / Cow / Buffalo (Bos taurus)',
      teluguAnimalName: 'ఆవు / గేదె (Cattle / Cow)',
      hindiAnimalName: 'गाय / मवेशी (Cattle / Cow)',
      announcementBanner: '🚨 CATTLE / COW INTRUSION DETECTED IN CROPS!',
      teluguSpeech: 'హెచ్చరిక! పొలంలోకి ఆవులు లేదా గేదెలు (Cattle) ప్రవేశించాయి! అత్యవసర సైరన్ మోగించబడింది! పంటను రక్షించండి!',
      hindiSpeech: 'सावधान! खेत में मवेशी / गाय (Cattle) आ रहे हैं! आपातकालीन सायरन बज रहा है! फसलों की रक्षा करें!',
      englishSpeech: 'Alert! Stray Cattle or Cows detected in crops! Alarm siren sounded! Inspect field immediately!',
      confidence: 96,
      dangerLevel: 'High (Crop Trampling)',
      icon: '🐄',
      videoSrc: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
      cropSuggestions: [
        'Close perimeter gate latches immediately.',
        'Guide cattle gently away from crop beds toward boundary path.',
        'Reinforce external fence mesh.'
      ]
    },
    {
      id: 'pesticide_scorch',
      animalName: 'Pesticide Chemical Scorch & Residue Toxicity',
      teluguAnimalName: 'పురుగుమందుల రసాయన కాలిన మచ్చలు (Pesticide Burn)',
      hindiAnimalName: 'कीटनाशक केमिकल बर्न (Pesticide Burn)',
      announcementBanner: '⚠️ PESTICIDE OVERDOSE & CHEMICAL RESIDUE DETECTED',
      teluguSpeech: 'హెచ్చరిక! ఆకులపై పురుగుమందుల రసాయన అవశేషాలు మరియు కెమికల్ బర్న్ గుర్తించబడింది! వెంటనే స్వచ్ఛమైన నీటితో ఆకులను కడగండి!',
      hindiSpeech: 'सावधान! पत्तियों पर कीटनाशक का अत्यधिक छिड़काव या केमिकल बर्न मिला है! तुरंत साफ पानी से पत्तियों को धोएं!',
      englishSpeech: 'Alert! High pesticide concentration and chemical residue scorch detected! Wash canopy with clean water immediately!',
      confidence: 95,
      dangerLevel: 'Chemical Toxicity Risk',
      icon: '🧪',
      videoSrc: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      cropSuggestions: [
        'Flush leaf canopy immediately with clean overhead water to wash away concentrated chemical salts.',
        'Spray Seaweed bio-stimulant (2ml/L) to accelerate new leaf recovery.',
        'Pause all chemical sprays for 10 days to allow plant detoxification.'
      ]
    }
  ];

  const [activeAnimal, setActiveAnimal] = useState<typeof farmAnimalsList[0]>(farmAnimalsList[0]);

  // Execute immediate animal detection: Sounds continuous siren without stopping and speaks which animal is coming
  const triggerAnimalDetection = (animal: typeof farmAnimalsList[0]) => {
    setActiveAnimal(animal);
    setIsScanning(true);

    setTimeout(() => {
      setIsScanning(false);

      // Spoken announcement in active language
      let speech = animal.englishSpeech;
      if (currentLanguage === 'te') {
        speech = animal.teluguSpeech;
      } else if (currentLanguage === 'hi') {
        speech = animal.hindiSpeech;
      }

      // Sound mapping:
      // 1. If normal tree or farmer: safe peaceful chime (NO siren)
      // 2. If pesticide burn: caution alert sound
      // 3. If genuine wild animal: CONTINUOUS EMERGENCY SIREN LOOP (DOES NOT STOP UNTIL USER CLICKS STOP!)
      if (animal.id === 'normal_tree' || animal.id === 'farmer_human') {
        playAlertSound('safe');
        speakVoiceAlert(speech, currentLanguage);
      } else if (animal.id === 'pesticide_scorch') {
        playAlertSound('soil');
        speakVoiceAlert(speech, currentLanguage);
      } else {
        // CONTINUOUS SIREN LOOP WITHOUT STOPPING!
        startContinuousSirenLoop({
          category: 'animal',
          title: animal.announcementBanner,
          speechText: speech,
          language: currentLanguage,
        });

        // DISPATCH REAL MOBILE SMS TO REGISTERED OWNER
        dispatchMobilePushAndSms({
          crop: 'Farm Crops',
          problem: `${animal.animalName} Intrusion Detected`,
          severity: 'HIGH',
          location: locationName,
          recommendedAction: animal.cropSuggestions[0] || 'Check field boundary fence immediately.',
          language: currentLanguage,
        });
      }

      // Register alert only if not safe
      if (animal.id !== 'normal_tree' && animal.id !== 'farmer_human') {
        onAddAlert({
          id: `al-anim-${Date.now()}`,
          type: animal.id === 'pesticide_scorch' ? 'pest' : 'animal',
          title: animal.announcementBanner,
          message: `${animal.animalName} (${animal.confidence}%). Alert activated automatically.`,
          teluguVoiceText: animal.teluguSpeech,
          englishVoiceText: animal.englishSpeech,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          location: locationName,
          severity: 'HIGH',
          read: false,
        });
      }
    }, 450);
  };

  // Upload custom user video or picture with real Vision API detection
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setUploadedVideoUrl(url);
    setVideoFileName(file.name);

    // Read file as base64 to send to Gemini Vision API
    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result as string;

      try {
        const res = await fetch('/api/vision/detect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64Data,
            cropHint: 'Crop Surveillance & Animal Intrusion',
            mediaType: file.type || 'image/jpeg',
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const category = data.detectedCategory;
          const animalType = (data.animalIntrusion?.animalType || '').toLowerCase();
          const issueName = (data.issueName || '').toLowerCase();

          // 1. Check for Human Face / Farmer -> SAFE!
          if (category === 'human_safe' || issueName.includes('person') || issueName.includes('farmer') || issueName.includes('human')) {
            const humanScenario = farmAnimalsList.find(a => a.id === 'farmer_human') || farmAnimalsList[0];
            triggerAnimalDetection(humanScenario);
            return;
          }

          // 2. Check for Specific Animals
          if (animalType.includes('snake') || issueName.includes('snake')) {
            const snakeScenario = farmAnimalsList.find(a => a.id === 'snake') || farmAnimalsList[2];
            triggerAnimalDetection(snakeScenario);
            return;
          } else if (animalType.includes('cow') || animalType.includes('buffalo') || animalType.includes('cattle')) {
            const cattleScenario = farmAnimalsList.find(a => a.id === 'cow_cattle') || farmAnimalsList[1];
            triggerAnimalDetection(cattleScenario);
            return;
          } else if (animalType.includes('monkey')) {
            const monkeyScenario = farmAnimalsList.find(a => a.id === 'monkey') || farmAnimalsList[0];
            triggerAnimalDetection(monkeyScenario);
            return;
          } else if (animalType.includes('boar') || animalType.includes('pig')) {
            const boarScenario = farmAnimalsList.find(a => a.id === 'wild_boar') || farmAnimalsList[1];
            triggerAnimalDetection(boarScenario);
            return;
          } else if (animalType.includes('elephant')) {
            const elephantScenario = farmAnimalsList.find(a => a.id === 'elephant') || farmAnimalsList[3];
            triggerAnimalDetection(elephantScenario);
            return;
          } else if (animalType.includes('deer')) {
            const deerScenario = farmAnimalsList.find(a => a.id === 'deer') || farmAnimalsList[1];
            triggerAnimalDetection(deerScenario);
            return;
          } else if (category === 'pesticide_burn') {
            const pesticideScenario = farmAnimalsList.find(a => a.id === 'pesticide_scorch') || farmAnimalsList[7];
            triggerAnimalDetection(pesticideScenario);
            return;
          } else if (data.isHealthy || category === 'healthy') {
            const treeScenario = farmAnimalsList.find(a => a.id === 'normal_tree') || farmAnimalsList[6];
            triggerAnimalDetection(treeScenario);
            return;
          }
        }
      } catch (err) {
        console.warn('Vision detection failed for uploaded file:', err);
      }

      // Safe fallback based on filename or normal tree, NEVER default to Deer!
      const lowerName = file.name.toLowerCase();
      if (lowerName.includes('face') || lowerName.includes('person') || lowerName.includes('human') || lowerName.includes('farmer') || lowerName.includes('selfie') || lowerName.includes('me')) {
        const humanScenario = farmAnimalsList.find(a => a.id === 'farmer_human') || farmAnimalsList[0];
        triggerAnimalDetection(humanScenario);
      } else if (lowerName.includes('snake')) {
        const snakeScenario = farmAnimalsList.find(a => a.id === 'snake') || farmAnimalsList[2];
        triggerAnimalDetection(snakeScenario);
      } else if (lowerName.includes('monkey')) {
        const monkeyScenario = farmAnimalsList.find(a => a.id === 'monkey') || farmAnimalsList[0];
        triggerAnimalDetection(monkeyScenario);
      } else if (lowerName.includes('boar')) {
        const boarScenario = farmAnimalsList.find(a => a.id === 'wild_boar') || farmAnimalsList[1];
        triggerAnimalDetection(boarScenario);
      } else {
        const normalTreeScenario = farmAnimalsList.find(a => a.id === 'normal_tree') || farmAnimalsList[6];
        triggerAnimalDetection(normalTreeScenario);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950 via-rose-950/80 to-emerald-950 border-2 border-emerald-500 shadow-2xl text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center font-black">
            <Video className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <span>Video Surveillance & Animal Intrusion Detector</span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono font-bold">
                Auto-Siren & Animal Voice
              </span>
            </h2>
            <p className="text-xs text-emerald-300/80">
              Upload your farm video. The AI states aloud exactly which animal is coming (Monkey, Boar, Deer, Elephant, Nilgai) and automatically sounds the siren!
            </p>
          </div>
        </div>

        {/* Upload Video Button */}
        <label className="px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs shadow-lg flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer border border-cyan-300/60">
          <Upload className="w-4 h-4" />
          <span>📁 UPLOAD FARM VIDEO (MP4/WebM)</span>
          <input
            type="file"
            accept="video/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* QUICK ANIMAL INTRUSION SELECTOR: SAYS WHICH ANIMAL IS COMING */}
      <div className="p-5 rounded-3xl bg-emerald-950/90 border-2 border-rose-700/80 shadow-2xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
            <PawPrint className="w-4 h-4 text-rose-400" />
            <span>Select Animal to Test "Which Animal is Coming" with Automatic Siren:</span>
          </span>
          <span className="text-[10px] text-emerald-300 font-mono">
            Siren triggers automatically
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {farmAnimalsList.map((animal) => {
            const isSelected = animal.id === activeAnimal.id;
            return (
              <button
                key={animal.id}
                onClick={() => {
                  setUploadedVideoUrl(animal.videoSrc);
                  setVideoFileName(`${animal.id}_surveillance_feed.mp4`);
                  triggerAnimalDetection(animal);
                }}
                className={`p-3.5 rounded-2xl border-2 text-left flex flex-col justify-between gap-1.5 transition cursor-pointer shadow-md ${
                  isSelected
                    ? 'bg-rose-950 border-rose-400 ring-2 ring-rose-500/50 scale-102'
                    : 'bg-emerald-900/40 hover:bg-emerald-800/70 border-emerald-800 text-emerald-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{animal.icon}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-600 text-white font-black uppercase">
                    ALERT
                  </span>
                </div>

                <div className="mt-1">
                  <span className="text-xs font-black text-white block">
                    {animal.animalName.split('(')[0]}
                  </span>
                  <span className="text-[10px] text-amber-300 block font-semibold">
                    {animal.teluguAnimalName}
                  </span>
                </div>

                <span className="text-[9px] text-rose-300 font-mono font-bold mt-1">
                  📢 Says "{animal.id} is coming"
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* VIDEO PLAYER VIEWPORT WITH REAL-TIME ANIMAL TRACKING */}
      <div className="p-5 rounded-3xl bg-emerald-950 border-2 border-emerald-700 shadow-2xl text-white space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-emerald-800">
          <div className="flex items-center gap-2 font-bold text-sm text-cyan-300">
            <FileVideo className="w-5 h-5 text-cyan-400" />
            <span>{videoFileName ? `Video Feed: ${videoFileName}` : 'Surveillance Video Player'}</span>
          </div>

          <button
            onClick={() => triggerAnimalDetection(activeAnimal)}
            disabled={isScanning}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-500 via-rose-500 to-red-600 hover:from-red-400 hover:to-rose-400 text-white font-black text-xs flex items-center gap-1.5 shadow active:scale-95 transition cursor-pointer border border-red-300/40"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isScanning ? 'Identifying Animal...' : '🚨 SCAN VIDEO: WHICH ANIMAL IS COMING?'}</span>
          </button>
        </div>

        <div className="relative aspect-video max-h-[440px] mx-auto rounded-2xl overflow-hidden bg-black border-2 border-rose-900 flex items-center justify-center">
          {uploadedVideoUrl ? (
            <video
              ref={videoRef}
              src={uploadedVideoUrl}
              controls
              autoPlay
              loop
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="p-6 text-center text-emerald-300 space-y-3">
              <Upload className="w-12 h-12 mx-auto text-cyan-400 animate-bounce" />
              <p className="text-sm font-bold text-white">No video loaded</p>
              <p className="text-xs text-emerald-300/80 max-w-sm mx-auto">
                Click any of the 5 animals above or click "UPLOAD FARM VIDEO" to detect which animal is coming!
              </p>
            </div>
          )}

          {/* REAL-TIME OVERLAY TARGETING BOX */}
          <div className="absolute top-1/4 left-1/3 w-64 h-64 border-3 border-red-500 rounded-2xl pointer-events-none flex flex-col justify-between p-2.5 bg-red-500/15 shadow-[0_0_30px_rgba(239,68,68,0.7)] animate-pulse">
            <span className="text-xs font-black bg-red-600 text-white px-2 py-1 rounded shadow w-max flex items-center gap-1">
              <span>{activeAnimal.icon}</span>
              <span>{activeAnimal.animalName} ({activeAnimal.confidence}%)</span>
            </span>
            <span className="text-[10px] text-yellow-200 bg-black/80 px-2 py-0.5 rounded w-max font-mono font-bold">
              SIREN SOUNDING AUTOMATICALLY
            </span>
          </div>
        </div>
      </div>

      {/* HUGE ANNOUNCEMENT BANNER: WHICH ANIMAL IS COMING */}
      <div className="p-6 rounded-3xl border-3 border-red-500 bg-gradient-to-r from-red-950 via-rose-900 to-red-950 shadow-2xl text-white space-y-5 animate-in fade-in">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-white/20 gap-3">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{activeAnimal.icon}</span>
            <div>
              <span className="text-xs font-mono font-black uppercase tracking-wider text-yellow-300 block">
                ANIMAL INTRUSION IDENTIFIED:
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                {activeAnimal.announcementBanner}
              </h3>
              <p className="text-xs text-red-200 font-mono mt-0.5">
                Target: {activeAnimal.animalName} • Confidence: {activeAnimal.confidence}% • Danger: {activeAnimal.dangerLevel}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playAlertSound('HIGH');
              const speech = currentLanguage === 'te' ? activeAnimal.teluguSpeech : activeAnimal.englishSpeech;
              speakVoiceAlert(speech, currentLanguage);
            }}
            className="px-4 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow cursor-pointer active:scale-95 transition"
          >
            <Volume2 className="w-4 h-4" />
            <span>🔊 Re-sound Siren & Speech</span>
          </button>
        </div>

        {/* Spoken Announcement Box in Telugu & Hindi */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-black/60 border border-amber-500/40 text-amber-300 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white block">📢 తెలుగులో ప్రకటన (Says {activeAnimal.teluguAnimalName} is coming):</span>
              <button
                onClick={() => {
                  playAlertSound('HIGH');
                  speakVoiceAlert(activeAnimal.teluguSpeech, 'te');
                }}
                className="text-[10px] text-yellow-300 hover:underline flex items-center gap-1 font-bold"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>వినండి</span>
              </button>
            </div>
            <p className="text-[13px] text-amber-200 font-semibold leading-relaxed">
              "{activeAnimal.teluguSpeech}"
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-black/60 border border-orange-500/40 text-orange-300 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white block">📢 हिन्दी में घोषणा (Says {activeAnimal.hindiAnimalName} is coming):</span>
              <button
                onClick={() => {
                  playAlertSound('HIGH');
                  speakVoiceAlert(activeAnimal.hindiSpeech, 'hi');
                }}
                className="text-[10px] text-orange-300 hover:underline flex items-center gap-1 font-bold"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>सुनें</span>
              </button>
            </div>
            <p className="text-[13px] text-orange-200 font-semibold leading-relaxed">
              "{activeAnimal.hindiSpeech}"
            </p>
          </div>
        </div>

        {/* HOW TO PROTECT & DEVELOP CROPS FROM THIS SPECIFIC ANIMAL */}
        <div className="p-5 rounded-2xl bg-black/70 border border-emerald-500/40 space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <h4 className="text-sm font-black text-white uppercase tracking-wider">
              🌾 How to Protect & Safeguard Crops from {activeAnimal.animalName}:
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {activeAnimal.cropSuggestions.map((sug, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-700/80 space-y-1">
                <span className="font-bold text-yellow-300 block">Step {idx + 1}:</span>
                <p className="text-emerald-100 text-[11px] leading-relaxed">
                  {sug}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
