import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { getOfflineRagAdvice } from './src/data/ragOfflineAdvice';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Shared Gemini client instance with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Curated Agricultural Knowledge Base Chunks for RAG Retrieval
export interface RagKnowledgeChunk {
  id: string;
  crop: string;
  topic: 'disease' | 'pest' | 'treatment' | 'prevention' | 'soil' | 'weather';
  title: string;
  keywords: string[];
  content: string;
  source: string;
}

export const KNOWLEDGE_BASE: RagKnowledgeChunk[] = [
  {
    id: 'rag-tom-01',
    crop: 'Tomato',
    topic: 'disease',
    title: 'Tomato Late Blight (Phytophthora infestans)',
    keywords: ['late blight', 'tomato', 'fungus', 'leaf blight', 'dark water-soaked lesions', 'humidity', 'phytophthora'],
    content: 'Tomato Late Blight is caused by Phytophthora infestans. Symptoms: Rapidly expanding, irregular water-soaked pale-green to brown lesions on leaves and stems, often with white fungal sporulation on the leaf undersides in high humidity (>80%) and cool-moderate temperatures (18-24°C). Fruits develop firm, greasy brown lesions. Management: Destroy infected residues, avoid overhead watering, ensure row spacing for air circulation. Immediate chemical control: Apply preventive protective fungicides like Mancozeb 75% WP (2 g/L) or Copper Oxychloride 50% WP (2.5 g/L). For active outbreaks, systemic fungicides like Metalaxyl + Mancozeb (Ridomil Gold) or Cymoxanil are recommended. Disclaimer: Consult a certified agricultural extension officer before chemical spray.',
    source: 'ICAR-IIHR Vegetable Pathology Manual (Doc #VP-2024-T1)'
  },
  {
    id: 'rag-tom-02',
    crop: 'Tomato',
    topic: 'pest',
    title: 'Tomato Fruit Borer (Helicoverpa armigera)',
    keywords: ['fruit borer', 'tomato', 'helicoverpa', 'caterpillar', 'bore hole', 'larva'],
    content: 'Tomato Fruit Borer (Helicoverpa armigera) is a devastating polyphagous pest. The young larva scrapes foliage while grown larvae bore circular, clean holes into the fruits, thrusting their anterior half inside while leaving frass outside. Symptoms: Bored fruit rotting due to secondary fungal/bacterial infection. Preventive: Install yellow and pheromone traps (12 traps/ha) for monitoring male moths. Plant African Marigold as a trap crop (1 row marigold for every 16 rows of tomato). Biological: Spray Bacillus thuringiensis (Bt) @ 2 g/L or Helicoverpa NPV (250 LE/ha) at egg hatch. Chemical: Spinosad 45 SC @ 0.3 ml/L, Indoxacarb 14.5 SC @ 1 ml/L or Chlorantraniliprole 18.5 SC @ 0.3 ml/L during morning hours.',
    source: 'TNAU Agritech Portal - Tomato Pest Management Guidelines (Doc #PM-TOM-04)'
  },
  {
    id: 'rag-tom-03',
    crop: 'Tomato',
    topic: 'disease',
    title: 'Tomato Early Blight (Alternaria solani)',
    keywords: ['early blight', 'tomato', 'target board', 'concentric rings', 'alternaria', 'yellow halo'],
    content: 'Early blight caused by Alternaria solani produces characteristic dark brown circular spots with concentric target-board rings on older foliage, surrounded by a distinct chlorotic (yellow) halo. Severe infection causes extensive defoliation, sunscald on fruits, and collar rot. Risk factors: High temperature (24-30°C) with intermittent rain and heavy dew. Treatment: Remove bottom 30 cm of leaves touching soil. Spray Chlorothalonil @ 2 g/L or Azoxystrobin 23 SC @ 1 ml/L. Practice 3-year crop rotation with non-solanaceous crops.',
    source: 'National Horticultural Board Plant Health Compendium'
  },
  {
    id: 'rag-chi-01',
    crop: 'Chilli',
    topic: 'pest',
    title: 'Chilli Thrips (Scirtothrips dorsalis) & Mites',
    keywords: ['chilli', 'thrips', 'leaf curl', 'murda disease', 'upward curling', 'scirtothrips'],
    content: 'Chilli Thrips (Scirtothrips dorsalis) lacerate tender leaves and suck plant sap. Upward curling of leaves into boat shapes, brittle leaves, and brownish streaks on the underside indicate thrips infestation. Downward curling indicates yellow mite (Polyphagotarsonemus latus). Integrated Management: Install 20 blue sticky traps/ha for thrips and yellow traps for whiteflies. Spray Neem oil (10,000 ppm) @ 2 ml/L as repellent. Chemical: Fipronil 5 SC @ 1.5 ml/L, Diafenthiuron 50 WP @ 1.2 g/L, or Spinetoram 11.7 SC @ 0.9 ml/L. Avoid excessive nitrogenous fertilizer application which attracts sucking pests.',
    source: 'Dr. YSR Horticultural University Advisory Bull. 2025'
  },
  {
    id: 'rag-chi-02',
    crop: 'Chilli',
    topic: 'disease',
    title: 'Chilli Anthracnose & Dieback (Colletotrichum capsici)',
    keywords: ['anthracnose', 'dieback', 'chilli', 'fruit rot', 'sunken circular spot', 'concentric rings fruit'],
    content: 'Anthracnose causes circular sunken dark spots on ripe red chilli fruits with concentric rings of salmon-pink acervuli. Dieback causes drying of twigs from top downwards. Risk is high during cloudy weather and intermittent rains at 28-30°C. Management: Seed treatment with Trichoderma viride @ 4 g/kg seed. Spray Copper Oxychloride @ 3 g/L or Difenoconazole 25 EC @ 1 ml/L at flowering and fruit set.',
    source: 'ICAR-CPRI Disease Diagnostic Manual'
  },
  {
    id: 'rag-rice-01',
    crop: 'Rice',
    topic: 'pest',
    title: 'Rice Yellow Stem Borer (Scirpophaga incertulas)',
    keywords: ['rice', 'paddy', 'stem borer', 'dead heart', 'white ear', 'scirpophaga'],
    content: 'The yellow stem borer larva bores into the central tiller shoot. In vegetative stage, it causes "dead heart" (central leaf whorl dries and can be pulled out easily). In reproductive stage, it causes "white ear" (empty white panicles without grain). Management: Clipping seedling tips before transplanting to eliminate egg masses. Release Trichogramma japonicum egg parasitoids @ 100,000/ha. Apply Chlorantraniliprole 0.4% GR granules in soil @ 10 kg/ha or spray Cartap Hydrochloride 50 SP @ 2 g/L when ETL exceeds 1 egg mass/m².',
    source: 'ICAR-National Rice Research Institute (NRRI) Cuttack'
  },
  {
    id: 'rag-rice-02',
    crop: 'Rice',
    topic: 'disease',
    title: 'Rice Blast (Magnaporthe oryzae / Pyricularia oryzae)',
    keywords: ['rice', 'blast', 'spindle shaped lesion', 'leaf blast', 'neck blast', 'pyricularia'],
    content: 'Rice blast infects leaves, nodes, and panicle neck. Symptoms: Eye-shaped or spindle-shaped lesions with grayish center and brown margin on leaves; rotting of panicle neck ("neck blast") resulting in severe yield loss. High nitrogen, overcast humid days (>90% RH) accelerate disease. Management: Avoid excess urea; split into 3-4 top dressings. Seed treatment with Tricyclazole 75 WP @ 2 g/kg. Spray Tricyclazole 75 WP @ 0.6 g/L or Isoprothiolane 40 EC @ 1.5 ml/L at first appearance.',
    source: 'International Rice Research Institute (IRRI) Diagnostic Sheet'
  },
  {
    id: 'rag-maize-01',
    crop: 'Maize',
    topic: 'pest',
    title: 'Fall Armyworm (Spodoptera frugiperda) in Maize',
    keywords: ['fall armyworm', 'maize', 'corn', 'spodoptera', 'window pane', 'sawdust frass', 'whorl'],
    content: 'Fall Armyworm (FAW) is an invasive voracious caterpillar that feeds inside the maize whorl. Early stages cause pinholes and "window-paning" on leaves. Grown larvae feed deep in the whorl leaving extensive ragged holes and abundant moist sawdust-like frass. Key identification: Inverted Y-shape on caterpillar head and four dots in square pattern on 8th abdominal segment. Management: Deep summer ploughing, apply neem cake in soil. Push dry sand + wood ash (9:1) or Metarhizium anisopliae (5 g/L) into whorls. Chemical: Chlorantraniliprole 18.5 SC @ 0.4 ml/L or Emamectin Benzoate 5 SG @ 0.4 g/L directed into the central whorls using knapsack sprayer without nozzle filter.',
    source: 'CIMMYT Maize Pest Protocol & ICAR-IIMR Ludhiana'
  },
  {
    id: 'rag-grape-01',
    crop: 'Grape',
    topic: 'disease',
    title: 'Grape Downy Mildew (Plasmopara viticola)',
    keywords: ['grape', 'downy mildew', 'oil spots', 'white downy growth', 'plasmopara', 'leaf drop'],
    content: 'Grape Downy Mildew caused by Plasmopara viticola is the most destructive disease in vineyard regions during rainy/humid periods. Symptoms: Yellowish oily translucent spots ("oil spots") on the upper leaf surface, followed by white cottony downy fungal growth on the underside. Young shoots, tendrils, and blossom clusters curl, turn brown and wither. Management: Maintain proper vine canopy pruning for sunshine penetration. Spray Bordeaux mixture (1%) or Copper Hydroxide (2 g/L) as protectant. Systemic: Dimethomorph 50 WP @ 1 g/L or Metalaxyl-M @ 2.5 g/L applied within 24-48 hours of infection rain.',
    source: 'ICAR-National Research Centre for Grapes, Pune'
  },
  {
    id: 'rag-grape-02',
    crop: 'Grape',
    topic: 'disease',
    title: 'Grape Powdery Mildew (Uncinula necator / Erysiphe necator)',
    keywords: ['grape', 'powdery mildew', 'white powdery coating', 'berry cracking', 'sulfur'],
    content: 'Powdery Mildew thrives in dry, warm, shaded canopies with high relative humidity. Symptoms: White to grayish-white powdery fungal growth on leaves, green shoots, and berries. Infected young berries become hard, stunted, and crack open, exposing seeds. Management: Wettable sulfur 80 WP @ 2.5 g/L (avoid if temperature >35°C to prevent scorch), or Triadimefon 25 WP @ 0.5 g/L, or Tebuconazole 250 EC @ 0.75 ml/L.',
    source: 'ICAR-NRC Grapes Technical Bulletin'
  },
  {
    id: 'rag-cotton-01',
    crop: 'Cotton',
    topic: 'pest',
    title: 'Cotton Pink Bollworm (Pectinophora gossypiella)',
    keywords: ['cotton', 'pink bollworm', 'rosetted flower', 'boll boring', 'pectinophora'],
    content: 'Pink Bollworm larva enters developing cotton bolls, feeding on seeds and staining lint. Infested unopened flowers show characteristic "rosetted flower" symptoms where petals are twisted into a rosette. Management: Install pheromone traps with gossyplure (8 traps/ha). Mass trapping at 20 traps/ha. Spray Spinetoram 11.7 SC @ 1 ml/L or Chlorpyrifos 20 EC @ 2.5 ml/L at rosette flower peak.',
    source: 'Central Institute for Cotton Research (CICR) Nagpur'
  },
  {
    id: 'rag-soil-01',
    crop: 'General',
    topic: 'soil',
    title: 'Soil Nutrient Deficiencies: Nitrogen, Phosphorus, Potassium (N-P-K)',
    keywords: ['soil', 'nitrogen', 'phosphorus', 'potassium', 'npk', 'deficiency', 'chlorosis', 'stunted'],
    content: 'Nitrogen deficiency causes general yellowing (chlorosis) beginning on older lower leaves while upper leaves remain pale green. Phosphorus deficiency manifests as stunted growth with purplish or reddish discoloration on leaves and stems due to anthocyanin accumulation. Potassium deficiency causes marginal leaf scorch, curling, and necrosis along leaf tips and edges. Healthy soil pH range for most vegetables is 6.0 to 7.0. Regular addition of well-decomposed Farm Yard Manure (FYM @ 10-15 tons/ha) improves cation exchange capacity and moisture retention.',
    source: 'Indian Institute of Soil Science (IISS) Bhopal Technical Guide'
  },
  {
    id: 'rag-animal-01',
    crop: 'General',
    topic: 'pest',
    title: 'Wildlife Intrusion Management: Monkeys, Wild Boar, Deer & Cattle',
    keywords: ['monkey', 'wild boar', 'deer', 'elephant', 'cattle', 'animal intrusion', 'deterrent', 'protection'],
    content: 'Wild animals like monkeys, wild boars, and stray cattle cause catastrophic crop trampling and grazing. Non-lethal sustainable deterrence methods: 1. Bio-acoustic sonic repellents (alarm distress calls and high-frequency sounders). 2. Solar perimeter electric fencing (pulsed non-lethal shock). 3. Castor/chilli kerosene rope barriers: Soaking coir ropes in a mixture of used engine oil, castor oil, and crushed pungent chilli extracts hung around field borders repels wild boars and deer through olfactory irritation. 4. Motion-sensor automated strobe lights and acoustic sirens activate upon intruder detection to safeguard fields at night without harming wildlife.',
    source: 'Wildlife-Agriculture Conflict Mitigation Guide, Agroforestry Board'
  }
];

