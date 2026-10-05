import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  BookOpen, 
  Volume2, 
  CheckCircle2, 
  User,
  AlertCircle,
  ImagePlus,
  X
} from 'lucide-react';
import { LanguageCode } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import { retrieveRelevantDocuments } from '../data/ragKnowledgeBase';
import { getOfflineRagAdvice } from '../data/ragOfflineAdvice';
import { speakVoiceAlert } from '../services/audioAlertService';

interface RagMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  imageUrl?: string;
  sources?: Array<{
    id: string;
    title: string;
    source: string;
    score: number;
    snippet?: string;
  }>;
  vivaExplainer?: {
    crop: string;
    diseaseOrPest: string;
    retrievalScore: number;
    confidence: number;
  };
}

interface RagAssistantViewProps {
  initialCropContext?: string;
  initialDiseaseContext?: string;
  initialImageBase64?: string;
  currentLanguage: LanguageCode;
}

export const RagAssistantView: React.FC<RagAssistantViewProps> = ({
  initialCropContext = 'Tomato',
  initialDiseaseContext = 'Late Blight',
  initialImageBase64,
  currentLanguage,
}) => {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;
  const [activeCropContext, setActiveCropContext] = useState(initialCropContext);
  const [activeDiseaseContext, setActiveDiseaseContext] = useState(initialDiseaseContext);
  const copy = {
    en: {
      greeting: `Greetings! I am the AgriGuard RAG Agricultural Advisory AI. Context set to: ${activeCropContext} (${activeDiseaseContext}). Ask me about disease symptoms, IPM treatment, organic fungicides, prevention, or growing conditions.`,
      groundingEngine: 'Grounding Engine',
      headerDescription: 'Retrieval-Augmented Generation pipeline grounded in university agronomic compendiums.',
      context: 'Context:',
      farmer: 'Farmer',
      advisor: 'AgriGuard RAG Advisor',
      readAloud: 'Read Aloud',
      searching: 'Searching agricultural references and analyzing your request...',
      imageUpload: 'Attach crop image',
      imageOnly: 'Please examine this crop image, identify any visible symptoms, and recommend next steps.',
      imageTooLarge: 'Choose an image smaller than 10 MB.',
      imageReadError: 'The selected image could not be read.',
      ragArchitecture: 'RAG Architecture & Grounding',
      pipelineStages: 'Pipeline Stages',
      imageAnalysis: '1. Crop Image Analysis',
      retrieval: '2. Agricultural Knowledge Retrieval',
      reranking: '3. Semantic Re-ranking',
      generation: '4. Context-Grounded Generation',
      multilingual: '5. Multilingual Answers (EN / TE / HI)',
      contextOverride: 'Session Context',
      crop: 'Crop',
      disease: 'Disease / Pest',
      disclaimer: 'Agricultural decision-support tool. Advice is informational; consult an authorized local agricultural officer before chemical treatment.',
      questions: [
        ['Tomato Late Blight', 'What are the symptoms and immediate treatment for Tomato Late Blight?'],
        ['Chilli Thrips', 'How can I manage Thrips and leaf curl in Chilli?'],
        ['Ask in Telugu', 'టమాటా మరియు మిరప పంటల తెగుళ్ల నివారణను తెలుగులో వివరించండి.'],
        ['Maize Fall Armyworm', 'What is the IPM control strategy for Fall Armyworm in Maize?'],
      ],
    },
    te: {
      greeting: `నమస్కారం! నేను అగ్రిగార్డ్ వ్యవసాయ సలహా AIని. ప్రస్తుత పంట: ${activeCropContext} (${activeDiseaseContext}). పంట లక్షణాలు, తెగుళ్ల నివారణ, చికిత్స లేదా సాగు గురించి అడగండి.`,
      groundingEngine: 'ఆధారాలపై సమాధానం',
      headerDescription: 'వ్యవసాయ పరిశోధనా సమాచారాన్ని ఆధారంగా చేసుకుని సలహా అందిస్తుంది.',
      context: 'పంట సందర్భం:',
      farmer: 'రైతు',
      advisor: 'అగ్రిగార్డ్ సలహాదారు',
      readAloud: 'చదివి వినిపించు',
      searching: 'వ్యవసాయ ఆధారాలను వెతుకుతూ, మీ ప్రశ్నను విశ్లేషిస్తోంది...',
      imageUpload: 'పంట ఫోటో జోడించండి',
      imageOnly: 'ఈ పంట ఫోటోను పరిశీలించి, కనిపిస్తున్న లక్షణాలను గుర్తించి, తదుపరి చర్యలను సూచించండి.',
      imageTooLarge: '10 MB కంటే చిన్న ఫోటోను ఎంచుకోండి.',
      imageReadError: 'ఎంచుకున్న ఫోటోను చదవలేకపోయాం.',
      ragArchitecture: 'RAG విధానం మరియు ఆధారాలు',
      pipelineStages: 'విశ్లేషణ దశలు',
      imageAnalysis: '1. పంట ఫోటో విశ్లేషణ',
      retrieval: '2. వ్యవసాయ సమాచార సేకరణ',
      reranking: '3. సంబంధిత సమాచార క్రమీకరణ',
      generation: '4. ఆధారాలతో సమాధానం రూపొందింపు',
      multilingual: '5. బహుభాషా సమాధానాలు (తెలుగు / హిందీ / ఇంగ్లీష్)',
      contextOverride: 'ప్రస్తుత పంట వివరాలు',
      crop: 'పంట',
      disease: 'తెగులు / పురుగు',
      disclaimer: 'వ్యవసాయ సమాచార సహాయక సాధనం. రసాయన చికిత్సకు ముందు స్థానిక వ్యవసాయ అధికారిని సంప్రదించండి.',
      questions: [
        ['టమాటా లేట్ బ్లైట్', 'టమాటా లేట్ బ్లైట్ లక్షణాలు మరియు తక్షణ నివారణ ఏమిటి?'],
        ['మిరప త్రిప్స్', 'మిరపలో త్రిప్స్ మరియు ఆకుముడతను ఎలా నివారించాలి?'],
        ['హిందీలో అడగండి', 'टमाटर और मिर्च की फसल में रोगों की रोकथाम कैसे करें?'],
        ['మొక్కజొన్న పురుగు', 'మొక్కజొన్నలో ఫాల్ ఆర్మీవార్మ్ నివారణ పద్ధతులు ఏమిటి?'],
      ],
    },
    hi: {
      greeting: `नमस्कार! मैं एग्रीगार्ड कृषि सलाह AI हूँ। वर्तमान फसल: ${activeCropContext} (${activeDiseaseContext})। फसल के लक्षण, रोग नियंत्रण, उपचार या खेती के बारे में पूछें।`,
      groundingEngine: 'संदर्भ-आधारित सलाह',
      headerDescription: 'कृषि अनुसंधान सामग्री पर आधारित सलाह।',
      context: 'फसल संदर्भ:',
      farmer: 'किसान',
      advisor: 'एग्रीगार्ड सलाहकार',
      readAloud: 'जोर से पढ़ें',
      searching: 'कृषि स्रोत खोजे जा रहे हैं और आपके प्रश्न का विश्लेषण हो रहा है...',
      imageUpload: 'फसल की तस्वीर जोड़ें',
      imageOnly: 'इस फसल की तस्वीर जाँचें, दिखाई देने वाले लक्षण पहचानें और अगले कदम सुझाएँ।',
      imageTooLarge: '10 MB से छोटी तस्वीर चुनें।',
      imageReadError: 'चुनी गई तस्वीर पढ़ी नहीं जा सकी।',
      ragArchitecture: 'RAG प्रक्रिया और संदर्भ',
      pipelineStages: 'विश्लेषण के चरण',
      imageAnalysis: '1. फसल की तस्वीर का विश्लेषण',
      retrieval: '2. कृषि जानकारी की खोज',
      reranking: '3. संबंधित जानकारी का क्रम',
      generation: '4. संदर्भ-आधारित उत्तर',
      multilingual: '5. बहुभाषी उत्तर (हिन्दी / तेलुगु / अंग्रेज़ी)',
      contextOverride: 'वर्तमान फसल विवरण',
      crop: 'फसल',
      disease: 'रोग / कीट',
      disclaimer: 'कृषि निर्णय-सहायक जानकारी। रासायनिक उपचार से पहले स्थानीय कृषि अधिकारी से सलाह लें।',
      questions: [
        ['टमाटर लेट ब्लाइट', 'टमाटर लेट ब्लाइट के लक्षण और तुरंत उपचार क्या हैं?'],
        ['मिर्च थ्रिप्स', 'मिर्च में थ्रिप्स और पत्ती मुड़ने को कैसे नियंत्रित करें?'],
        ['तेलुगु में पूछें', 'టమాటా మరియు మిరప పంటల తెగుళ్ల నివారణను తెలుగులో వివరించండి.'],
        ['मक्का फॉल आर्मीवर्म', 'मक्का में फॉल आर्मीवर्म के एकीकृत नियंत्रण के तरीके क्या हैं?'],
      ],
    },
  }[currentLanguage === 'te' || currentLanguage === 'hi' ? currentLanguage : 'en'];

  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<{ dataUrl: string; name: string; mimeType: string } | null>(null);
  const [imageError, setImageError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const initialImageAppliedRef = useRef(false);

  // Initialize conversation history
  const [messages, setMessages] = useState<RagMessage[]>([
    {
      id: 'msg-init-1',
      sender: 'assistant',
      text: copy.greeting,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sources: [
        {
          id: 'RAG-TOM-01',
          title: 'Tomato Late Blight Identification & Chemical/Bio Management',
          source: 'ICAR-IIHR Vegetable Pathology Compendium',
          score: 95,
          snippet: 'Phytophthora infestans rapid lesion development under >80% RH...',
        }
      ],
      vivaExplainer: {
        crop: activeCropContext,
        diseaseOrPest: activeDiseaseContext,
        retrievalScore: 95,
        confidence: 94.2,
      },
    }
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    setMessages(previous => previous.map((message, index) =>
      index === 0 && message.id === 'msg-init-1' ? { ...message, text: copy.greeting } : message
    ));
  }, [copy.greeting]);

  useEffect(() => {
    if (!initialImageBase64 || initialImageAppliedRef.current) return;
    const mimeType = initialImageBase64.match(/^data:(image\/(?:jpeg|png|webp));base64,/)?.[1];
    if (mimeType) {
      setSelectedImage({ dataUrl: initialImageBase64, name: copy.imageUpload, mimeType });
      initialImageAppliedRef.current = true;
    }
  }, [initialImageBase64, copy.imageUpload]);

  const handleImageSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    setImageError('');
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setImageError(copy.imageReadError);
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setImageError(copy.imageTooLarge);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setSelectedImage({ dataUrl: reader.result, name: file.name, mimeType: file.type });
      } else {
        setImageError(copy.imageReadError);
      }
    };
    reader.onerror = () => setImageError(copy.imageReadError);
    reader.readAsDataURL(file);
  };

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = (queryText || inputText).trim() || (selectedImage ? copy.imageOnly : '');
    if (!textToSend || isLoading) return;

    const userMsg: RagMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      imageUrl: selectedImage?.dataUrl,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      // Call backend RAG API endpoint
      const response = await fetch('/api/rag/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: userMsg.text,
          cropContext: activeCropContext,
          diseaseContext: activeDiseaseContext,
          language: currentLanguage,
          history: messages.slice(-4),
          imageBase64: selectedImage?.dataUrl,
          mediaType: selectedImage?.mimeType,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMsg: RagMessage = {
          id: `ast-${Date.now()}`,
          sender: 'assistant',
          text: data.answer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sources: data.retrievedSources || [],
          vivaExplainer: {
            crop: activeCropContext,
            diseaseOrPest: activeDiseaseContext,
            retrievalScore: data.retrievedSources?.[0]?.score || 88,
            confidence: 94.2,
          },
        };
        setMessages(prev => [...prev, assistantMsg]);
        setSelectedImage(null);
        setImageError('');
        setIsLoading(false);
        return;
      }
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.error || `RAG request failed (${response.status})`);
    } catch (err) {
      console.warn('Backend RAG fetch failed, executing local semantic retrieval pipeline:', err);
    }

    // Local RAG fallback if network API fails
    const localRetrieved = retrieveRelevantDocuments(textToSend, activeCropContext, 3);
    const firstLocalDocument = localRetrieved[0];
    const fallbackAnswer = selectedImage
      ? currentLanguage === 'te'
        ? 'మీ ఫోటో ఆధారంగా విశ్లేషణ అందుబాటులో లేదు. ఇంటర్నెట్ లేదా AI సేవను తనిఖీ చేసి మళ్లీ ప్రయత్నించండి. ఈ స్థానిక సమాధానం ఫోటోను పరిశీలించలేదు.'
        : currentLanguage === 'hi'
          ? 'तस्वीर का विश्लेषण उपलब्ध नहीं है। इंटरनेट या AI सेवा जाँचकर फिर से प्रयास करें। यह स्थानीय उत्तर तस्वीर की जाँच पर आधारित नहीं है।'
          : 'Image analysis is unavailable. Check the connection or AI service and try again. This local response did not inspect the image.'
      : firstLocalDocument
        ? getOfflineRagAdvice(
            firstLocalDocument.id,
            firstLocalDocument.title,
            firstLocalDocument.source,
            currentLanguage,
          )
        : currentLanguage === 'te'
          ? 'ఈ ప్రశ్నకు సరిపడే వ్యవసాయ ఆధారం దొరకలేదు. పంట పేరు, కనిపిస్తున్న లక్షణాలు, సమస్య ఎప్పటి నుంచి ఉందో వివరించండి.'
          : currentLanguage === 'hi'
            ? 'इस प्रश्न से मेल खाता कृषि संदर्भ नहीं मिला। फसल का नाम, दिखाई देने वाले लक्षण और समस्या कब शुरू हुई—बताएँ।'
            : 'No matching agricultural reference was found. Please include the crop, visible symptoms, and when the problem started.';

    const assistantMsg: RagMessage = {
      id: `ast-${Date.now()}`,
      sender: 'assistant',
      text: fallbackAnswer,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sources: localRetrieved.map(d => ({
        id: d.id,
        title: d.title,
        source: d.source,
        score: d.similarity || 85,
        snippet: d.content.slice(0, 160) + '...',
      })),
      vivaExplainer: {
        crop: activeCropContext,
        diseaseOrPest: activeDiseaseContext,
        retrievalScore: localRetrieved[0]?.similarity || 85,
        confidence: 92,
      },
    };

    setMessages(prev => [...prev, assistantMsg]);
    setIsLoading(false);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-emerald-950 border border-emerald-800 shadow-2xl text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-600 text-emerald-950 flex items-center justify-center font-bold shadow-lg">
            <Bot className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span>{t.ragTitle}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {copy.groundingEngine}
              </span>
            </h2>
            <p className="text-xs text-emerald-300/80">
              {copy.headerDescription}
            </p>
          </div>
        </div>

        {/* Active Context Chips */}
        <div className="flex items-center gap-2 bg-emerald-900/60 p-2 rounded-2xl border border-emerald-700/80 text-xs">
          <span className="text-emerald-400 font-bold">{copy.context}</span>
          <span className="px-2 py-0.5 rounded-md bg-emerald-800 text-emerald-200 font-mono">
            {activeCropContext}
          </span>
          <span className="text-emerald-500">•</span>
          <span className="px-2 py-0.5 rounded-md bg-emerald-800 text-emerald-200 font-mono">
            {activeDiseaseContext}
          </span>
        </div>
      </div>

      {/* Main Chat & Viva Explainability Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Chat Stream (8 cols) */}
        <div className="lg:col-span-8 flex flex-col h-[650px] rounded-3xl bg-emerald-950/80 border border-emerald-800/80 shadow-2xl overflow-hidden">
          
          {/* Conversation history */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.map(msg => {
              const isAssistant = msg.sender === 'assistant';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isAssistant ? 'justify-start' : 'justify-end'}`}
                >
                  {isAssistant && (
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 mt-1 shadow">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                    isAssistant
                      ? 'bg-emerald-900/50 border border-emerald-700/80 text-emerald-100 shadow-md'
                      : 'bg-emerald-600 text-white shadow-md'
                  }`}>
                    {/* Message Header */}
                    <div className="flex items-center justify-between gap-3 mb-1 text-[11px] opacity-70">
                      <span className="font-bold">{isAssistant ? copy.advisor : copy.farmer}</span>
                      <span className="font-mono">{msg.timestamp}</span>
                    </div>

                    {/* Message text */}
                    <div className="whitespace-pre-line">
                      {msg.text}
                    </div>
                    {msg.imageUrl && (
                      <img
                        src={msg.imageUrl}
                        alt={copy.imageUpload}
                        className="mt-2 max-h-48 max-w-full rounded-xl border border-emerald-700 object-contain"
                      />
                    )}

                    {/* Grounded Sources Section */}
                    {isAssistant && msg.sources && msg.sources.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-emerald-700/60 text-xs">
                        <div className="text-[11px] font-bold text-emerald-300 flex items-center gap-1.5 mb-2">
                          <BookOpen className="w-3.5 h-3.5 text-yellow-400" />
                          <span>{t.sourcesUsed}:</span>
                        </div>
                        <div className="space-y-1.5">
                          {msg.sources.map((src, i) => (
                            <div
                              key={i}
                              className="p-2 rounded-xl bg-emerald-950/80 border border-emerald-800/80 text-[11px] text-emerald-200"
                            >
                              <div className="flex items-center justify-between font-bold text-white mb-0.5">
                                <span>📄 {src.title}</span>
                                <span className="text-[10px] text-emerald-400 font-mono">
                                  {src.score}% match
                                </span>
                              </div>
                              <span className="text-[10px] text-emerald-400/80 block">
                                Source: {src.source} (ID: {src.id})
                              </span>
                              {src.snippet && (
                                <p className="text-[10px] text-emerald-300/70 italic mt-0.5">
                                  "{src.snippet}"
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Audio Speech Replay Button */}
                    {isAssistant && (
                      <div className="mt-2 pt-1 flex justify-end">
                        <button
                          onClick={() => {
                            speakVoiceAlert(msg.text.slice(0, 200), currentLanguage);
                          }}
                          className="text-[11px] text-yellow-300 hover:text-white flex items-center gap-1 font-semibold"
                        >
                          <Volume2 className="w-3 h-3" /> {copy.readAloud}
                        </button>
                      </div>
                    )}
                  </div>

                  {!isAssistant && (
                    <div className="w-8 h-8 rounded-xl bg-emerald-800 text-white flex items-center justify-center flex-shrink-0 mt-1">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-emerald-900/30 text-emerald-300 text-xs w-max animate-pulse">
                <Sparkles className="w-4 h-4 animate-spin text-yellow-300" />
                <span>{copy.searching}</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick prompt suggestions */}
          <div className="px-4 py-2 bg-emerald-900/30 border-t border-emerald-800/60 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {copy.questions.map(([label, query], i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(query)}
                className="px-2.5 py-1 rounded-xl bg-emerald-900/60 hover:bg-emerald-800 border border-emerald-700/60 text-[11px] text-emerald-200 whitespace-nowrap transition cursor-pointer"
              >
                {label}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-3 bg-emerald-900/50 border-t border-emerald-800">
            {selectedImage && (
              <div className="mb-2 flex items-center gap-2 rounded-xl border border-emerald-700 bg-emerald-950/80 p-2">
                <img src={selectedImage.dataUrl} alt={selectedImage.name} className="h-12 w-12 rounded-lg object-cover" />
                <span className="min-w-0 flex-1 truncate text-xs text-emerald-200">{selectedImage.name}</span>
                <button
                  type="button"
                  onClick={() => setSelectedImage(null)}
                  aria-label={currentLanguage === 'te' ? 'ఫోటో తొలగించు' : currentLanguage === 'hi' ? 'तस्वीर हटाएँ' : 'Remove image'}
                  className="rounded-lg p-1 text-emerald-300 hover:bg-emerald-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            {imageError && <p className="mb-2 text-xs text-red-300" role="alert">{imageError}</p>}
            <div className="flex items-center gap-2">
            <label
              title={copy.imageUpload}
              className="cursor-pointer rounded-2xl border border-emerald-700 bg-emerald-950 p-3 text-emerald-300 hover:bg-emerald-900"
            >
              <ImagePlus className="h-5 w-5" />
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageSelection}
                className="sr-only"
                aria-label={copy.imageUpload}
              />
            </label>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={t.askPlaceholder}
              className="flex-1 px-4 py-3 rounded-2xl bg-emerald-950 border border-emerald-700/80 text-white placeholder-emerald-400/60 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={isLoading || (!inputText.trim() && !selectedImage)}
              className="p-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 disabled:opacity-50 text-emerald-950 font-bold transition shadow"
            >
              <Send className="w-5 h-5" />
            </button>
            </div>
          </div>

        </div>

        {/* Explainability & Final-Year Viva Demonstration Panel (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Viva Explainability Card */}
          <div className="p-5 rounded-3xl bg-emerald-950/80 border border-emerald-800/80 shadow-2xl text-white space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-emerald-800">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <h3 className="font-extrabold text-sm text-white">
                {copy.ragArchitecture}
              </h3>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-900/40 border border-emerald-800 space-y-2 text-xs">
              <div className="text-[11px] text-emerald-300 font-bold uppercase tracking-wider">
                {copy.pipelineStages}
              </div>
              <div className="space-y-1.5 font-mono text-[11px] text-emerald-200">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{copy.imageAnalysis}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{copy.retrieval}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{copy.reranking}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{copy.generation}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{copy.multilingual}</span>
                </div>
              </div>
            </div>

            {/* Context Adjuster */}
            <div className="space-y-2 text-xs">
              <span className="font-bold text-emerald-300 block">{copy.contextOverride}</span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-emerald-400 block mb-0.5">{copy.crop}</label>
                  <input
                    type="text"
                    value={activeCropContext}
                    onChange={(e) => setActiveCropContext(e.target.value)}
                    className="w-full px-2 py-1 rounded-lg bg-emerald-900/70 border border-emerald-700 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-emerald-400 block mb-0.5">{copy.disease}</label>
                  <input
                    type="text"
                    value={activeDiseaseContext}
                    onChange={(e) => setActiveDiseaseContext(e.target.value)}
                    className="w-full px-2 py-1 rounded-lg bg-emerald-900/70 border border-emerald-700 text-xs text-white"
                  />
                </div>
              </div>
            </div>

            {/* Regulatory Disclaimer */}
            <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-800/60 text-[10px] text-amber-200/90 flex items-start gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
              <span>
                {copy.disclaimer}
              </span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
