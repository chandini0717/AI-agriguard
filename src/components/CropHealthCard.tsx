import React from 'react';
import { 
  Sprout, 
  ArrowRight, 
  ShieldCheck, 
  AlertTriangle, 
  Radio,
  CheckCircle2
} from 'lucide-react';
import { CropItem, LanguageCode } from '../types';
import { TRANSLATIONS } from '../utils/translations';

interface CropHealthCardProps {
  crops: CropItem[];
  onOpenCrop: (crop: CropItem) => void;
  currentLanguage: LanguageCode;
}

export const CropHealthCard: React.FC<CropHealthCardProps> = ({
  crops,
  onOpenCrop,
  currentLanguage,
}) => {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Healthy':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" /> Healthy
          </span>
        );
      case 'Monitoring':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-blue-400 bg-blue-500/20 px-2 py-0.5 rounded-full border border-blue-500/30">
            <Radio className="w-3 h-3 animate-pulse" /> Good / Monitoring
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
            <AlertTriangle className="w-3 h-3" /> Needs Attention
          </span>
        );
    }
  };

  return (
    <div className="rounded-3xl bg-emerald-950/70 border border-emerald-800/80 p-5 shadow-xl text-white flex flex-col justify-between">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-emerald-800/70">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Sprout className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base tracking-tight text-white">
              🌿 {t.cropHealth}
            </h3>
            <p className="text-[11px] text-emerald-300/70">
              Aggregated agronomic vitality index across all fields
            </p>
          </div>
        </div>
        <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-emerald-900 text-emerald-300">
          {crops.length} Planted Crops
        </span>
      </div>

      {/* Crop Health Rows */}
      <div className="my-3 space-y-2 max-h-56 overflow-y-auto pr-1">
        {crops.map(crop => (
          <div
            key={crop.id}
            onClick={() => onOpenCrop(crop)}
            className="p-3 rounded-2xl bg-emerald-900/40 hover:bg-emerald-800/70 border border-emerald-800/60 hover:border-emerald-600 transition flex items-center justify-between cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl p-1 rounded-xl bg-emerald-950/60 border border-emerald-800">
                {crop.emoji}
              </span>
              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition">
                  {crop.name}
                  {currentLanguage === 'te' && crop.teluguName && (
                    <span className="text-xs font-normal text-emerald-400 ml-1">({crop.teluguName})</span>
                  )}
                </h4>
                <p className="text-[11px] text-emerald-300/80">
                  {crop.fieldName} • Soil: {crop.soilCondition}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {getStatusBadge(crop.status)}
              <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>

      <div className="text-[11px] text-emerald-300/80 pt-2 border-t border-emerald-800/60 flex items-center justify-between">
        <span>Click any crop to inspect live leaf symptoms and spray schedule.</span>
      </div>

    </div>
  );
};