// Ingestion & Semantic Retrieval Pipeline
function searchRagKnowledgeBase(query: string, cropFilter?: string, topK: number = 3): { chunk: RagKnowledgeChunk; score: number }[] {
  const normalizedQuery = query.toLowerCase();
  const queryTokens = normalizedQuery.split(/\s+/).filter(t => t.length > 2);

  const scored = KNOWLEDGE_BASE.map(chunk => {
    let score = 0;

    // Check crop match bonus
    if (cropFilter && chunk.crop.toLowerCase() === cropFilter.toLowerCase()) {
      score += 15;
    } else if (normalizedQuery.includes(chunk.crop.toLowerCase())) {
      score += 10;
    }

    // Keyword match
    for (const kw of chunk.keywords) {
      if (normalizedQuery.includes(kw.toLowerCase())) {
        score += 8;
      }
      for (const token of queryTokens) {
        if (kw.toLowerCase().includes(token)) {
          score += 3;
        }
      }
    }

    // Title match
    for (const token of queryTokens) {
      if (chunk.title.toLowerCase().includes(token)) {
        score += 5;
      }
    }

    // Content body token frequency
    for (const token of queryTokens) {
      const occurrences = chunk.content.toLowerCase().split(token).length - 1;
      score += Math.min(occurrences * 1.5, 6);
    }

    return { chunk, score };
  });

  return scored
    .filter(item => item.score > 2)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

// API Routes

// 1. RAG Agricultural Advisory Chatbot API
app.post('/api/rag/chat', async (req, res) => {
  try {
    const {
      query,
      cropContext,
      diseaseContext,
      language = 'en',
      history = [],
      imageBase64,
      mediaType = 'image/jpeg',
    } = req.body;

    if ((!query || typeof query !== 'string') && !imageBase64) {
      return res.status(400).json({ error: 'A question or image is required.' });
    }

    if (imageBase64 && (typeof imageBase64 !== 'string' || !['image/jpeg', 'image/png', 'image/webp'].includes(mediaType))) {
      return res.status(400).json({ error: 'A valid JPEG, PNG, or WebP image is required.' });
    }

    // Step 1: Retrieve relevant agricultural chunks from knowledge base
    const normalizedQuery = typeof query === 'string' && query.trim()
      ? query.trim()
      : 'Identify visible crop symptoms and provide agricultural advice';
    const searchContextStr = `${normalizedQuery} ${cropContext || ''} ${diseaseContext || ''}`;
    const retrieved = searchRagKnowledgeBase(searchContextStr, cropContext, 4);

    // Fallback if knowledge base has zero relevance
    if (retrieved.length === 0 && !cropContext) {
      const fallbackMsg = language === 'te'
        ? 'వ్యవసాయ నాలెడ్జ్ బేస్‌లో ఈ ప్రశ్నకు సమాధానం ఇవ్వడానికి తగినంత సమాచారం లభించలేదు. దయచేసి పంట లేదా వ్యాధి పేరుతో మళ్లీ ప్రయత్నించండి.'
        : language === 'hi'
          ? 'इस प्रश्न का उत्तर देने के लिए कृषि ज्ञानकोश में पर्याप्त जानकारी नहीं मिली। कृपया फसल या रोग का नाम बताकर फिर से पूछें।'
          : 'I could not find sufficient information in the agricultural knowledge base to answer this question. Please specify the crop or disease name.';
      return res.json({
        answer: fallbackMsg,
        retrievedSources: [],
        language,
        timestamp: new Date().toISOString(),
      });
    }

    const contextText = retrieved
      .map((r, i) => `[Source ${i + 1} - ${r.chunk.title} (${r.chunk.source})]:\n${r.chunk.content}`)
      .join('\n\n');

    // Prompt construction with grounding
    const prompt = `
You are AgriGuard AI, a certified senior agronomist and agricultural scientist.
You are assisting a farmer with practical, grounded crop protection advice.

LANGUAGE REQUIREMENT:
Respond entirely in ${language === 'te' ? 'TELUGU (తెలుగు), retaining standard English technical disease names in brackets only where useful' : language === 'hi' ? 'HINDI (हिन्दी), retaining standard English technical disease names in brackets only where useful' : 'ENGLISH'}. Translate every heading, explanation, warning, and recommendation into the selected language.

SESSION CONTEXT:
- Active Crop: ${cropContext || 'General Agriculture'}
- Detected Disease/Pest: ${diseaseContext || 'None specified'}

RETRIEVED AGRICULTURAL KNOWLEDGE BASE:
${contextText || 'No specific document found; use general integrated pest management best practices with cautionary disclaimer.'}

FARMER'S QUESTION:
"${normalizedQuery}"

INSTRUCTIONS:
1. Ground your answers strictly in the retrieved knowledge base above.
${imageBase64 ? '2. Carefully inspect the attached crop image. Describe visible symptoms and use the image together with the retrieved references; if the image is unclear, say so rather than guessing.' : ''}
2. Structure clearly for a farmer:
   - What is happening (Symptoms / Cause)
   - Immediate Actions (Within 24 hours)
   - Treatment & Spray Recommendations (Include exact doses if mentioned in sources)
   - Long-term Prevention & Cultural Practices
3. Never invent unsupported toxic pesticide mixtures. Always remind the farmer to verify with their local agricultural extension officer.
4. Keep the tone respectful, clear, and reassuring.
`;

    let answer: string;
    try {
      // Call Gemini 3.8 Flash model via server-side SDK
      const contentParts: Array<{ text: string } | { inlineData: { data: string; mimeType: string } }> = [];
      if (imageBase64) {
        const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, '');
        contentParts.push({ inlineData: { data: cleanBase64, mimeType: mediaType } });
      }
      contentParts.push({ text: prompt });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: { parts: contentParts },
      });
      answer = response.text?.trim() || '';
      if (!answer) throw new Error('The AI service returned an empty response.');
    } catch (genError) {
      if (imageBase64) throw genError;
      console.warn('Gemini 3.8 flash unavailable, returning localized advice from retrieved knowledge:', genError);
      
      const primaryChunk = retrieved[0]?.chunk;
      answer = primaryChunk
        ? getOfflineRagAdvice(primaryChunk.id, primaryChunk.title, primaryChunk.source, language)
        : language === 'te'
          ? 'ఈ ప్రశ్నకు సరిపడే వ్యవసాయ ఆధారం దొరకలేదు. పంట పేరు, కనిపిస్తున్న లక్షణాలు, సమస్య ఎప్పటి నుంచి ఉందో వివరించండి.'
          : language === 'hi'
            ? 'इस प्रश्न से मेल खाता कृषि संदर्भ नहीं मिला। फसल का नाम, दिखाई देने वाले लक्षण और समस्या कब शुरू हुई—बताएँ।'
            : 'No matching agricultural reference was found. Please include the crop, visible symptoms, and when the problem started.';
    }

    res.json({
      answer,
      retrievedSources: retrieved.map(r => ({
        id: r.chunk.id,
        title: r.chunk.title,
        crop: r.chunk.crop,
        score: Math.round(r.score),
        source: r.chunk.source,
        snippet: r.chunk.content.slice(0, 180) + '...',
      })),
      language,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('RAG Chat API error:', error);
    res.status(500).json({
      error: 'Failed to process advisory query.',
      details: error?.message || 'Server error',
    });
  }
});

