import React, { useState } from 'react';
import { 
  MapPin, 
  Navigation, 
  Compass, 
  Crosshair, 
  ShieldAlert, 
  ExternalLink,
  CheckCircle2
} from 'lucide-react';
import { LanguageCode } from '../types';
import { TRANSLATIONS } from '../utils/translations';

interface FarmLocationCardProps {
  isGpsLive: boolean;
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  locationName: string;
  onRequestGps: () => void;
  currentLanguage: LanguageCode;
}

export const FarmLocationCard: React.FC<FarmLocationCardProps> = ({
  isGpsLive,
  latitude,
  longitude,
  accuracy,
  locationName,
  onRequestGps,
  currentLanguage,
}) => {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;

  return (
    <div className="rounded-3xl bg-emerald-950/70 border border-emerald-800/80 p-5 shadow-xl text-white flex flex-col justify-between">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-emerald-800/70">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base tracking-tight flex items-center gap-2">
              {t.navFarmLocation}
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                isGpsLive 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                {isGpsLive ? 'Live Browser GPS' : 'Demo Coordinates'}
              </span>
            </h3>
            <p className="text-[11px] text-emerald-300/70">
              Geo-fencing and field boundary telemetry
            </p>
          </div>
        </div>

        <button
          onClick={onRequestGps}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-xs font-bold text-white shadow transition"
          title="Detect live GPS coordinates via browser geolocation"
        >
          <Crosshair className="w-3.5 h-3.5 text-emerald-300" />
          <span>{isGpsLive ? 'Update GPS' : 'Request GPS'}</span>
        </button>
      </div>

      {/* Main Coordinate Display */}
      <div className="my-3.5 grid grid-cols-2 gap-2 text-xs">
        <div className="p-3 rounded-2xl bg-emerald-900/40 border border-emerald-800/60">
          <span className="text-[11px] text-emerald-400 font-semibold block">Latitude (N)</span>
          <div className="text-base font-black text-white font-mono mt-0.5">
            {latitude !== null ? latitude.toFixed(6) : 'Unavailable'}
          </div>
          <span className="text-[10px] text-emerald-300">Degree Decimal</span>
        </div>

        <div className="p-3 rounded-2xl bg-emerald-900/40 border border-emerald-800/60">
          <span className="text-[11px] text-emerald-400 font-semibold block">Longitude (E)</span>
          <div className="text-base font-black text-white font-mono mt-0.5">
            {longitude !== null ? longitude.toFixed(6) : 'Unavailable'}
          </div>
          <span className="text-[10px] text-emerald-300">Degree Decimal</span>
        </div>
      </div>

      {/* Visual Satellite Map Mock with Geo-Grid */}
      <div className="relative h-32 rounded-2xl overflow-hidden border border-emerald-700/80 bg-emerald-950 flex items-center justify-center shadow-inner">
        {/* Farm Field Satellite Canvas Pattern */}
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-950/20 to-transparent"></div>
        
        {/* Geo Center Pin & Radar Waves */}
        <div className="relative flex flex-col items-center">
          <div className="relative flex items-center justify-center">
            <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-emerald-400 opacity-60"></span>
            <div className="relative w-8 h-8 rounded-full bg-emerald-500 text-emerald-950 flex items-center justify-center shadow-lg font-black text-xs">
              🌾
            </div>
          </div>
          <span className="mt-1 text-[11px] font-bold text-white bg-emerald-900/90 px-2.5 py-0.5 rounded-full border border-emerald-600 shadow">
            {locationName}
          </span>
        </div>

        <div className="absolute bottom-2 left-2 text-[10px] text-emerald-400/80 font-mono">
          {accuracy ? `Accuracy: ±${Math.round(accuracy)}m` : 'Precision: Standard GNSS'}
        </div>
      </div>

      {/* Disclaimer on live location */}
      {!isGpsLive && (
        <div className="mt-3 p-2 rounded-xl bg-amber-950/30 border border-amber-800/50 text-[10px] text-amber-300 flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          <span>Location permission required for live farm coordinates. Showing demo farm benchmark.</span>
        </div>
      )}

    </div>
  );
};
