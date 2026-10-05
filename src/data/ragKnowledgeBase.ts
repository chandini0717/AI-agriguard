export interface KnowledgeDoc {
  id: string;
  crop: string;
  topic: string;
  title: string;
  keywords: string[];
  content: string;
  source: string;
  similarity?: number;
}

export const RAG_KNOWLEDGE_DOCS: KnowledgeDoc[] = [
  {
    id: 'RAG-TOM-01',
    crop: 'Tomato',
    topic: 'Disease - Late Blight',
    title: 'Tomato Late Blight (Phytophthora infestans) Identification & Management',
    keywords: ['tomato', 'late blight', 'phytophthora', 'water soaked', 'leaf blight', 'humidity', 'spores'],
    content: 'Tomato Late Blight is caused by Phytophthora infestans. Symptoms: Rapidly expanding, irregular water-soaked pale-green to brown lesions on leaves and stems, often with white fungal sporulation on the leaf undersides in high humidity (>80%) and cool-moderate temperatures (18-24°C). Fruits develop firm, greasy brown lesions. Management: Destroy infected residues, avoid overhead watering, ensure row spacing for air circulation. Immediate chemical control: Apply preventive protective fungicides like Mancozeb 75% WP (2 g/L) or Copper Oxychloride 50% WP (2.5 g/L). For active outbreaks, systemic fungicides like Metalaxyl + Mancozeb (Ridomil Gold) or Cymoxanil are recommended. Disclaimer: Consult a certified agricultural extension officer before chemical spray.',
    source: 'ICAR-IIHR Vegetable Pathology Manual (Doc #VP-2024-T1)'
  },
  {
    id: 'RAG-TOM-02',
    crop: 'Tomato',
    topic: 'Pest - Fruit Borer',
    title: 'Tomato Fruit Borer (Helicoverpa armigera) Integrated Control',
    keywords: ['fruit borer', 'tomato', 'helicoverpa', 'caterpillar', 'bore hole', 'larva'],
    content: 'Tomato Fruit Borer (Helicoverpa armigera) is a devastating polyphagous pest. The young larva scrapes foliage while grown larvae bore circular, clean holes into the fruits, thrusting their anterior half inside while leaving frass outside. Symptoms: Bored fruit rotting due to secondary fungal/bacterial infection. Preventive: Install yellow and pheromone traps (12 traps/ha) for monitoring male moths. Plant African Marigold as a trap crop (1 row marigold for every 16 rows of tomato). Biological: Spray Bacillus thuringiensis (Bt) @ 2 g/L or Helicoverpa NPV (250 LE/ha) at egg hatch. Chemical: Spinosad 45 SC @ 0.3 ml/L, Indoxacarb 14.5 SC @ 1 ml/L or Chlorantraniliprole 18.5 SC @ 0.3 ml/L during morning hours.',
    source: 'TNAU Agritech Portal - Tomato Pest Management Guidelines (Doc #PM-TOM-04)'
  },
  {
    id: 'RAG-TOM-03',
    crop: 'Tomato',
    topic: 'Disease - Early Blight',
    title: 'Tomato Early Blight (Alternaria solani) Target Spot Control',
    keywords: ['early blight', 'tomato', 'target board', 'concentric rings', 'alternaria', 'yellow halo'],
    content: 'Early blight caused by Alternaria solani produces characteristic dark brown circular spots with concentric target-board rings on older foliage, surrounded by a distinct chlorotic (yellow) halo. Severe infection causes extensive defoliation, sunscald on fruits, and collar rot. Risk factors: High temperature (24-30°C) with intermittent rain and heavy dew. Treatment: Remove bottom 30 cm of leaves touching soil. Spray Chlorothalonil @ 2 g/L or Azoxystrobin 23 SC @ 1 ml/L. Practice 3-year crop rotation with non-solanaceous crops.',
    source: 'National Horticultural Board Plant Health Compendium'
  },
  {
    id: 'RAG-CHI-01',
    crop: 'Chilli',
    topic: 'Pest - Thrips & Murda Disease',
    title: 'Chilli Thrips (Scirtothrips dorsalis) & Mite Complex Management',
    keywords: ['chilli', 'thrips', 'leaf curl', 'murda disease', 'upward curling', 'scirtothrips'],
    content: 'Chilli Thrips (Scirtothrips dorsalis) lacerate tender leaves and suck plant sap. Upward curling of leaves into boat shapes, brittle leaves, and brownish streaks on the underside indicate thrips infestation. Downward curling indicates yellow mite (Polyphagotarsonemus latus). Integrated Management: Install 20 blue sticky traps/ha for thrips and yellow traps for whiteflies. Spray Neem oil (10,000 ppm) @ 2 ml/L as repellent. Chemical: Fipronil 5 SC @ 1.5 ml/L, Diafenthiuron 50 WP @ 1.2 g/L, or Spinetoram 11.7 SC @ 0.9 ml/L. Avoid excessive nitrogenous fertilizer application which attracts sucking pests.',
    source: 'Dr. YSR Horticultural University Advisory Bull. 2025'
  },
  {
    id: 'RAG-CHI-02',
    crop: 'Chilli',
    topic: 'Disease - Anthracnose & Dieback',
    title: 'Chilli Fruit Rot & Anthracnose (Colletotrichum capsici)',
    keywords: ['anthracnose', 'dieback', 'chilli', 'fruit rot', 'sunken circular spot', 'concentric rings fruit'],
    content: 'Anthracnose causes circular sunken dark spots on ripe red chilli fruits with concentric rings of salmon-pink acervuli. Dieback causes drying of twigs from top downwards. Risk is high during cloudy weather and intermittent rains at 28-30°C. Management: Seed treatment with Trichoderma viride @ 4 g/kg seed. Spray Copper Oxychloride @ 3 g/L or Difenoconazole 25 EC @ 1 ml/L at flowering and fruit set.',
    source: 'ICAR-CPRI Disease Diagnostic Manual'
  },
  {
    id: 'RAG-RICE-01',
    crop: 'Rice',
    topic: 'Pest - Yellow Stem Borer',
    title: 'Rice Yellow Stem Borer (Scirpophaga incertulas) Deadheart Prevention',
    keywords: ['rice', 'paddy', 'stem borer', 'dead heart', 'white ear', 'scirpophaga'],
    content: 'The yellow stem borer larva bores into the central tiller shoot. In vegetative stage, it causes "dead heart" (central leaf whorl dries and can be pulled out easily). In reproductive stage, it causes "white ear" (empty white panicles without grain). Management: Clipping seedling tips before transplanting to eliminate egg masses. Release Trichogramma japonicum egg parasitoids @ 100,000/ha. Apply Chlorantraniliprole 0.4% GR granules in soil @ 10 kg/ha or spray Cartap Hydrochloride 50 SP @ 2 g/L when ETL exceeds 1 egg mass/m².',
    source: 'ICAR-National Rice Research Institute (NRRI) Cuttack'
  },
  {
    id: 'RAG-RICE-02',
    crop: 'Rice',
    topic: 'Disease - Rice Blast',
    title: 'Rice Blast (Magnaporthe oryzae) Symptoms & Spray Schedule',
    keywords: ['rice', 'blast', 'spindle shaped lesion', 'leaf blast', 'neck blast', 'pyricularia'],
    content: 'Rice blast infects leaves, nodes, and panicle neck. Symptoms: Eye-shaped or spindle-shaped lesions with grayish center and brown margin on leaves; rotting of panicle neck ("neck blast") resulting in severe yield loss. High nitrogen, overcast humid days (>90% RH) accelerate disease. Management: Avoid excess urea; split into 3-4 top dressings. Seed treatment with Tricyclazole 75 WP @ 2 g/kg. Spray Tricyclazole 75 WP @ 0.6 g/L or Isoprothiolane 40 EC @ 1.5 ml/L at first appearance.',
    source: 'International Rice Research Institute (IRRI) Diagnostic Sheet'
  },
  {
    id: 'RAG-MAIZE-01',
    crop: 'Maize',
    topic: 'Pest - Fall Armyworm (FAW)',
    title: 'Maize Fall Armyworm (Spodoptera frugiperda) IPM Strategy',
    keywords: ['fall armyworm', 'maize', 'corn', 'spodoptera', 'window pane', 'sawdust frass', 'whorl'],
    content: 'Fall Armyworm (FAW) is an invasive voracious caterpillar that feeds inside the maize whorl. Early stages cause pinholes and "window-paning" on leaves. Grown larvae feed deep in the whorl leaving extensive ragged holes and abundant moist sawdust-like frass. Key identification: Inverted Y-shape on caterpillar head and four dots in square pattern on 8th abdominal segment. Management: Deep summer ploughing, apply neem cake in soil. Push dry sand + wood ash (9:1) or Metarhizium anisopliae (5 g/L) into whorls. Chemical: Chlorantraniliprole 18.5 SC @ 0.4 ml/L or Emamectin Benzoate 5 SG @ 0.4 g/L directed into the central whorls using knapsack sprayer without nozzle filter.',
    source: 'CIMMYT Maize Pest Protocol & ICAR-IIMR Ludhiana'
  },
  {
    id: 'RAG-GRAPE-01',
    crop: 'Grape',
    topic: 'Disease - Downy Mildew',
    title: 'Grape Downy Mildew (Plasmopara viticola) Canopy Protection',
    keywords: ['grape', 'downy mildew', 'oil spots', 'white downy growth', 'plasmopara', 'leaf drop'],
    content: 'Grape Downy Mildew caused by Plasmopara viticola is the most destructive disease in vineyard regions during rainy/humid periods. Symptoms: Yellowish oily translucent spots ("oil spots") on the upper leaf surface, followed by white cottony downy fungal growth on the underside. Young shoots, tendrils, and blossom clusters curl, turn brown and wither. Management: Maintain proper vine canopy pruning for sunshine penetration. Spray Bordeaux mixture (1%) or Copper Hydroxide (2 g/L) as protectant. Systemic: Dimethomorph 50 WP @ 1 g/L or Metalaxyl-M @ 2.5 g/L applied within 24-48 hours of infection rain.',
    source: 'ICAR-National Research Centre for Grapes, Pune'
  },
  {
    id: 'RAG-SOIL-01',
    crop: 'General',
    topic: 'Soil - Nutrient Deficiency Diagnostic',
    title: 'Soil Nutrient Deficiencies & Correction in Field Crops',
    keywords: ['soil', 'nitrogen', 'phosphorus', 'potassium', 'npk', 'deficiency', 'chlorosis', 'stunted'],
    content: 'Nitrogen deficiency causes general yellowing (chlorosis) beginning on older lower leaves while upper leaves remain pale green. Phosphorus deficiency manifests as stunted growth with purplish or reddish discoloration on leaves and stems due to anthocyanin accumulation. Potassium deficiency causes marginal leaf scorch, curling, and necrosis along leaf tips and edges. Healthy soil pH range for most vegetables is 6.0 to 7.0. Regular addition of well-decomposed Farm Yard Manure (FYM @ 10-15 tons/ha) improves cation exchange capacity and moisture retention.',
    source: 'Indian Institute of Soil Science (IISS) Bhopal Technical Guide'
  },
  {
    id: 'RAG-ANIMAL-01',
    crop: 'General',
    topic: 'Animal Deterrence',
    title: 'Wildlife & Animal Intrusion Mitigation Protocols',
    keywords: ['monkey', 'wild boar', 'deer', 'elephant', 'cattle', 'animal intrusion', 'deterrent', 'protection'],
    content: 'Wild animals like monkeys, wild boars, and stray cattle cause catastrophic crop trampling and grazing. Non-lethal sustainable deterrence methods: 1. Bio-acoustic sonic repellents (alarm distress calls and high-frequency sounders). 2. Solar perimeter electric fencing (pulsed non-lethal shock). 3. Castor/chilli kerosene rope barriers: Soaking coir ropes in a mixture of used engine oil, castor oil, and crushed pungent chilli extracts hung around field borders repels wild boars and deer through olfactory irritation. 4. Motion-sensor automated strobe lights and acoustic sirens activate upon intruder detection to safeguard fields at night without harming wildlife.',
    source: 'Wildlife-Agriculture Conflict Mitigation Guide, Agroforestry Board'
  }
];

