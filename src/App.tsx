import React, { useState } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { PracticeMode } from './components/PracticeMode';
import { ExamMode } from './components/ExamMode';
import { SafetyModal } from './components/SafetyModal';
import { ShieldCheck, Scale, ExternalLink } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'practice' | 'exam'>('dashboard');
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState(false);
  const [initialSafetyZone, setInitialSafetyZone] = useState<'all' | 'red' | 'yellow' | 'green'>('all');

  const handleOpenSafetyModal = (zone: 'all' | 'red' | 'yellow' | 'green' = 'all') => {
    setInitialSafetyZone(zone);
    setIsSafetyModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F5F6F8] text-[#191C1F] flex flex-col font-sans selection:bg-[#EF3124]/15 selection:text-[#EF3124]">
      {/* Header Navigation */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenSafetyModal={() => handleOpenSafetyModal('all')}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        {currentTab === 'dashboard' && (
          <Dashboard
            onStartPractice={() => setCurrentTab('practice')}
            onStartExam={() => setCurrentTab('exam')}
            onOpenSafetyModal={handleOpenSafetyModal}
          />
        )}

        {currentTab === 'practice' && (
          <PracticeMode
            onOpenSafetyModal={() => handleOpenSafetyModal('all')}
            onGoToExam={() => setCurrentTab('exam')}
          />
        )}

        {currentTab === 'exam' && (
          <ExamMode
            onBackToDashboard={() => setCurrentTab('dashboard')}
            onOpenSafetyModal={() => handleOpenSafetyModal('all')}
          />
        )}
      </main>

      {/* Footer - Light Alfabank style */}
      <footer className="mt-auto border-t border-gray-200 bg-white py-6 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-md bg-[#EF3124] text-white font-black flex items-center justify-center text-[10px]">
              А
            </span>
            <span className="font-semibold text-gray-700">ООО «Альфа Фин»</span>
            <span>•</span>
            <span>Безопасный ИИ в логистике и ВЭД</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => handleOpenSafetyModal('all')}
              className="text-gray-600 hover:text-[#EF3124] transition-colors cursor-pointer font-medium"
            >
              Светофор безопасности & Закон РБ № 99-З
            </button>
            <span>•</span>
            <span>НЦЗПД Республики Беларусь</span>
            <span>•</span>
            <span>Регламент ИБ v2.6</span>
          </div>
        </div>
      </footer>

      {/* Safety Reference Modal */}
      <SafetyModal
        isOpen={isSafetyModalOpen}
        onClose={() => setIsSafetyModalOpen(false)}
        initialZone={initialSafetyZone}
      />
    </div>
  );
}
