import React, { useState } from 'react';
import { practiceCases, PracticeCase, PracticeOption } from '../data/practiceCases';
import { CATEGORY_NAMES } from '../data/examQuestions';
import { 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  RotateCcw, 
  ArrowRight, 
  Mail, 
  FileText, 
  MessageSquare, 
  Terminal, 
  Table, 
  HelpCircle,
  Lightbulb,
  Scale
} from 'lucide-react';

interface PracticeModeProps {
  onOpenSafetyModal: () => void;
  onGoToExam: () => void;
}

export const PracticeMode: React.FC<PracticeModeProps> = ({ onOpenSafetyModal, onGoToExam }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [caseIndex, setCaseIndex] = useState<number>(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [solvedStats, setSolvedStats] = useState<Record<string, { safe: number; critical: number; partial: number }>>({
    all: { safe: 0, critical: 0, partial: 0 },
  });

  const filteredCases = selectedCategory === 'all'
    ? practiceCases
    : practiceCases.filter(c => c.category === selectedCategory);

  const currentCase: PracticeCase | undefined = filteredCases[caseIndex] || filteredCases[0];

  const handleSelectOption = (idx: number) => {
    if (selectedOptionIndex !== null) return;
    setSelectedOptionIndex(idx);

    const opt = currentCase.options[idx];
    setSolvedStats(prev => {
      const current = prev.all || { safe: 0, critical: 0, partial: 0 };
      return {
        ...prev,
        all: {
          ...current,
          [opt.status]: current[opt.status] + 1,
        }
      };
    });
  };

  const handleNextCase = () => {
    setSelectedOptionIndex(null);
    if (caseIndex + 1 < filteredCases.length) {
      setCaseIndex(caseIndex + 1);
    } else {
      setCaseIndex(0);
    }
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setCaseIndex(0);
    setSelectedOptionIndex(null);
  };

  const handleResetCurrent = () => {
    setSelectedOptionIndex(null);
  };

  const renderScenarioIcon = (type: PracticeCase['scenarioType']) => {
    switch (type) {
      case 'email':
        return <Mail className="w-4 h-4 text-sky-600" />;
      case 'document':
        return <FileText className="w-4 h-4 text-amber-600" />;
      case 'telegram':
        return <MessageSquare className="w-4 h-4 text-blue-600" />;
      case 'terminal':
        return <Terminal className="w-4 h-4 text-emerald-600" />;
      case 'excel':
        return <Table className="w-4 h-4 text-emerald-600" />;
      default:
        return <HelpCircle className="w-4 h-4 text-purple-600" />;
    }
  };

  const selectedOpt: PracticeOption | null = selectedOptionIndex !== null ? currentCase.options[selectedOptionIndex] : null;

  return (
    <div className="space-y-6 py-6 sm:py-8">
      {/* Top Banner & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-[#EF3124] text-xs font-bold mb-1">
            <span>🎯 Тренажер инцидентов «Альфа Фин»</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#191C1F] tracking-tight">
            Практика реальных кейсов
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Отработка сценариев с учетом Закона РБ № 99-З, таможенного декларирования и коммерческой тайны
          </p>
        </div>

        {/* Stats Pill */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white border border-gray-200 self-start sm:self-auto shadow-xs">
          <div className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold flex items-center gap-1.5 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Безопасно: {solvedStats.all.safe}</span>
          </div>
          <div className="px-3 py-1 rounded-xl bg-red-50 text-red-700 text-xs font-bold flex items-center gap-1.5 border border-red-200">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            <span>Риск: {solvedStats.all.critical}</span>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2 pt-1 pb-2 border-b border-gray-200">
        <button
          onClick={() => handleCategoryChange('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            selectedCategory === 'all'
              ? 'bg-[#EF3124] text-white shadow-xs'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          Все кейсы ({practiceCases.length})
        </button>
        {Object.entries(CATEGORY_NAMES).map(([key, name]) => {
          const count = practiceCases.filter(c => c.category === key).length;
          return (
            <button
              key={key}
              onClick={() => handleCategoryChange(key)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === key
                  ? 'bg-[#EF3124] text-white shadow-xs'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {name} ({count})
            </button>
          );
        })}
      </div>

      {/* Main Interactive Case Card */}
      {currentCase && (
        <div className="rounded-3xl bg-white border border-gray-200 shadow-sm overflow-hidden">
          {/* Case Header */}
          <div className="p-4 sm:px-8 sm:py-4 border-b border-gray-100 bg-[#F8F9FA] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-white text-gray-800 text-xs font-bold border border-gray-200 shadow-xs">
                Кейс {caseIndex + 1} из {filteredCases.length}
              </span>
              <span className="text-xs text-[#EF3124] font-bold">
                {CATEGORY_NAMES[currentCase.category]}
              </span>
            </div>

            <button
              onClick={onOpenSafetyModal}
              className="text-xs text-gray-600 hover:text-[#EF3124] flex items-center gap-1 transition-colors font-medium cursor-pointer"
            >
              <Scale className="w-3.5 h-3.5 text-[#EF3124]" />
              <span>Сверить с Законом РБ № 99-З & Светофором</span>
            </button>
          </div>

          <div className="p-5 sm:p-8 space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#191C1F] mb-1">
                {currentCase.title}
              </h2>
            </div>

            {/* Simulated Logistics Context Box */}
            <div className="rounded-2xl border border-gray-200 bg-[#F8F9FA] overflow-hidden">
              <div className="px-4 py-2.5 bg-gray-100/90 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
                  {renderScenarioIcon(currentCase.scenarioType)}
                  <span className="font-bold text-[#191C1F]">{currentCase.contextSnippet.header}</span>
                </div>
                <span className="text-[11px] font-mono text-gray-500 truncate max-w-[200px]">
                  {currentCase.contextSnippet.senderOrDoc}
                </span>
              </div>
              <div className="p-4 sm:p-5 font-mono text-xs sm:text-sm text-gray-800 leading-relaxed bg-white">
                <p className="whitespace-pre-wrap">{currentCase.contextSnippet.previewText}</p>
              </div>
            </div>

            {/* Prompt Question */}
            <div className="p-4 rounded-2xl bg-red-50/60 border border-red-100">
              <div className="flex items-start gap-2.5">
                <HelpCircle className="w-5 h-5 text-[#EF3124] shrink-0 mt-0.5" />
                <p className="text-sm sm:text-base font-bold text-[#191C1F]">
                  {currentCase.promptQuestion}
                </p>
              </div>
            </div>

            {/* 4 Selectable Action Options */}
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Выберите вариант действия сотрудника «Альфа Фин»:
              </div>
              <div className="grid grid-cols-1 gap-3">
                {currentCase.options.map((option, idx) => {
                  const isSelected = selectedOptionIndex === idx;
                  let cardStyle = "bg-white border-gray-200 hover:border-gray-400 hover:bg-gray-50 text-gray-800";

                  if (selectedOptionIndex !== null) {
                    if (isSelected) {
                      if (option.status === 'safe') {
                        cardStyle = "bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/20";
                      } else if (option.status === 'critical') {
                        cardStyle = "bg-red-50 border-red-500 text-red-950 ring-2 ring-red-500/20";
                      } else {
                        cardStyle = "bg-amber-50 border-amber-500 text-amber-950 ring-2 ring-amber-500/20";
                      }
                    } else {
                      cardStyle = "bg-gray-50 border-gray-200 text-gray-400 opacity-60";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      disabled={selectedOptionIndex !== null}
                      className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-3.5 cursor-pointer ${cardStyle}`}
                    >
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                        isSelected 
                          ? option.status === 'safe' 
                            ? 'bg-emerald-600 text-white' 
                            : option.status === 'critical'
                            ? 'bg-red-600 text-white'
                            : 'bg-amber-600 text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <div className="flex-1 text-xs sm:text-sm leading-relaxed font-medium">
                        {option.text}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Immediate Expert Feedback Breakdown */}
            {selectedOpt && (
              <div className={`p-5 sm:p-6 rounded-2xl border transition-all animate-fadeIn ${
                selectedOpt.status === 'safe'
                  ? 'bg-emerald-50 border-emerald-300'
                  : selectedOpt.status === 'critical'
                  ? 'bg-red-50 border-red-300'
                  : 'bg-amber-50 border-amber-300'
              }`}>
                {/* Status Badge */}
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    {selectedOpt.status === 'safe' && (
                      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black border border-emerald-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>СТАТУС: БЕЗОПАСНО (СООТВЕТСТВУЕТ РЕГЛАМЕНТУ АЛЬФА ФИН)</span>
                      </div>
                    )}
                    {selectedOpt.status === 'critical' && (
                      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-black border border-red-300">
                        <ShieldAlert className="w-4 h-4 text-red-600" />
                        <span>СТАТУС: КРИТИЧЕСКИЙ РИСК (НАРУШЕНИЕ ЗАКОНА РБ № 99-З / РЕГЛАМЕНТА)</span>
                      </div>
                    )}
                    {selectedOpt.status === 'partial' && (
                      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black border border-amber-300">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <span>СТАТУС: ЧАСТИЧНАЯ ОШИБКА / РИСК ГАЛЛЮЦИНАЦИЙ</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Explanation */}
                <div className="space-y-3 text-xs sm:text-sm">
                  <div>
                    <span className="font-bold text-[#191C1F] block mb-1">Разбор ситуации службой безопасности «Альфа Фин»:</span>
                    <p className="text-gray-800 leading-relaxed">{selectedOpt.explanation}</p>
                  </div>

                  {selectedOpt.violatedRegulation && (
                    <div className="p-3 rounded-xl bg-white border border-gray-200 text-xs shadow-xs">
                      <span className="font-bold text-red-700">Норма права / Регламент: </span>
                      <span className="text-gray-800">{selectedOpt.violatedRegulation}</span>
                    </div>
                  )}

                  <div className="p-3 rounded-xl bg-white border border-emerald-200 text-xs flex items-start gap-2 shadow-xs">
                    <Lightbulb className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-emerald-800">Как выполнить задачу правильно: </span>
                      <span className="text-gray-800">{selectedOpt.recommendedAction}</span>
                    </div>
                  </div>
                </div>

                {/* Case Action Buttons */}
                <div className="mt-6 pt-4 border-t border-gray-200/80 flex flex-wrap items-center justify-between gap-3">
                  <button
                    onClick={handleResetCurrent}
                    className="px-4 py-2 bg-white hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-bold border border-gray-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Попробовать другой ответ</span>
                  </button>

                  <button
                    onClick={handleNextCase}
                    className="px-5 py-2.5 bg-[#EF3124] hover:bg-[#D42014] text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-sm cursor-pointer"
                  >
                    <span>Следующий кейс</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom CTA to 10 Questions Exam */}
      <div className="p-6 rounded-3xl bg-white border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <h3 className="text-base font-bold text-[#191C1F]">Готовы к официальной аттестации?</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Пройдите официальный экспресс-экзамен из 10 вопросов для получения сертификата «Альфа Фин»
          </p>
        </div>
        <button
          onClick={onGoToExam}
          className="px-5 py-2.5 bg-[#EF3124] hover:bg-[#D42014] text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-sm cursor-pointer self-start sm:self-auto"
        >
          <span>Перейти к экзамену (10 вопросов)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