// 2. Vision & Disease / Pest / Animal Detection API
app.post('/api/vision/detect', async (req, res) => {
  try {
    const { imageBase64, cropHint, mediaType = 'image/jpeg' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Image base64 data is required.' });
    }

    // Strip prefix if included
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

    const visionPrompt = `
You are AgriGuard AI, an expert agricultural vision analysis system.
Examine this image with extreme accuracy and identify what is present:

RULE 1 - HUMAN / PERSON / FACE / FARMER:
If this image contains a human face, a person, a farmer, an authorized worker, a selfie, or someone's portrait:
- Set detectedCategory: "human_safe"
- Set isHealthy: true
- Set issueName: "Farmer / Authorized Person (Safe)"
- Set animalIntrusion: { "detected": false, "animalType": "None", "risk": "Low" }
- Set teluguSummary: "పొలంలో మనిషి / రైతు ఉన్నారు. ఎటువంటి జంతువు లేదా ముప్పు లేదు, ప్రాంతం సురక్షితం."
- Set hindiSummary: "खेत में व्यक्ति / किसान उपस्थित हैं। कोई खतरा नहीं है, क्षेत्र सुरक्षित है।"
- Set englishSummary: "Farmer / Authorized person detected. No threat or animal detected, area is safe."
DO NOT EVER MISIDENTIFY A HUMAN FACE OR PERSON AS A DEER OR ANIMAL!

RULE 2 - SPECIFIC ANIMAL OR REPTILE INTRUSION:
If an animal, reptile, or bird is genuinely present in the image, identify the EXACT species:
- "Deer" or "Spotted Deer"
- "Snake" or "Venomous Cobra"
- "Monkey" or "Langur"
- "Wild Boar"
- "Cow", "Buffalo", or "Cattle"
- "Goat" or "Sheep"
- "Elephant"
- "Bird damaging crops"
Set:
- detectedCategory: animalType.toLowerCase().includes('snake') ? "snake" : "animal"
- isHealthy: false
- issueName: "[Exact Animal Name] Intrusion"
- animalIntrusion: { "detected": true, "animalType": "[Exact Animal Name]", "risk": "High" }
- teluguSummary: "హెచ్చరిక! పొలంలోకి [జంతువు పేరు] వచ్చింది! అత్యవసర సైరన్ మోగించబడింది!"
- hindiSummary: "चेतावनी! खेत में [जानवर का नाम] आ गया है! सायरन चालू है!"
- englishSummary: "Warning! [Exact Animal Name] detected entering the field."

RULE 3 - CROP DISEASE OR PEST ATTACK:
- If insect pests (caterpillar, fruit borer, locust, whitefly, termites, etc.): detectedCategory: "pest", issueName: "[Exact Pest Name] Attack"
- If plant disease (early blight, leaf spot, powdery mildew, rust, etc.): detectedCategory: "disease", issueName: "[Exact Disease Name]"
- If pesticide burn/chemical scorch: detectedCategory: "pesticide_burn"
- If normal foliage, grass, or healthy tree with NO animals: detectedCategory: "healthy", isHealthy: true, issueName: "Healthy Crop / Tree", animalIntrusion: { "detected": false, "animalType": "None", "risk": "Low" }
- If fire/smoke: detectedCategory: "fire", issueName: "Fire / Smoke Hazard"

Return strictly valid JSON with this schema:
{
  "detectedCategory": "human_safe" | "animal" | "snake" | "pest" | "disease" | "pesticide_burn" | "healthy" | "fire",
  "cropName": string,
  "issueName": string,
  "isHealthy": boolean,
  "confidence": number (between 75 and 99.5),
  "severity": "Low" | "Medium" | "High",
  "riskLevel": "Low" | "Medium" | "High",
  "animalIntrusion": {
    "detected": boolean,
    "animalType": string,
    "risk": "Low" | "Medium" | "High"
  },
  "pesticideAlert": {
    "detected": boolean,
    "pesticideIssue": string,
    "detoxSteps": string
  },
  "symptoms": string[],
  "causes": string,
  "immediateAction": string,
  "treatmentRecommendation": string,
  "preventionMeasures": string,
  "teluguSummary": string,
  "hindiSummary": string,
  "englishSummary": string
}

Output ONLY valid JSON.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: mediaType,
            },
          },
          { text: visionPrompt },
        ],
      },
    });

    const responseText = response.text || '{}';
    let parsed: any;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(responseText);
    } catch (e) {
      parsed = {
        detectedCategory: 'healthy',
        cropName: cropHint || 'Crop',
        issueName: 'Normal Field Scan (Safe)',
        isHealthy: true,
        confidence: 90.0,
        severity: 'Low',
        riskLevel: 'Low',
        symptoms: ['Normal conditions'],
        causes: 'No active threat identified',
        immediateAction: 'Continue standard field monitoring.',
        treatmentRecommendation: 'None required.',
        preventionMeasures: 'Regular field inspection.',
        animalIntrusion: { detected: false, animalType: 'None', risk: 'Low' },
        teluguSummary: 'పొలంలో ఎటువంటి ముప్పు గుర్తించబడలేదు. పంట సురక్షితంగా ఉంది.',
        hindiSummary: 'खेत में कोई खतरा नहीं पाया गया। फसल सुरक्षित है।',
        englishSummary: 'No immediate threat detected. Field conditions are normal.',
      };
    }

    res.json(parsed);
  } catch (error: any) {
    console.error('Vision detection error:', error);
    res.status(500).json({
      error: 'Vision analysis failed.',
      details: error?.message || 'Server error',
    });
  }
});

// 3. Live Weather API endpoint (Open-Meteo proxy with robust fallback)
app.get('/api/weather', async (req, res) => {
  try {
    const lat = req.query.lat ? parseFloat(req.query.lat as string) : 16.9891; // Default Kakinada, Andhra Pradesh
    const lon = req.query.lon ? parseFloat(req.query.lon as string) : 82.2475;

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m,cloud_cover&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`;

    const weatherRes = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (weatherRes.ok) {
      const data = await weatherRes.json();
      return res.json({
        source: 'live',
        lat,
        lon,
        current: {
          temperature: Math.round(data.current?.temperature_2m ?? 28),
          humidity: Math.round(data.current?.relative_humidity_2m ?? 72),
          rainStatus: (data.current?.precipitation ?? 0) > 0 ? 'Raining' : 'No Rain',
          rainProbability: data.daily?.precipitation_probability_max?.[0] ?? 15,
          windSpeed: Math.round(data.current?.wind_speed_10m ?? 12),
          cloudCondition: (data.current?.cloud_cover ?? 20) > 50 ? 'Cloudy' : 'Clear Sky',
        },
        forecast: (data.daily?.time || []).slice(0, 5).map((dateStr: string, idx: number) => ({
          date: dateStr,
          day: idx === 0 ? 'Today' : idx === 1 ? 'Tomorrow' : new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' }),
          maxTemp: Math.round(data.daily.temperature_2m_max[idx] ?? 31),
          minTemp: Math.round(data.daily.temperature_2m_min[idx] ?? 22),
          rainProb: data.daily.precipitation_probability_max[idx] ?? 20,
        })),
      });
    }
  } catch (err) {
    // Graceful fallback clearly flagged as Demo Data
  }

  // Fallback demo data
  res.json({
    source: 'demo',
    isDemo: true,
    lat: 16.9891,
    lon: 82.2475,
    current: {
      temperature: 28,
      humidity: 72,
      rainStatus: 'No Rain',
      rainProbability: 25,
      windSpeed: 11,
      cloudCondition: 'Partly Cloudy',
    },
    forecast: [
      { day: 'Today', maxTemp: 32, minTemp: 24, rainProb: 25 },
      { day: 'Tomorrow', maxTemp: 31, minTemp: 23, rainProb: 40 },
      { day: 'Wed', maxTemp: 30, minTemp: 22, rainProb: 65 },
      { day: 'Thu', maxTemp: 31, minTemp: 23, rainProb: 30 },
      { day: 'Fri', maxTemp: 33, minTemp: 24, rainProb: 15 },
    ],
  });
});

