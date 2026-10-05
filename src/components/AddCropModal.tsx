import React, { useState, useMemo } from 'react';
import { 
  X, 
  Search, 
  PlusCircle, 
  Check, 
  Camera, 
  Cpu, 
  MapPin, 
  Sprout, 
  Sparkles,
  Layers
} from 'lucide-react';
import { CropCategory, CropItem, LanguageCode } from '../types';
import { CROPS_DATABASE, CropDefinition } from '../data/cropsDatabase';
import { TRANSLATIONS } from '../utils/translations';

interface AddCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCrop: (crop: CropItem) => void;
  currentLanguage: LanguageCode;
}

export const AddCropModal: React.FC<AddCropModalProps> = ({
  isOpen,
  onClose,
  onAddCrop,
  currentLanguage,
}) => {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedCrop, setSelectedCrop] = useState<CropDefinition | null>(CROPS_DATABASE[0]);
  const [fieldName, setFieldName] = useState('Block A - Main Field');
  const [optionalLocation, setOptionalLocation] = useState('17.3850° N, 78.4867° E');
  const [optionalCamera, setOptionalCamera] = useState('CAM-01 (PTZ Agro)');
  const [sensorCount, setSensorCount] = useState(3);
  const [imageError, setImageError] = useState(false);

  // Filter crops based on search query (case-insensitive) and category
  const filteredCrops = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return CROPS_DATABASE.filter(crop => {
      const matchesSearch =
        term === '' ||
        crop.name.toLowerCase().includes(term) ||
        crop.teluguName.toLowerCase().includes(term) ||
        crop.hindiName.toLowerCase().includes(term) ||
        crop.scientificName.toLowerCase().includes(term) ||
        crop.category.toLowerCase().includes(term);

      const matchesCategory =
        selectedCategory === 'All' ||
        crop.category.toLowerCase() === selectedCategory.toLowerCase() ||
        (selectedCategory === 'Cereals' && crop.category === 'Cereals') ||
        (selectedCategory === 'Vegetables' && crop.category === 'Vegetables') ||
        (selectedCategory === 'Commercial' && crop.category === 'Commercial') ||
        (selectedCategory === 'Fruits' && crop.category === 'Fruits');

      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  const handleSelectCrop = (crop: CropDefinition) => {
    setSelectedCrop(crop);
    setImageError(false);
    // suggest appropriate field name based on crop
    setFieldName(`${crop.name} Sector ${Math.floor(Math.random() * 5) + 1}`);
  };

  const handleConfirmAdd = () => {
    if (!selectedCrop) return;

    const newCrop: CropItem = {
      id: `${selectedCrop.id}-${Date.now()}`,
      name: selectedCrop.name,
      teluguName: selectedCrop.teluguName,
      hindiName: selectedCrop.hindiName,
      scientificName: selectedCrop.scientificName,
      category: selectedCrop.category,
      emoji: selectedCrop.emoji,
      image: selectedCrop.image,
      fieldName: fieldName.trim() || `${selectedCrop.name} Field`,
      status: 'Monitoring',
      lastDetection: 'No Recent Pest (Clean Scan)',
      temperature: 28,
      humidity: 72,
      soilMoisture: 68,
      soilPh: 6.5,
      soilCondition: 'Good',
      connectedSensors: sensorCount,
      activeCamera: true,
      supportedPests: selectedCrop.supportedPests,
      commonDiseases: selectedCrop.commonDiseases,
      addedAt: new Date().toLocaleDateString(),
    };

    onAddCrop(newCrop);
    onClose();
  };

  if (!isOpen) return null;

  const categories = [
    { id: 'All', label: t.all },
    { id: 'Cereals', label: t.cereals },
    { id: 'Vegetables', label: t.vegetables },
    { id: 'Commercial', label: t.commercialCrops },
    { id: 'Fruits', label: t.fruits },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-emerald-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col bg-emerald-950 border border-emerald-700/80 rounded-3xl shadow-2xl text-white">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-emerald-800 bg-emerald-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                {t.addNewCrop}
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-normal">
                  Universal Agricultural Selector
                </span>
              </h2>
              <p className="text-xs text-emerald-300/80">
                Search and select any vegetable, fruit, cereal, or cash crop to activate live monitoring.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-emerald-400 hover:text-white hover:bg-emerald-800/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Left Column: Search & Crop Grid (7 cols) */}
          <div className="md:col-span-7 flex flex-col gap-4">
            
            {/* Search Box */}
            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-emerald-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-emerald-900/60 border border-emerald-700/80 text-white placeholder-emerald-400/60 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
                autoFocus
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-3 text-xs text-emerald-400 hover:text-white px-2 py-0.5 rounded-md bg-emerald-800"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                    selectedCategory === cat.id
                      ? 'bg-emerald-500 text-emerald-950 shadow-md'
                      : 'bg-emerald-900/60 text-emerald-200 hover:bg-emerald-800/80 border border-emerald-800'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Crop Grid List */}
            <div className="flex-1 min-h-[300px] max-h-[380px] overflow-y-auto pr-1 space-y-2">
              {filteredCrops.length === 0 ? (
                <div className="p-8 text-center bg-emerald-900/20 rounded-2xl border border-dashed border-emerald-800 text-emerald-300">
                  <p className="font-semibold text-sm">No exact agricultural crop matched "{searchTerm}"</p>
                  <p className="text-xs text-emerald-400/70 mt-1">
                    Try typing "Tomato", "Grape", "Banana", "Rice", "Cotton", or browse categories above.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {filteredCrops.map(crop => {
                    const isSelected = selectedCrop?.id === crop.id;
                    return (
                      <div
                        key={crop.id}
                        onClick={() => handleSelectCrop(crop)}
                        className={`relative p-2.5 rounded-2xl border cursor-pointer transition flex flex-col items-center text-center group ${
                          isSelected
                            ? 'bg-emerald-800/90 border-emerald-400 ring-2 ring-emerald-400/50 shadow-lg'
                            : 'bg-emerald-900/40 border-emerald-800/80 hover:bg-emerald-900/80 hover:border-emerald-600'
                        }`}
                      >
                        <div className="w-12 h-12 rounded-xl overflow-hidden mb-2 relative bg-emerald-950 flex items-center justify-center">
                          <img
                            src={crop.image}
                            alt={crop.name}
                            onError={(e) => {
                              // If image fails, show emoji fallback
                              (e.currentTarget as HTMLElement).style.display = 'none';
                            }}
                            className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                          />
                          <span className="text-2xl absolute">{crop.emoji}</span>
                        </div>

                        <div className="text-xs font-bold text-white truncate w-full">
                          {crop.name}
                        </div>
                        <div className="text-[10px] text-emerald-300/80 truncate w-full">
                          {crop.teluguName}
                        </div>
                        <span className="mt-1 text-[9px] px-1.5 py-0.5 rounded-md bg-emerald-950/60 text-emerald-400 font-mono">
                          {crop.category}
                        </span>

                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-emerald-400 text-emerald-950 flex items-center justify-center shadow">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Automatic Preview & Field Config (5 cols) */}
          <div className="md:col-span-5 flex flex-col gap-4 bg-emerald-900/30 p-4 rounded-3xl border border-emerald-800/80">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              {t.preview}
            </h3>

            {selectedCrop ? (
              <div className="flex flex-col gap-3">
                {/* Selected Crop Image Box */}
                <div className="relative w-full h-44 rounded-2xl overflow-hidden bg-emerald-950 border border-emerald-700/80 shadow-inner group">
                  {!imageError ? (
                    <img
                      src={selectedCrop.image}
                      alt={selectedCrop.name}
                      onError={() => setImageError(true)}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-emerald-400 bg-emerald-950">
                      <span className="text-4xl mb-1">{selectedCrop.emoji}</span>
                      <span className="text-xs font-medium">Image unavailable</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-transparent to-transparent"></div>
                  
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <div>
                      <div className="text-lg font-extrabold text-white flex items-center gap-1.5">
                        <span>{selectedCrop.emoji}</span>
                        <span>{selectedCrop.name}</span>
                      </div>
                      <div className="text-xs text-emerald-300 font-medium">
                        {selectedCrop.teluguName} • {selectedCrop.scientificName}
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-xl bg-emerald-500 text-emerald-950 text-xs font-bold">
                      {selectedCrop.category}
                    </span>
                  </div>
                </div>

                {/* Crop Agronomic Requirements Preview */}
                <div className="grid grid-cols-2 gap-2 text-[11px] text-emerald-200">
                  <div className="p-2 rounded-xl bg-emerald-900/60 border border-emerald-800">
                    <span className="text-emerald-400 font-bold block">Ideal Soil pH</span>
                    <span>{selectedCrop.idealPh}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-emerald-900/60 border border-emerald-800">
                    <span className="text-emerald-400 font-bold block">Ideal Temp</span>
                    <span>{selectedCrop.idealTemp}</span>
                  </div>
                </div>

                {/* Field Setup Form */}
                <div className="space-y-2.5 pt-2 border-t border-emerald-800">
                  <div>
                    <label className="text-xs font-semibold text-emerald-200 block mb-1">
                      {t.fieldName}
                    </label>
                    <input
                      type="text"
                      value={fieldName}
                      onChange={(e) => setFieldName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-emerald-950 border border-emerald-700 text-white text-xs focus:ring-1 focus:ring-emerald-400 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-emerald-300 block mb-1 flex items-center gap-1">
                        <Camera className="w-3 h-3" /> Camera Feed
                      </label>
                      <input
                        type="text"
                        value={optionalCamera}
                        onChange={(e) => setOptionalCamera(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-emerald-950 border border-emerald-700 text-[11px] text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-emerald-300 block mb-1 flex items-center gap-1">
                        <Cpu className="w-3 h-3" /> Sensors
                      </label>
                      <select
                        value={sensorCount}
                        onChange={(e) => setSensorCount(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-emerald-950 border border-emerald-700 text-[11px] text-white"
                      >
                        <option value={1}>1 Sensor (Moisture)</option>
                        <option value={3}>3 Sensors (NPK + Temp)</option>
                        <option value={5}>5 Sensors (Full IoT Node)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Add Button */}
                <button
                  onClick={handleConfirmAdd}
                  className="mt-2 w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-emerald-950 font-extrabold text-sm shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2 active:scale-98 transition cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4 stroke-[2.5]" />
                  <span>{t.addToMyCrops}</span>
                </button>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-emerald-400/80 p-6">
                <Sprout className="w-10 h-10 mb-2 opacity-50" />
                <p className="text-xs">Select any crop from the list to preview and configure.</p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
