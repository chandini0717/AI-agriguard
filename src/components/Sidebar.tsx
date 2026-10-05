import React from 'react';
import {
  LayoutDashboard,
  Sprout,
  Video,
  Camera,
  Smartphone,
  Bug,
  Bot,
  Layers,
  CloudSun,
  Calendar,
  AlertTriangle,
  MapPin,
  Bell,
  FileText,
  BookOpen,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { LanguageCode } from '../types';
import { TRANSLATIONS } from '../utils/translations';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  currentLanguage: LanguageCode;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  cropCount: number;
  alertCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  currentLanguage,
  isCollapsed,
  onToggleCollapse,
  cropCount,
  alertCount
}) => {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;

  const navItems = [
    { id: 'dashboard', label: t.navHome, icon: LayoutDashboard },
    { id: 'live-camera', label: t.navLiveCameraScan, icon: Camera, isHighlight: true },
    { id: 'mobile-sms', label: t.navMobileAlerts, icon: Smartphone, isHighlight: true, badge: 'SMS', badgeColor: 'bg-cyan-500' },
    { id: 'my-crops', label: t.navMyCrops, icon: Sprout, badge: cropCount },
    { id: 'future-calendar', label: t.navFutureCalendar, icon: Calendar },
    { id: 'crop-problems', label: t.navCropProblems, icon: AlertTriangle },
    { id: 'temperature', label: t.navTemperatureWeather, icon: CloudSun },
    { id: 'soil-analysis', label: t.navSoilTesting, icon: Layers },
    { id: 'video-surveillance', label: t.navVideoAnimals, icon: Video },
    { id: 'pest-detection', label: t.navPestDetection, icon: Bug },
    { id: 'rag-advisory', label: t.navRagAdvisory, icon: Bot },
    { id: 'farm-location', label: t.navFarmLocation, icon: MapPin },
    { id: 'alerts', label: t.navAlerts, icon: Bell, badge: alertCount, badgeColor: 'bg-red-500' },
    { id: 'reports', label: t.navReports, icon: FileText },
    { id: 'knowledge', label: t.navKnowledge, icon: BookOpen },
  ];

  return (
    <aside 
      className={`relative z-30 flex-shrink-0 transition-all duration-300 ease-in-out border-r border-emerald-800/40 bg-emerald-950/80 backdrop-blur-xl ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="flex flex-col h-full py-4 px-3">
        {/* Toggle Collapse Button */}
        <button
          onClick={onToggleCollapse}
          className="absolute -right-3 top-6 w-6 h-6 rounded-full bg-emerald-700 hover:bg-emerald-600 text-white flex items-center justify-center shadow-md border border-emerald-500/50 transition z-40"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>

        {/* Navigation list */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto pr-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 group relative ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg shadow-emerald-900/50'
                    : 'text-emerald-200/80 hover:bg-emerald-900/60 hover:text-white'
                } ${item.isHighlight && !isActive ? 'border border-emerald-500/30 bg-emerald-900/20' : ''}`}
                title={item.label}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-white' : item.isHighlight ? 'text-emerald-400' : 'text-emerald-300/80'
                }`} />

                {!isCollapsed && (
                  <span className="truncate flex-1 text-left">
                    {item.label}
                  </span>
                )}

                {!isCollapsed && item.badge !== undefined && (typeof item.badge === 'number' ? item.badge > 0 : Boolean(item.badge)) && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono text-white ${
                    item.badgeColor || 'bg-emerald-700'
                  }`}>
                    {item.badge}
                  </span>
                )}

                {/* Collapsed tooltip badge */}
                {isCollapsed && item.badge !== undefined && (typeof item.badge === 'number' ? item.badge > 0 : Boolean(item.badge)) && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-400"></span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Farmer Support Card in Sidebar */}
        {!isCollapsed && (
          <div className="mt-4 p-3.5 rounded-2xl bg-emerald-900/40 border border-emerald-700/40 text-xs text-emerald-200">
            <div className="font-bold text-emerald-100 flex items-center gap-1.5">
              <span>🌾 AgriGuard Advisory</span>
            </div>
            <p className="mt-1 text-[11px] text-emerald-300/70 leading-relaxed">
              Powered by deep vision + RAG agronomy knowledge base.
            </p>
          </div>
        )}
      </div>
    </aside>
  );
};