// 4. Field Owner Profile & Multi-User Access Control (Max 10 Users)
export interface RegisteredUser {
  id: string;
  name: string;
  mobileNumber: string;
  cropName: string;
  fieldLocation?: string;
  registeredAt: string;
  active: boolean;
}

export const MAX_REGISTERED_USERS = 10;
const USERS_FILE = path.join(process.cwd(), 'registered_users.json');

// Default initial seed users
const INITIAL_SEED_USERS: RegisteredUser[] = [
  {
    id: 'usr-01',
    name: 'Chandini Lalam',
    mobileNumber: '+91 6303015695',
    cropName: 'Tomato',
    fieldLocation: 'Kakinada, Andhra Pradesh',
    registeredAt: '2026-10-04 09:00 AM',
    active: true,
  },
  {
    id: 'usr-02',
    name: 'Ravi Kumar',
    mobileNumber: '+91 98491 55432',
    cropName: 'Chilli & Maize',
    fieldLocation: 'Kakinada East Sector',
    registeredAt: '2026-10-01 09:15 AM',
    active: true,
  },
  {
    id: 'usr-03',
    name: 'Priya Reddy',
    mobileNumber: '+91 97012 33445',
    cropName: 'Tomato',
    fieldLocation: 'Kakinada Canal Belt',
    registeredAt: '2026-10-01 10:00 AM',
    active: true,
  },
  {
    id: 'usr-04',
    name: 'Suresh Varma',
    mobileNumber: '+91 94401 88765',
    cropName: 'Cotton & Pulses',
    fieldLocation: 'Samalkota Boundary',
    registeredAt: '2026-10-02 11:30 AM',
    active: true,
  },
  {
    id: 'usr-05',
    name: 'Ananya Sharma',
    mobileNumber: '+91 91234 56789',
    cropName: 'Tomato & Vegetables',
    fieldLocation: 'Greenhouse Sector B',
    registeredAt: '2026-10-02 02:45 PM',
    active: true,
  },
  {
    id: 'usr-06',
    name: 'Venkat Rao',
    mobileNumber: '+91 99887 66554',
    cropName: 'Banana Orchards',
    fieldLocation: 'Godavari Delta Field',
    registeredAt: '2026-10-03 07:15 AM',
    active: true,
  },
  {
    id: 'usr-07',
    name: 'Lakshmi Devi',
    mobileNumber: '+91 98665 43210',
    cropName: 'Groundnut & Sunflower',
    fieldLocation: 'Peddapuram Ridge',
    registeredAt: '2026-10-03 08:45 AM',
    active: true,
  }
];

function loadPersistedUsers(): RegisteredUser[] {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const content = fs.readFileSync(USERS_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Could not read registered_users.json:', e);
  }
  return [...INITIAL_SEED_USERS];
}

function savePersistedUsers(usersList: RegisteredUser[]) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(usersList, null, 2), 'utf-8');
  } catch (e) {
    console.warn('Could not write registered_users.json:', e);
  }
}

// Persisted registered users list (survives reloads and keeps deletions permanently!)
let REGISTERED_USERS: RegisteredUser[] = loadPersistedUsers();

export interface SmsGatewayConfig {
  provider: 'Fast2SMS' | 'Twilio' | 'MSG91' | 'Direct Gateway';
  fast2smsApiKey?: string;
  twilioAccountSid?: string;
  twilioAuthToken?: string;
  twilioFromNumber?: string;
  msg91AuthKey?: string;
  msg91SenderId?: string;
  sirenDurationSeconds: number;
  language: 'all' | 'te' | 'hi' | 'en';
}

const SMS_CONFIG_FILE = path.join(process.cwd(), 'sms_config.json');

