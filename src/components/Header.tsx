import React from 'react';
import { Target, Award, TrafficCone, Compass, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  currentTab: 'dashboard' | 'practice' | 'exam';
  onSelectTab: (tab: 'dashboard' | 'practice' | 'exam') => void;
  onOpenSafetyModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onOpenSafetyModal,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Branding - Alfa Bank style */}
          <div
            onClick={() => onSelectTab('dashboard')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#EF3124] flex items-center justify-center shadow-md shadow-[#EF3124]/20 group-hover:scale-105 transition-transform text-white font-black text-xl tracking-tighter">
              А
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-[#191C1F] group-hover:text-[#EF3124] transition-colors">
                  АЛЬФА ФИН
                </span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-red-50 text-[#EF3124] border border-red-200">
                  БЕЗОПАСНЫЙ ИИ
                </span>
              </div>
              <p className="text-xs text-gray-500 hidden sm:block">
                Логистика, ВЭД & Закон РБ № 99-З о защите персональных данных
              </p>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            <nav className="flex items-center bg-[#F5F6F8] p-1 rounded-2xl border border-gray-200">
              <button
                onClick={() => onSelectTab('dashboard')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  currentTab === 'dashboard'
                    ? 'bg-white text-[#191C1F] shadow-xs font-bold'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Обзор</span>
              </button>

              <button
                onClick={() => onSelectTab('practice')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  currentTab === 'practice'
                    ? 'bg-white text-[#EF3124] shadow-xs font-bold'
                    : 'text-gray-600 hover:text-[#EF3124]'
                }`}
              >
                <Target className="w-3.5 h-3.5" />
                <span>Практика</span>
              </button>

              <button
                onClick={() => onSelectTab('exam')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  currentTab === 'exam'
                    ? 'bg-[#EF3124] text-white shadow-sm font-bold'
                    : 'text-gray-600 hover:text-[#EF3124]'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>Экзамен (10)</span>
              </button>
            </nav>

            {/* Safety Reference Button */}
            <button
              onClick={onOpenSafetyModal}
              className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-[#EF3124] border border-red-200 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
              title="Открыть Справочник и Закон РБ № 99-З"
            >
              <TrafficCone className="w-4 h-4 text-[#EF3124]" />
              <span className="hidden md:inline">Светофор & Закон № 99-З</span>
              <span className="md:hidden text-[11px]">Регламент</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
