import React from 'react';
import { 
  Thermometer, 
  Droplets, 
  Layers, 
  Trash2, 
  ArrowRight, 
  Bug, 
  ShieldCheck, 
  AlertTriangle,
  Radio
} from 'lucide-react';
import { CropItem, LanguageCode } from '../types';
import { TRANSLATIONS } from '../utils/translations';

interface CropCardProps {
  crop: CropItem;
  onOpenCrop: (crop: CropItem) => void;
  onRemoveCrop: (cropId: string) => void;
  currentLanguage: LanguageCode;
}

export const CropCard: React.FC<CropCardProps> = ({
  crop,
  onOpenCrop,
  onRemoveCrop,
  currentLanguage,
}) => {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;

  const getStatusBadge = () => {
    switch (crop.status) {
      case 'Healthy':
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            {t.healthy}
          </span>
        );
      case 'Monitoring':
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/40">
            <Radio className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
            {t.monitoring}
          </span>
        );
      case 'Needs Attention':
      case 'High Risk':
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            {t.needsAttention}
          </span>
        );
    }
  };

  return (
    <div className="relative group flex flex-col justify-between rounded-3xl bg-emerald-950/70 border border-emerald-800/80 hover:border-emerald-600 transition-all duration-300 shadow-xl overflow-hidden hover:shadow-2xl hover:shadow-emerald-950/60">
      
      {/* Top Banner Image with gradient */}
      <div className="relative h-40 w-full overflow-hidden bg-emerald-900">
        <img
          src={crop.image}
          alt={crop.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.currentTarget as HTMLElement).style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-950/40 to-transparent"></div>

        {/* Emoji & Category Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="text-2xl p-1.5 rounded-xl bg-emerald-950/80 backdrop-blur-md shadow border border-emerald-700/60">
            {crop.emoji}
          </span>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-900/80 text-emerald-300 backdrop-blur-md border border-emerald-700/50">
            {crop.category}
          </span>
        </div>

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          {getStatusBadge()}
        </div>

        {/* Crop Name & Vernacular Name */}
        <div className="absolute bottom-2.5 left-3 right-3">
          <h3 className="text-lg font-extrabold text-white tracking-tight flex items-center gap-2 truncate">
            {crop.name}
            {currentLanguage === 'te' && crop.teluguName && (
              <span className="text-xs font-normal text-emerald-300">({crop.teluguName})</span>
            )}
          </h3>
          <p className="text-[11px] text-emerald-300/80 truncate font-mono">
            {crop.fieldName}
          </p>
        </div>
      </div>

      {/* Card Details Body */}
      <div className="p-4 flex-1 flex flex-col justify-between gap-3 text-xs">
        
        {/* Pest Status row */}
        <div className="p-2.5 rounded-xl bg-emerald-900/40 border border-emerald-800/80 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-emerald-300">
            <Bug className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold">{t.pestStatus}:</span>
          </div>
          <span className="font-medium text-emerald-100 truncate max-w-[140px] text-right">
            {crop.lastDetection || t.noRecentPest}
          </span>
        </div>

        {/* Micro-metrics Grid: Soil, Temp, Humidity */}
        <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
          <div className="p-2 rounded-xl bg-emerald-900/30 border border-emerald-800/60">
            <div className="text-emerald-400 flex items-center justify-center gap-1 mb-0.5">
              <Layers className="w-3 h-3" />
              <span>{t.soil}</span>
            </div>
            <span className="font-bold text-white">{crop.soilCondition}</span>
          </div>

          <div className="p-2 rounded-xl bg-emerald-900/30 border border-emerald-800/60">
            <div className="text-amber-400 flex items-center justify-center gap-1 mb-0.5">
              <Thermometer className="w-3 h-3" />
              <span>Temp</span>
            </div>
            <span className="font-bold text-white">{crop.temperature}°C</span>
          </div>

          <div className="p-2 rounded-xl bg-emerald-900/30 border border-emerald-800/60">
            <div className="text-cyan-400 flex items-center justify-center gap-1 mb-0.5">
              <Droplets className="w-3 h-3" />
              <span>Humidity</span>
            </div>
            <span className="font-bold text-white">{crop.humidity}%</span>
          </div>
        </div>

        {/* Buttons: OPEN CROP & REMOVE */}
        <div className="flex items-center gap-2 pt-2 border-t border-emerald-800/60">
          <button
            onClick={() => onOpenCrop(crop)}
            className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/40 transition active:scale-95 cursor-pointer"
          >
            <span>{t.openCrop}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onRemoveCrop(crop.id)}
            className="p-2.5 rounded-xl bg-emerald-900/40 hover:bg-red-950/60 text-emerald-400 hover:text-red-300 border border-emerald-800/80 hover:border-red-700/60 transition active:scale-95 cursor-pointer"
            title={t.remove}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
};