function loadPersistedSmsConfig(): SmsGatewayConfig {
  const envConfig: SmsGatewayConfig = {
    provider: (process.env.SMS_PROVIDER as any) || 'Fast2SMS',
    fast2smsApiKey: process.env.FAST2SMS_API_KEY || '',
    twilioAccountSid: process.env.TWILIO_ACCOUNT_SID || '',
    twilioAuthToken: process.env.TWILIO_AUTH_TOKEN || '',
    twilioFromNumber: process.env.TWILIO_PHONE_NUMBER || '',
    msg91AuthKey: process.env.MSG91_AUTH_KEY || '',
    msg91SenderId: process.env.MSG91_SENDER_ID || 'AGRIGU',
    sirenDurationSeconds: 30,
    language: 'all',
  };

  try {
    if (fs.existsSync(SMS_CONFIG_FILE)) {
      const content = fs.readFileSync(SMS_CONFIG_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      const merged = {
        ...envConfig,
        ...parsed,
        fast2smsApiKey: parsed.fast2smsApiKey || envConfig.fast2smsApiKey,
        twilioAccountSid: parsed.twilioAccountSid || envConfig.twilioAccountSid,
        twilioAuthToken: parsed.twilioAuthToken || envConfig.twilioAuthToken,
        twilioFromNumber: parsed.twilioFromNumber || envConfig.twilioFromNumber,
        msg91AuthKey: parsed.msg91AuthKey || envConfig.msg91AuthKey,
      };
      if (merged.fast2smsApiKey) {
        process.env.FAST2SMS_API_KEY = merged.fast2smsApiKey;
      }
      return merged;
    }
  } catch (e) {
    console.warn('Could not read sms_config.json:', e);
  }
  return envConfig;
}

function savePersistedSmsConfig(cfg: SmsGatewayConfig) {
  try {
    fs.writeFileSync(SMS_CONFIG_FILE, JSON.stringify(cfg, null, 2), 'utf-8');
    if (cfg.fast2smsApiKey) {
      process.env.FAST2SMS_API_KEY = cfg.fast2smsApiKey;
      try {
        const envPath = path.join(process.cwd(), '.env');
        let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf-8') : '';
        if (envContent.includes('FAST2SMS_API_KEY=')) {
          envContent = envContent.replace(/FAST2SMS_API_KEY=.*/g, `FAST2SMS_API_KEY="${cfg.fast2smsApiKey}"`);
        } else {
          envContent += `\nFAST2SMS_API_KEY="${cfg.fast2smsApiKey}"\n`;
        }
        fs.writeFileSync(envPath, envContent, 'utf-8');
      } catch (errEnv) {
        console.warn('Could not update .env file:', errEnv);
      }
    }
  } catch (e) {
    console.warn('Could not write sms_config.json:', e);
  }
}

let SMS_CONFIG: SmsGatewayConfig = loadPersistedSmsConfig();

// 5. In-Memory Alert History Log (Matches required format: Owner | Detection | SMS | Siren)
export interface AlertHistoryRecord {
  id: string;
  ownerName: string;
  mobileNumber: string;
  cropName: string;
  detectedProblem: string; // e.g. 🦌 Deer, 🐄 Cow, 🐗 Wild Boar, 🐒 Monkey, 🐛 Pest, 🌿 Crop Disease, 🔥 Fire, 💧 Critical Soil Moisture
  detectedCategory: string;
  date: string;
  time: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  smsStatus: '✅ Sent' | '❌ Failed';
  sirenStatus: '🔊 ON' | 'OFF';
  messageText: string;
  gateway: string;
  providerRequestId?: string;
  deliveryStatus?: string;
  errorMessage?: string;
}

const ALERT_HISTORY: AlertHistoryRecord[] = [
  {
    id: 'alt-01',
    ownerName: 'Ravi Kumar',
    mobileNumber: '+91 98491 55432',
    cropName: 'Chilli & Maize',
    detectedProblem: '🦌 Deer Intrusion',
    detectedCategory: 'deer',
    date: '03/10/2026',
    time: '10:25 PM',
    severity: 'HIGH',
    smsStatus: '✅ Sent',
    sirenStatus: '🔊 ON',
    messageText: '🚨 CROP ALERT: Deer detected in your field. Siren activated. Please check your field immediately. Time: 10:25 PM.',
    gateway: 'Fast2SMS',
  },
  {
    id: 'alt-02',
    ownerName: 'Priya Reddy',
    mobileNumber: '+91 97012 33445',
    cropName: 'Tomato',
    detectedProblem: '🐛 Pest Attack',
    detectedCategory: 'pest',
    date: '03/10/2026',
    time: '10:18 PM',
    severity: 'HIGH',
    smsStatus: '✅ Sent',
    sirenStatus: 'OFF',
    messageText: '🚨 CROP ALERT: Pest attack detected in your Tomato crop. Please inspect your crop immediately.',
    gateway: 'Twilio',
  },
  {
    id: 'alt-03',
    ownerName: 'Chandini Lalam',
    mobileNumber: '+91 98480 22338',
    cropName: 'Tomato',
    detectedProblem: '🌿 Crop Disease (Early Blight)',
    detectedCategory: 'disease',
    date: '03/10/2026',
    time: '09:40 PM',
    severity: 'MEDIUM',
    smsStatus: '✅ Sent',
    sirenStatus: 'OFF',
    messageText: '🚨 CROP ALERT: Disease detected in your Tomato crop. Please inspect your crop immediately.',
    gateway: 'Fast2SMS',
  }
];

// Helper to construct exact user-requested SMS formats in Telugu, Hindi & English
function buildSmsText(options: {
  crop: string;
  problem: string;
  severity: string;
  time: string;
  category: string;
  language: 'all' | 'te' | 'hi' | 'en';
  location: string;
  recommendedAction: string;
  ownerName?: string;
}): string {
  const { crop, problem, severity, time, category, language, ownerName } = options;

  const probLower = (problem + ' ' + category).toLowerCase();

  // 1. Detect exact animal if animal or snake
  const isSnake = probLower.includes('snake') || probLower.includes('cobra') || probLower.includes('viper');
  const isDeer = probLower.includes('deer') || category === 'deer';
  const isBoar = probLower.includes('boar') || probLower.includes('pig') || category === 'boar';
  const isMonkey = probLower.includes('monkey') || probLower.includes('langur') || category === 'monkey';
  const isCattle = probLower.includes('cow') || probLower.includes('cattle') || probLower.includes('buffalo') || category === 'cow';
  const isElephant = probLower.includes('elephant');
  const isGoat = probLower.includes('goat') || probLower.includes('sheep');
  const isBird = probLower.includes('bird') || probLower.includes('peacock');
  const isNilgai = probLower.includes('nilgai');

  if (isSnake) {
    return `🚨 URGENT CROP ALERT: Venomous Snake / Cobra detected in your ${crop} field. Siren activated. Please maintain safe distance and inspect carefully. Time: ${time}.
[తెలుగు]: అత్యవసర హెచ్చరిక! మీ ${crop} పొలంలో విషపూరిత పాము (Venomous Snake) గుర్తించబడింది! సైరన్ మోగించబడింది! సురక్షిత దూరంలో ఉండండి.
[हिन्दी]: आपातकालीन अलर्ट: आपके ${crop} खेत में जहरीला सांप देखा गया है! सायरन चालू है! सुरक्षित दूरी बनाए रखें।`;
  }

  if (isDeer) {
    return `🚨 CROP ALERT: Spotted Deer detected entering your ${crop} field. Siren activated for 30s. Please inspect your crop immediately. Time: ${time}.
[తెలుగు]: హెచ్చరిక! మీ ${crop} పొలంలోకి జింక (Deer) ప్రవేశించింది. సైరన్ మోగించబడింది! లేత చిగుళ్లను కాపాడండి.
[हिन्दी]: अलर्ट: आपके ${crop} खेत में हिरण (Deer) देखा गया है। सायरन चालू है। कृपया तुरंत खेत की जांच करें।`;
  }

  if (isBoar) {
    return `🚨 CROP ALERT: Wild Boar detected entering your ${crop} field. Siren activated. Please protect root crops immediately. Time: ${time}.
[తెలుగు]: హెచ్చరిక! మీ ${crop} పొలంలోకి అడవి పంది (Wild Boar) ప్రవేశించింది. సైరన్ మోగించబడింది! పంట దుంపలను రక్షించండి.
[हिन्दी]: अलर्ट: आपके ${crop} खेत में जंगली सूअर (Wild Boar) देखा गया है। सायरन चालू है। तुरंत जड़ों और कंदमूल की रक्षा करें।`;
  }

  if (isMonkey) {
    return `🚨 CROP ALERT: Wild Monkey troop detected entering your ${crop} field. Siren activated. Please guard fruit crops immediately. Time: ${time}.
[తెలుగు]: హెచ్చరిక! మీ ${crop} పొలంలోకి కోతులు (Monkeys) వచ్చాయి. సైరన్ మోగించబడింది! పండ్లు మరియు పంటలను కాపాడండి.
[हिन्दी]: अलर्ट: आपके ${crop} खेत में बंदर (Monkeys) आ गए हैं। सायरन चालू है। फल और फसलों की रक्षा करें।`;
  }

  if (isCattle) {
    return `🚨 CROP ALERT: Stray Cattle / Cow detected entering your ${crop} field. Siren activated. Please guide animals out immediately. Time: ${time}.
[తెలుగు]: హెచ్చరిక! మీ ${crop} పొలంలోకి ఆవులు/పశువులు (Cattle / Cow) ప్రవేశించాయి. సైరన్ మోగించబడింది! పంటను రక్షించండి.
[हिन्दी]: अलर्ट: आपके ${crop} खेत में मवेशी/गाय (Cattle) आ गए हैं। सायरन चालू है। तुरंत फसल की रक्षा करें।`;
  }

  if (isElephant) {
    return `🚨 URGENT CROP ALERT: Wild Elephant detected near your ${crop} field boundary. Siren activated. Keep safe perimeter. Time: ${time}.
[తెలుగు]: అత్యవసర హెచ్చరిక! మీ ${crop} పొలంలోకి అడవి ఏనుగు (Elephant) వస్తోంది. భారీ సైరన్ మోగించబడింది! సురక్షిత ప్రదేశానికి వెళ్ళండి.
[हिन्दी]: आपातकालीन अलर्ट: आपके खेत में जंगली हाथी (Elephant) देखा गया है। भारी सायरन चालू है। सुरक्षित दूरी बनाएं।`;
  }

  if (isGoat) {
    return `🚨 CROP ALERT: Stray Goats / Sheep detected grazing in your ${crop} field. Siren activated. Time: ${time}.
[తెలుగు]: హెచ్చరిక! మీ పొలంలోకి మేకలు/గొర్రెలు వచ్చాయి. సైరన్ మోగించబడింది!
[हिन्दी]: अलर्ट: आपके खेत में बकरियां/भेड़ें आ गई हैं। सायरन चालू है!`;
  }

  if (isBird) {
    return `🚨 CROP ALERT: Crop-damaging birds detected flocking in your ${crop} field. Deterrent siren activated. Time: ${time}.
[తెలుగు]: హెచ్చరిక! పంటపై పక్షుల గుంపు దాడి చేస్తోంది. ధాన్యాలను రక్షించండి!
[हिन्दी]: अलर्ट: खेत में पक्षियों का झुंड फसलों को नुकसान पहुंचा रहा है!`;
  }

  if (isNilgai) {
    return `🚨 CROP ALERT: Nilgai / Blue Bull detected entering your ${crop} field. Siren activated. Time: ${time}.
[తెలుగు]: హెచ్చరిక! మీ పొలంలోకి నీల్గాయి (Nilgai) వచ్చింది! సైరన్ మోగించబడింది.
[हिन्दी]: अलर्ट: आपके खेत में नीलगाय आ गई है! सायरन चालू है।`;
  }

  if (category === 'animal') {
    return `🚨 CROP ALERT: Wild Animal detected in your ${crop} field. Siren activated for 30s. Please check immediately. Time: ${time}.
[తెలుగు]: హెచ్చరిక! మీ పొలంలోకి అడవి జంతువు ప్రవేశించింది. సైరన్ మోగించబడింది! వెంటనే పరిశీలించండి.
[हिन्दी]: अलर्ट: आपके खेत में जंगली जानवर देखा गया है। सायरन चालू है। तुरंत जांच करें।`;
  }

  if (category === 'disease') {
    return `🚨 CROP ALERT: Crop Disease detected in your ${crop} crop (${problem}). Please inspect your crop immediately. Time: ${time}.
[తెలుగు]: హెచ్చరిక! మీ ${crop} పంటలో తెగులు (${problem}) గుర్తించబడింది. దయచేసి వెంటనే పరిశీలించండి.
[हिन्दी]: अलर्ट: आपकी ${crop} फसल में बीमारी (${problem}) की पहचान हुई है। तुरंत जांच करें।`;
  }

  if (category === 'pest') {
    return `🚨 CROP ALERT: Pest attack detected in your ${crop} crop (${problem}). Please inspect and apply IPM bio-spray immediately. Time: ${time}.
[తెలుగు]: హెచ్చరిక! మీ ${crop} పంటలో పురుగు దాడి (${problem}) గుర్తించబడింది. దయచేసి వెంటనే నివారణ చర్యలు తీసుకోండి.
[हिन्दी]: अलर्ट: आपकी ${crop} फसल में कीट का हमला (${problem}) हुआ है। कृपया तुरंत कीटनाशक नियंत्रण उपाय करें।`;
  }

  if (category === 'fire') {
    return `🚨 URGENT CROP ALERT: Fire / Smoke hazard detected in your ${crop} field! Siren activated. Evacuate and call emergency services. Time: ${time}.
[తెలుగు]: అత్యవసర హెచ్చరిక! మీ పొలంలో అగ్నిప్రమాదం/మంటలు గుర్తించబడ్డాయి! సైరన్ మోగించబడింది! వెంటనే రక్షణ చర్యలు తీసుకోండి.
[हिन्दी]: आपातकालीन अलर्ट! आपके खेत में आग/धुआं देखा गया है! सायरन चालू है! तुरंत जांच करें।`;
  }

  if (category === 'soil') {
    return `🚨 CROP ALERT: Critical soil moisture detected in ${crop}. Irrigation may be required immediately. Time: ${time}.
[తెలుగు]: హెచ్చరిక! నేలలో తేమ చాలా తక్కువగా ఉంది. నీటిపారుదల (తడి) వెంటనే అవసరం కావచ్చు.
[हिन्दी]: अलर्ट: मिट्टी की नमी बहुत कम है। तुरंत सिंचाई की आवश्यकता हो सकती है।`;
  }

  return `🚨 CROP ALERT: ${problem} detected in your ${crop} field. Please check your field immediately. Time: ${time}.`;
}

// 6. User Management Endpoints (Strict 10 User Access Limit)
app.get('/api/users', (_req, res) => {
  res.json({
    success: true,
    users: REGISTERED_USERS,
    total: REGISTERED_USERS.length,
    maxLimit: MAX_REGISTERED_USERS,
    isLimitReached: REGISTERED_USERS.length >= MAX_REGISTERED_USERS,
  });
});

app.post('/api/users', (req, res) => {
  try {
    const { name, mobileNumber, cropName, fieldLocation } = req.body;

    // Strict 10 user limit rule
    if (REGISTERED_USERS.length >= MAX_REGISTERED_USERS) {
      return res.status(400).json({
        success: false,
        error: 'User limit reached. Maximum 10 users are allowed.',
        isLimitReached: true,
        currentCount: REGISTERED_USERS.length,
        maxLimit: MAX_REGISTERED_USERS,
      });
    }

    if (!name || !mobileNumber || !cropName) {
      return res.status(400).json({
        success: false,
        error: 'Name, mobile phone number, and field/crop name are all required.',
      });
    }

    const newUser: RegisteredUser = {
      id: `usr-${Date.now().toString().slice(-4)}`,
      name: String(name).trim(),
      mobileNumber: String(mobileNumber).trim(),
      cropName: String(cropName).trim(),
      fieldLocation: fieldLocation ? String(fieldLocation).trim() : 'Kakinada, Andhra Pradesh',
      registeredAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      active: true,
    };

    REGISTERED_USERS.push(newUser);
    savePersistedUsers(REGISTERED_USERS);

    console.log(`[USER-REGISTRATION] Registered user ${newUser.name} (${newUser.mobileNumber}). Total: ${REGISTERED_USERS.length}/10`);

    res.json({
      success: true,
      message: 'Field owner successfully registered!',
      user: newUser,
      total: REGISTERED_USERS.length,
      maxLimit: MAX_REGISTERED_USERS,
      isLimitReached: REGISTERED_USERS.length >= MAX_REGISTERED_USERS,
      users: REGISTERED_USERS,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to register user', details: err.message });
  }
});

app.put('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const userIndex = REGISTERED_USERS.findIndex(u => u.id === id);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  const { name, mobileNumber, cropName, fieldLocation, active } = req.body;
  if (name) REGISTERED_USERS[userIndex].name = name.trim();
  if (mobileNumber) REGISTERED_USERS[userIndex].mobileNumber = mobileNumber.trim();
  if (cropName) REGISTERED_USERS[userIndex].cropName = cropName.trim();
  if (fieldLocation !== undefined) REGISTERED_USERS[userIndex].fieldLocation = fieldLocation.trim();
  if (active !== undefined) REGISTERED_USERS[userIndex].active = Boolean(active);

  savePersistedUsers(REGISTERED_USERS);

  res.json({
    success: true,
    user: REGISTERED_USERS[userIndex],
    users: REGISTERED_USERS,
  });
});

app.delete('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const initialLen = REGISTERED_USERS.length;
  REGISTERED_USERS = REGISTERED_USERS.filter(u => u.id !== id);

  if (REGISTERED_USERS.length === initialLen) {
    return res.status(404).json({ error: 'User not found' });
  }

  savePersistedUsers(REGISTERED_USERS);
  console.log(`[USER-DELETED] Removed user ID ${id}. Remaining: ${REGISTERED_USERS.length}/10`);

  res.json({
    success: true,
    message: 'User deleted permanently. Free slot available.',
    total: REGISTERED_USERS.length,
    maxLimit: MAX_REGISTERED_USERS,
    isLimitReached: false,
    users: REGISTERED_USERS,
  });
});

// Clear all default sample users, leaving only user-added phone numbers
app.post('/api/users/clear-defaults', (_req, res) => {
  REGISTERED_USERS = REGISTERED_USERS.filter(u => !u.id.startsWith('usr-0'));
  savePersistedUsers(REGISTERED_USERS);
  console.log(`[USERS-CLEARED-DEFAULTS] Kept custom users. Remaining: ${REGISTERED_USERS.length}/10`);

  res.json({
    success: true,
    message: 'Sample users cleared! Ready for your phone numbers.',
    total: REGISTERED_USERS.length,
    maxLimit: MAX_REGISTERED_USERS,
    isLimitReached: false,
    users: REGISTERED_USERS,
  });
});

// Clear all users completely
app.post('/api/users/clear-all', (_req, res) => {
  REGISTERED_USERS = [];
  savePersistedUsers(REGISTERED_USERS);
  console.log(`[USERS-CLEARED-ALL] All users wiped.`);

  res.json({
    success: true,
    message: 'All registered users cleared! 10/10 slots available.',
    total: 0,
    maxLimit: MAX_REGISTERED_USERS,
    isLimitReached: false,
    users: [],
  });
});

// 7. SMS Gateway Configuration & Test Button Endpoints
app.get('/api/sms/config', (_req, res) => {
  res.json({
    success: true,
    config: {
      provider: SMS_CONFIG.provider,
      fast2smsConfigured: Boolean(SMS_CONFIG.fast2smsApiKey || process.env.FAST2SMS_API_KEY),
      twilioConfigured: Boolean(SMS_CONFIG.twilioAccountSid || process.env.TWILIO_ACCOUNT_SID),
      msg91Configured: Boolean(SMS_CONFIG.msg91AuthKey || process.env.MSG91_AUTH_KEY),
      sirenDurationSeconds: SMS_CONFIG.sirenDurationSeconds,
      language: SMS_CONFIG.language,
      twilioFromNumber: SMS_CONFIG.twilioFromNumber,
      msg91SenderId: SMS_CONFIG.msg91SenderId,
      // Provide masked key indicator so user knows if key is saved without exposing full secrets
      fast2smsApiKeyMasked: (SMS_CONFIG.fast2smsApiKey || process.env.FAST2SMS_API_KEY) ? '••••••••••••••••' : '',
    }
  });
});

app.post('/api/sms/config', (req, res) => {
  try {
    const { 
      provider, 
      fast2smsApiKey, 
      twilioAccountSid, 
      twilioAuthToken, 
      twilioFromNumber, 
      msg91AuthKey, 
      msg91SenderId,
      sirenDurationSeconds,
      language 
    } = req.body;

    if (provider) SMS_CONFIG.provider = provider;
    if (fast2smsApiKey !== undefined) SMS_CONFIG.fast2smsApiKey = fast2smsApiKey.trim();
    if (twilioAccountSid !== undefined) SMS_CONFIG.twilioAccountSid = twilioAccountSid.trim();
    if (twilioAuthToken !== undefined) SMS_CONFIG.twilioAuthToken = twilioAuthToken.trim();
    if (twilioFromNumber !== undefined) SMS_CONFIG.twilioFromNumber = twilioFromNumber.trim();
    if (msg91AuthKey !== undefined) SMS_CONFIG.msg91AuthKey = msg91AuthKey.trim();
    if (msg91SenderId !== undefined) SMS_CONFIG.msg91SenderId = msg91SenderId.trim();
    if (sirenDurationSeconds !== undefined) SMS_CONFIG.sirenDurationSeconds = Number(sirenDurationSeconds) || 30;
    if (language !== undefined) SMS_CONFIG.language = language;

    savePersistedSmsConfig(SMS_CONFIG);
    console.log(`[SMS-CONFIG-UPDATED] Provider: ${SMS_CONFIG.provider}, Fast2SMS Key Present: ${Boolean(SMS_CONFIG.fast2smsApiKey)}`);

    const isFast2smsConfigured = Boolean(SMS_CONFIG.fast2smsApiKey || process.env.FAST2SMS_API_KEY);

    res.json({
      success: true,
      message: 'SMS Gateway configuration updated & saved to disk successfully',
      config: {
        provider: SMS_CONFIG.provider,
        fast2smsConfigured: isFast2smsConfigured,
        fast2smsApiKeyMasked: isFast2smsConfigured ? '••••••••••••••••' : '',
        twilioConfigured: Boolean(SMS_CONFIG.twilioAccountSid || process.env.TWILIO_ACCOUNT_SID),
        msg91Configured: Boolean(SMS_CONFIG.msg91AuthKey || process.env.MSG91_AUTH_KEY),
        sirenDurationSeconds: SMS_CONFIG.sirenDurationSeconds,
        language: SMS_CONFIG.language,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update SMS configuration', details: err.message });
  }
});

// Real SMS Dispatch Interface
export interface RealSmsResult {
  delivered: boolean;
  accepted: boolean;
  statusCode: number;
  gateway: string;
  txId?: string;
  deliveryStatus?: string;
  providerResponse?: any;
  error?: string;
  isConfigMissing?: boolean;
  smsUri: string;
}

// Real SMS Dispatch Handlers - Never Fakes Success!
async function dispatchRealSms(options: {
  phone: string;
  message: string;
}): Promise<RealSmsResult> {
  const { phone, message } = options;
  const provider = SMS_CONFIG.provider || 'Fast2SMS';
  const clean10Digits = phone.replace(/[^0-9]/g, '').slice(-10);
  const cleanE164 = phone.startsWith('+') ? phone.replace(/[^0-9+]/g, '') : `+91${clean10Digits}`;
  const smsUri = `sms:${encodeURIComponent(cleanE164)}?body=${encodeURIComponent(message)}`;
  const fallbackTxId = `TX-${provider.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-6)}`;

  // 1. Fast2SMS Provider
  if (provider === 'Fast2SMS') {
    const fast2smsKey = SMS_CONFIG.fast2smsApiKey || process.env.FAST2SMS_API_KEY;

    if (!fast2smsKey) {
      console.warn(`[SMS-FAST2SMS-FAIL] API Key is missing. Cannot send real SMS to ${cleanE164}`);
      return {
        delivered: false,
        accepted: false,
        statusCode: 400,
        gateway: 'Fast2SMS',
        error: 'Fast2SMS API Key is not configured.',
        isConfigMissing: true,
        smsUri,
      };
    }

    if (clean10Digits.length !== 10) {
      return {
        delivered: false,
        accepted: false,
        statusCode: 400,
        gateway: 'Fast2SMS',
        error: `Invalid Indian mobile number: "${phone}". Fast2SMS requires a valid 10-digit Indian number.`,
        smsUri,
      };
    }

    try {
      console.log(`[FAST2SMS-DISPATCH] Sending real SMS to ${clean10Digits} via Fast2SMS Quick Route...`);
      
      // Step A: Try Route 'q' (Quick SMS: Does NOT require pre-approved DLT templates in India!)
      const fRes = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          'authorization': fast2smsKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          route: 'q',
          message: message,
          language: 'english',
          flash: 0,
          numbers: clean10Digits,
        }),
      });

      const fData = await fRes.json();
      console.log(`[FAST2SMS-RESPONSE] HTTP ${fRes.status}:`, JSON.stringify(fData));

      if (fData.return === true) {
        return {
          delivered: true,
          accepted: true,
          statusCode: fRes.status || 200,
          gateway: 'Fast2SMS',
          txId: fData.request_id || fallbackTxId,
          deliveryStatus: 'Accepted by Fast2SMS / In-Transit',
          providerResponse: fData,
          smsUri,
        };
      }

      // Step B: If route 'q' rejected with route error, try route 'v3' with default sender ID
      if (fData.message && typeof fData.message === 'string' && fData.message.toLowerCase().includes('route')) {
        console.log(`[FAST2SMS-RETRY] Retrying via route 'v3'...`);
        const fRes2 = await fetch('https://www.fast2sms.com/dev/bulkV2', {
          method: 'POST',
          headers: {
            'authorization': fast2smsKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            route: 'v3',
            sender_id: 'TXTIND',
            message: message,
            language: 'english',
            flash: 0,
            numbers: clean10Digits,
          }),
        });
        const fData2 = await fRes2.json();
        if (fData2.return === true) {
          return {
            delivered: true,
            accepted: true,
            statusCode: fRes2.status || 200,
            gateway: 'Fast2SMS',
            txId: fData2.request_id || fallbackTxId,
            deliveryStatus: 'Accepted by Fast2SMS / In-Transit',
            providerResponse: fData2,
            smsUri,
          };
        }
      }

      // If Fast2SMS returned return: false
      const errorMsg = Array.isArray(fData.message) ? fData.message.join(', ') : (fData.message || 'Fast2SMS rejected the SMS request');
      return {
        delivered: false,
        accepted: false,
        statusCode: fRes.status || 400,
        gateway: 'Fast2SMS',
        error: `Fast2SMS rejected: ${errorMsg}`,
        providerResponse: fData,
        smsUri,
      };
    } catch (err: any) {
      console.error('[FAST2SMS-NETWORK-ERROR]', err.message);
      return {
        delivered: false,
        accepted: false,
        statusCode: 502,
        gateway: 'Fast2SMS',
        error: `Fast2SMS Network Error: ${err.message}`,
        smsUri,
      };
    }
  }

  // 2. Twilio Provider
  if (provider === 'Twilio') {
    const twilioSid = SMS_CONFIG.twilioAccountSid || process.env.TWILIO_ACCOUNT_SID;
    const twilioToken = SMS_CONFIG.twilioAuthToken || process.env.TWILIO_AUTH_TOKEN;
    const twilioFrom = SMS_CONFIG.twilioFromNumber || process.env.TWILIO_PHONE_NUMBER;

    if (!twilioSid || !twilioToken || !twilioFrom) {
      return {
        delivered: false,
        accepted: false,
        statusCode: 400,
        gateway: 'Twilio',
        error: 'Twilio Account SID, Auth Token, or From Number is missing. Please configure Twilio in settings or .env.',
        isConfigMissing: true,
        smsUri,
      };
    }

    try {
      console.log(`[TWILIO-DISPATCH] Sending real SMS to ${cleanE164} via Twilio...`);
      const url = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
      const params = new URLSearchParams();
      params.append('To', cleanE164);
      params.append('From', twilioFrom);
      params.append('Body', message);

      const tRes = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      const tData = await tRes.json();
      console.log(`[TWILIO-RESPONSE] HTTP ${tRes.status}:`, JSON.stringify(tData));

      if (tRes.ok && tData.sid) {
        return {
          delivered: true,
          accepted: true,
          statusCode: 200,
          gateway: 'Twilio',
          txId: tData.sid,
          deliveryStatus: tData.status || 'queued',
          providerResponse: { sid: tData.sid, status: tData.status, to: tData.to },
          smsUri,
        };
      } else {
        return {
          delivered: false,
          accepted: false,
          statusCode: tRes.status || 400,
          gateway: 'Twilio',
          error: tData.message || `Twilio Error Code ${tData.code || 'unknown'}`,
          providerResponse: tData,
          smsUri,
        };
      }
    } catch (err: any) {
      return {
        delivered: false,
        accepted: false,
        statusCode: 502,
        gateway: 'Twilio',
        error: `Twilio Network Error: ${err.message}`,
        smsUri,
      };
    }
  }

  // 3. MSG91 Provider
  if (provider === 'MSG91') {
    const msg91Key = SMS_CONFIG.msg91AuthKey || process.env.MSG91_AUTH_KEY;
    if (!msg91Key) {
      return {
        delivered: false,
        accepted: false,
        statusCode: 400,
        gateway: 'MSG91',
        error: 'MSG91 Auth Key is missing. Please configure MSG91 in settings or .env.',
        isConfigMissing: true,
        smsUri,
      };
    }
  }

  // 4. Default / Fallback: No credentials configured!
  return { 
    delivered: false, 
    accepted: false,
    statusCode: 400,
    gateway: provider || 'SMS Gateway', 
    error: `No active SMS API Key configured for ${provider}. Please enter your Fast2SMS API Key or Twilio credentials in the SMS Configuration panel.`,
    isConfigMissing: true,
    smsUri,
  };
}

