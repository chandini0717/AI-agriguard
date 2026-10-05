import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  PlusCircle, 
  Sprout, 
  Info, 
  Layers, 
  Thermometer, 
  Bug,
  Check
} from 'lucide-react';
import { CROPS_DATABASE, CropDefinition } from '../data/cropsDatabase';
import { CropItem, LanguageCode } from '../types';
import { TRANSLATIONS } from '../utils/translations';

interface CropEncyclopediaViewProps {
  currentLanguage: LanguageCode;
  onAddCrop: (crop: CropItem) => void;
  myCropNames: string[];
}

export const CropEncyclopediaView: React.FC<CropEncyclopediaViewProps> = ({
  currentLanguage,
  onAddCrop,
  myCropNames,
}) => {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');

  const filtered = CROPS_DATABASE.filter(c => {
    const term = searchTerm.toLowerCase();
    const matchTerm =
      term === '' ||
      c.name.toLowerCase().includes(term) ||
      c.teluguName.includes(term) ||
      c.hindiName.includes(term) ||
      c.scientificName.toLowerCase().includes(term);

    const matchCat = selectedCat === 'All' || c.category === selectedCat;
    return matchTerm && matchCat;
  });

  const handleQuickAdd = (crop: CropDefinition) => {
    const newCrop: CropItem = {
      id: `${crop.id}-${Date.now()}`,
      name: crop.name,
      teluguName: crop.teluguName,
      hindiName: crop.hindiName,
      scientificName: crop.scientificName,
      category: crop.category,
      emoji: crop.emoji,
      image: crop.image,
      fieldName: `${crop.name} Sector ${Math.floor(Math.random() * 4) + 1}`,
      status: 'Monitoring',
      lastDetection: 'No Recent Pest',
      temperature: 28,
      humidity: 72,
      soilMoisture: 65,
      soilPh: 6.5,
      soilCondition: 'Good',
      connectedSensors: 3,
      activeCamera: true,
      supportedPests: crop.supportedPests,
      commonDiseases: crop.commonDiseases,
      addedAt: new Date().toLocaleDateString(),
    };
    onAddCrop(newCrop);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-emerald-950 border border-emerald-800 shadow-2xl text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {t.navKnowledge}
            </h2>
            <p className="text-xs text-emerald-300/80">
              Agronomic profiles, soil chemistry, and pest defense guidelines for 35+ supported crops
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-emerald-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search any crop..."
              className="pl-9 pr-3 py-2 rounded-xl bg-emerald-900/60 border border-emerald-700 text-xs text-white placeholder-emerald-400/60 focus:outline-none focus:ring-1 focus:ring-emerald-400"
            />
          </div>
        </div>
      </div>

      {/* Grid of Encyclopedia cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(crop => {
          const isAdded = myCropNames.includes(crop.name);
          return (
            <div
              key={crop.id}
              className="rounded-3xl bg-emerald-950/70 border border-emerald-800/80 overflow-hidden shadow-xl flex flex-col justify-between"
            >
              <div className="relative h-44 w-full bg-emerald-900">
                <img src={crop.image} alt={crop.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-950/30 to-transparent"></div>
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="text-2xl p-1 rounded-xl bg-emerald-950/80 border border-emerald-700/60">
                    {crop.emoji}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-900/80 text-emerald-300 border border-emerald-700">
                    {crop.category}
                  </span>
                </div>
                <div className="absolute bottom-2.5 left-3 right-3">
                  <h3 className="text-base font-extrabold text-white flex items-center gap-1.5">
                    {crop.name}
                    <span className="text-xs font-normal text-emerald-300 font-mono">
                      ({crop.teluguName})
                    </span>
                  </h3>
                  <span className="text-[10px] text-emerald-400/80 italic font-mono">
                    {crop.scientificName}
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-2.5 text-xs flex-1 flex flex-col justify-between">
                <div className="space-y-1.5 text-[11px] text-emerald-200">
                  <div className="p-2 rounded-xl bg-emerald-900/30 border border-emerald-800">
                    <span className="font-bold text-emerald-400 block">Soil & pH:</span>
                    <span>{crop.idealSoil} (pH {crop.idealPh})</span>
                  </div>
                  <div className="p-2 rounded-xl bg-emerald-900/30 border border-emerald-800">
                    <span className="font-bold text-yellow-400 block">Target Pests & Diseases:</span>
                    <span className="truncate block">{crop.supportedPests.slice(0, 3).join(', ')}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleQuickAdd(crop)}
                  disabled={isAdded}
                  className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer ${
                    isAdded
                      ? 'bg-emerald-900/60 text-emerald-400 border border-emerald-700'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Already in My Crops</span>
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>{t.addToMyCrops}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