export function retrieveRelevantDocuments(query: string, cropFilter?: string, topK: number = 3): KnowledgeDoc[] {
  const normQuery = query.toLowerCase();
  const tokens = normQuery.split(/\s+/).filter(t => t.length > 2);

  const scored = RAG_KNOWLEDGE_DOCS.map(doc => {
    let score = 0;
    if (cropFilter && doc.crop.toLowerCase() === cropFilter.toLowerCase()) {
      score += 15;
    } else if (normQuery.includes(doc.crop.toLowerCase())) {
      score += 10;
    }

    doc.keywords.forEach(kw => {
      if (normQuery.includes(kw.toLowerCase())) score += 8;
      tokens.forEach(tok => {
        if (kw.toLowerCase().includes(tok)) score += 3;
      });
    });

    tokens.forEach(tok => {
      if (doc.title.toLowerCase().includes(tok)) score += 5;
      const count = (doc.content.toLowerCase().match(new RegExp(tok, 'g')) || []).length;
      score += Math.min(count * 1.5, 6);
    });

    return { ...doc, similarity: Math.min(Math.round((score / 35) * 100), 98) };
  });

  return scored
    .filter(d => (d.similarity ?? 0) > 15)
    .sort((a, b) => (b.similarity ?? 0) - (a.similarity ?? 0))
    .slice(0, topK);
}