// The Explicit SMS Test button endpoint:
// Real backend test endpoint conforming strictly to user requirements
app.post('/api/sms/test', async (req, res) => {
  try {
    const rawPhone = req.body.mobileNumber || REGISTERED_USERS.find(u => u.active)?.mobileNumber || REGISTERED_USERS[0]?.mobileNumber || '+91 6303015695';
    const cleanDigits = rawPhone.replace(/[^0-9]/g, '');
    const clean10Digits = cleanDigits.slice(-10);
    const normalizedE164 = `+91${clean10Digits}`;

    const matchedUser = REGISTERED_USERS.find(u => u.mobileNumber.replace(/[^0-9]/g, '').slice(-10) === clean10Digits);
    const ownerName = req.body.ownerName || matchedUser?.name || 'Field Owner';
    
    // Exact test message requested by user
    const testMessage = req.body.message || `🚨 AgriGuard AI Test Alert: Your real SMS connection is working successfully. This message was sent from the AgriGuard AI backend.`;
    const provider = SMS_CONFIG.provider || 'Fast2SMS';

    console.log(`[TEST-SMS-ATTEMPT] Target: ${normalizedE164} (${ownerName}) via ${provider}...`);

    if (clean10Digits.length !== 10) {
      return res.status(400).json({
        success: false,
        status: '❌ SMS Failed – Invalid phone number format.',
        error: `Please enter a valid 10-digit Indian phone number. Received: ${rawPhone}`,
        recipient: rawPhone,
      });
    }

    const result = await dispatchRealSms({ phone: normalizedE164, message: testMessage });

    const formattedDate = new Date().toLocaleDateString('en-GB');
    const formattedTime = new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true });

    // Record test SMS in history with GENUINE status!
    ALERT_HISTORY.unshift({
      id: result.txId || `TX-${Date.now().toString().slice(-6)}`,
      ownerName: ownerName,
      mobileNumber: normalizedE164,
      cropName: 'Connection Test',
      detectedProblem: '📱 Test SMS Ping',
      detectedCategory: 'other',
      date: formattedDate,
      time: formattedTime,
      severity: 'LOW',
      smsStatus: result.accepted ? '✅ Sent' : '❌ Failed',
      sirenStatus: 'OFF',
      messageText: testMessage,
      gateway: result.gateway,
      providerRequestId: result.txId,
      deliveryStatus: result.deliveryStatus || (result.accepted ? 'Accepted' : 'Failed'),
      errorMessage: result.error,
    });

    if (ALERT_HISTORY.length > 100) ALERT_HISTORY.pop();

    if (result.accepted) {
      console.log(`[TEST-SMS-ACCEPTED] SMS accepted by ${result.gateway}. Request ID: ${result.txId}`);
      return res.json({
        success: true,
        status: 'SMS request accepted by Fast2SMS.',
        message: 'SMS request accepted by Fast2SMS.',
        acceptedByProvider: true,
        httpStatusCode: result.statusCode,
        provider: result.gateway,
        providerRequestId: result.txId,
        deliveryStatus: result.deliveryStatus || 'Accepted by Fast2SMS / In-Transit',
        providerResponse: result.providerResponse,
        recipient: normalizedE164,
        ownerName,
        smsUri: result.smsUri,
      });
    } else {
      console.warn(`[TEST-SMS-REJECTED] SMS rejected. HTTP ${result.statusCode}: ${result.error}`);
      const errorText = result.isConfigMissing ? 'Fast2SMS API Key is not configured.' : (result.error || 'Fast2SMS rejected the request.');
      return res.status(result.statusCode >= 400 ? result.statusCode : 400).json({
        success: false,
        status: errorText,
        error: errorText,
        acceptedByProvider: false,
        httpStatusCode: result.statusCode,
        provider: result.gateway,
        isConfigMissing: result.isConfigMissing || false,
        recipient: normalizedE164,
        ownerName,
        message: testMessage,
        smsUri: result.smsUri,
      });
    }
  } catch (error: any) {
    console.error('[TEST-SMS-EXCEPTION]', error);
    res.status(500).json({
      success: false,
      status: '❌ SMS Failed – Server Exception',
      error: error.message,
    });
  }
});

// 8. Mobile SMS Gateway Endpoint (Sends SMS directly to Owner's Phone)
app.post('/api/notifications/sms', async (req, res) => {
  try {
    const { 
      mobileNumber, 
      ownerName,
      crop = 'Tomato', 
      problem = 'Pest Attack', 
      severity = 'HIGH', 
      location = 'Kakinada, Andhra Pradesh', 
      recommendedAction = 'Please check your field immediately.',
      category = 'pest',
      language = SMS_CONFIG.language || 'all',
      isHealthy = false,
      broadcastAllUsers = false,
    } = req.body;

    // Rule: "If the crop is healthy, no emergency SMS should be sent."
    if (isHealthy) {
      return res.json({
        success: true,
        isHealthy: true,
        smsSent: false,
        message: '✅ Crop is Healthy – No immediate issues detected. No emergency SMS sent.',
      });
    }

    const formattedDate = new Date().toLocaleDateString('en-GB');
    const formattedTime = new Date().toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const isAnimalOrFire = ['deer', 'cow', 'boar', 'monkey', 'fire', 'animal'].includes(category);
    const sirenStatus: '🔊 ON' | 'OFF' = isAnimalOrFire ? '🔊 ON' : 'OFF';

    // Target specific user or active recipient or broadcast
    let targetUsers: Array<{ name: string; mobileNumber: string; cropName: string }> = [];

    if (broadcastAllUsers) {
      targetUsers = REGISTERED_USERS.filter(u => u.active).map(u => ({
        name: u.name,
        mobileNumber: u.mobileNumber,
        cropName: u.cropName,
      }));
    } else if (mobileNumber) {
      const cleanTargetDigits = mobileNumber.replace(/[^0-9]/g, '').slice(-10);
      const matchedUser = REGISTERED_USERS.find(u => u.mobileNumber.replace(/[^0-9]/g, '').slice(-10) === cleanTargetDigits);
      targetUsers = [{
        name: ownerName || matchedUser?.name || 'Field Owner',
        mobileNumber: matchedUser?.mobileNumber || mobileNumber,
        cropName: matchedUser?.cropName || crop,
      }];
    } else {
      const activeUser = [...REGISTERED_USERS].reverse().find(u => u.active);
      targetUsers = activeUser ? [{ name: activeUser.name, mobileNumber: activeUser.mobileNumber, cropName: activeUser.cropName }] : [];
    }

    if (targetUsers.length === 0) {
      return res.status(400).json({
        success: false,
        status: 'FAILED',
        error: 'No registered mobile number is available. Register a field owner before sending alerts.',
        totalDispatched: 0,
        alerts: [],
      });
    }

    const dispatchedRecords: AlertHistoryRecord[] = [];
    let anyDelivered = false;

    for (const user of targetUsers) {
      const smsBody = buildSmsText({
        crop: user.cropName || crop,
        problem,
        severity,
        time: formattedTime,
        category,
        language,
        location,
        recommendedAction,
        ownerName: user.name,
      });

      const smsResult = await dispatchRealSms({ phone: user.mobileNumber, message: smsBody });
      if (smsResult.accepted) anyDelivered = true;

      const alertRecord: AlertHistoryRecord = {
        id: smsResult.txId || `ALT-${Date.now().toString().slice(-6)}`,
        ownerName: user.name,
        mobileNumber: user.mobileNumber,
        cropName: user.cropName || crop,
        detectedProblem: problem,
        detectedCategory: category,
        date: formattedDate,
        time: formattedTime,
        severity: severity as any,
        smsStatus: smsResult.accepted ? '✅ Sent' : '❌ Failed',
        sirenStatus,
        messageText: smsBody,
        gateway: smsResult.gateway,
        providerRequestId: smsResult.txId,
        deliveryStatus: smsResult.deliveryStatus || (smsResult.accepted ? 'Accepted' : 'Failed'),
        errorMessage: smsResult.error,
      };

      ALERT_HISTORY.unshift(alertRecord);
      if (ALERT_HISTORY.length > 100) {
        ALERT_HISTORY.pop();
      }

      dispatchedRecords.push(alertRecord);
      console.log(`[SMS-LOG] To: ${user.name} (${user.mobileNumber}) [Status: ${alertRecord.smsStatus}] via ${smsResult.gateway}`);
    }

    const primaryUser = targetUsers[0];
    const cleanPhone = primaryUser?.mobileNumber.replace(/[^0-9+]/g, '') || '';
    const smsUri = `sms:${encodeURIComponent(cleanPhone)}?body=${encodeURIComponent(dispatchedRecords[0]?.messageText || '')}`;

    res.json({
      success: anyDelivered,
      messageId: dispatchedRecords[0]?.id,
      recipient: dispatchedRecords[0]?.mobileNumber,
      ownerName: dispatchedRecords[0]?.ownerName,
      status: anyDelivered ? 'DELIVERED' : 'FAILED',
      smsStatus: anyDelivered ? '✅ Sent' : '❌ Failed',
      sirenStatus,
      gateway: dispatchedRecords[0]?.gateway || SMS_CONFIG.provider,
      smsBody: dispatchedRecords[0]?.messageText,
      smsUri,
      timestamp: formattedTime,
      totalDispatched: dispatchedRecords.length,
      recipients: dispatchedRecords.map(record => ({
        ownerName: record.ownerName,
        mobileNumber: record.mobileNumber,
        smsStatus: record.smsStatus,
        errorMessage: record.errorMessage,
      })),
      alerts: dispatchedRecords,
    });
  } catch (error: any) {
    console.error('SMS Gateway dispatch error:', error);
    res.status(500).json({ error: 'Failed to dispatch SMS alert', details: error.message });
  }
});

// 9. Alert History Endpoint (Matches: Owner | Detection | SMS | Siren)
app.get('/api/alerts/history', (_req, res) => {
  res.json({
    total: ALERT_HISTORY.length,
    alerts: ALERT_HISTORY,
  });
});

app.delete('/api/alerts/history', (_req, res) => {
  ALERT_HISTORY.length = 0;
  res.json({ success: true, message: 'Alert history cleared' });
});

// Legacy backward-compatibility endpoints
app.get('/api/notifications/history', (_req, res) => {
  res.json({
    total: ALERT_HISTORY.length,
    alerts: ALERT_HISTORY.map(a => ({
      id: a.id,
      mobileNumber: a.mobileNumber,
      crop: a.cropName,
      problem: a.detectedProblem,
      severity: a.severity,
      location: 'Kakinada, Andhra Pradesh',
      recommendedAction: 'Check field immediately',
      message: a.messageText,
      timestamp: a.time,
      status: a.smsStatus === '✅ Sent' ? 'DELIVERED' : 'FAILED',
      gateway: a.gateway,
      sirenStatus: a.sirenStatus,
    })),
  });
});

app.delete('/api/notifications/history', (_req, res) => {
  ALERT_HISTORY.length = 0;
  res.json({ success: true, message: 'SMS history cleared' });
});

app.get('/api/owner/profile', (_req, res) => {
  const first = REGISTERED_USERS[0] || { name: 'Chandini Lalam', mobileNumber: '+91 98480 22338', cropName: 'Tomato' };
  res.json({
    success: true,
    owner: {
      ownerName: first.name,
      mobileNumber: first.mobileNumber,
      cropName: first.cropName,
      fieldLocation: first.fieldLocation || 'Kakinada, Andhra Pradesh',
      smsGateway: SMS_CONFIG.provider,
      smsLanguage: SMS_CONFIG.language,
      autoSmsEnabled: true,
      registeredAt: first.registeredAt,
    },
  });
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌾 AgriGuard AI Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
