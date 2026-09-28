import React, { useState } from 'react';
import { SAFETY_ZONES, SafetyZone, BELARUS_LAW_INFO } from '../data/knowledgeBase';
import { ShieldAlert, AlertTriangle, CheckCircle2, X, Search, FileText, Scale, BookOpen, Building } from 'lucide-react';

interface SafetyModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialZone?: 'all' | 'red' | 'yellow' | 'green';
}

export const SafetyModal: React.FC<SafetyModalProps> = ({ isOpen, onClose, initialZone = 'all' }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'red' | 'yellow' | 'green' | 'belarus-law'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredZones = SAFETY_ZONES.map(zone => {
    if (activeTab !== 'all' && zone.id !== activeTab) return null;
    const filteredRules = zone.rules.filter(rule => {
      const q = searchQuery.toLowerCase();
      return (
        rule.title.toLowerCase().includes(q) ||
        rule.description.toLowerCase().includes(q) ||
        (rule.consequences && rule.consequences.toLowerCase().includes(q)) ||
        (rule.requirement && rule.requirement.toLowerCase().includes(q)) ||
        (rule.belarusLawRef && rule.belarusLawRef.toLowerCase().includes(q)) ||
        rule.examples.some(ex => ex.toLowerCase().includes(q))
      );
    });
    return filteredRules.length > 0 ? { ...zone, rules: filteredRules } : null;
  }).filter(Boolean) as SafetyZone[];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/40 backdrop-blur-xs overflow-y-auto no-print">
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-white border border-gray-200 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header - Alfabank style */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-[#EF3124]">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-[#191C1F] tracking-tight">Регламент ИБ и Закон РБ № 99-З</h2>
              <p className="text-xs text-gray-500">Корпоративный стандарт ООО «Альфа Фин» по работе с генеративным искусственным интеллектом</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-black rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
            title="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar & Tabs */}
        <div className="p-3 sm:px-6 bg-[#F8F9FA] border-b border-gray-200 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="flex flex-wrap gap-1 p-1 bg-white rounded-2xl border border-gray-200 shadow-xs">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'all' ? 'bg-[#191C1F] text-white shadow-xs' : 'text-gray-600 hover:text-black'
              }`}
            >
              Все разделы
            </button>
            <button
              onClick={() => setActiveTab('belarus-law')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'belarus-law' ? 'bg-[#EF3124] text-white shadow-xs' : 'text-gray-600 hover:text-[#EF3124]'
              }`}
            >
              <span>🇧🇾 Закон № 99-З (НЦЗПД)</span>
            </button>
            <button
              onClick={() => setActiveTab('red')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'red' ? 'bg-red-600 text-white shadow-xs' : 'text-gray-600 hover:text-red-600'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-red-500"></span> Красная зона
            </button>
            <button
              onClick={() => setActiveTab('yellow')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'yellow' ? 'bg-amber-600 text-white shadow-xs' : 'text-gray-600 hover:text-amber-600'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500"></span> Желтая зона
            </button>
            <button
              onClick={() => setActiveTab('green')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'green' ? 'bg-emerald-600 text-white shadow-xs' : 'text-gray-600 hover:text-emerald-600'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Зеленая зона
            </button>
          </div>

          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск по нормам и правилам..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs text-[#191C1F] placeholder-gray-400 focus:outline-none focus:border-[#EF3124]"
            />
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Dedicated Tab: Belarus Law 99-Z & NCZPD */}
          {(activeTab === 'all' || activeTab === 'belarus-law') && (
            <div className="p-5 sm:p-6 rounded-3xl bg-red-50/70 border border-red-200 space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🇧🇾</span>
                <div>
                  <h3 className="text-base font-black text-[#191C1F]">
                    {BELARUS_LAW_INFO.lawTitle}
                  </h3>
                  <p className="text-xs text-red-700 font-semibold mt-0.5">
                    Уполномоченный орган: {BELARUS_LAW_INFO.regulator} • Оператор: {BELARUS_LAW_INFO.operator}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {BELARUS_LAW_INFO.keyArticles.map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-white border border-red-100 shadow-xs space-y-1">
                    <div className="text-xs font-black text-[#EF3124]">{item.article}</div>
                    <p className="text-xs text-gray-700 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Zones */}
          {activeTab !== 'belarus-law' && filteredZones.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-40 text-gray-400" />
              <p className="text-base font-bold text-gray-700">Ничего не найдено</p>
              <p className="text-xs text-gray-400 mt-1">Попробуйте изменить поисковый запрос</p>
            </div>
          ) : (
            activeTab !== 'belarus-law' && filteredZones.map(zone => (
              <div key={zone.id} className="space-y-3">
                <div className={`p-4 rounded-2xl border ${zone.borderClass} ${zone.bgClass}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                    <h3 className="text-base font-black text-[#191C1F] flex items-center gap-2">
                      {zone.id === 'red' && <ShieldAlert className="w-5 h-5 text-red-600" />}
                      {zone.id === 'yellow' && <AlertTriangle className="w-5 h-5 text-amber-600" />}
                      {zone.id === 'green' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                      {zone.name}
                    </h3>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${zone.badgeClass}`}>
                      {zone.tagline}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {zone.rules.map(rule => (
                    <div
                      key={rule.id}
                      className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xs hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="text-sm font-bold text-[#191C1F] flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${
                            zone.id === 'red' ? 'bg-red-500' : zone.id === 'yellow' ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}></span>
                          {rule.title}
                        </h4>
                      </div>

                      <p className="text-xs text-gray-700 leading-relaxed mb-3">
                        {rule.description}
                      </p>

                      {rule.belarusLawRef && (
                        <div className="mb-2.5 p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800">
                          <span className="font-bold">Правовая база Республики Беларусь: </span>
                          {rule.belarusLawRef}
                        </div>
                      )}

                      {rule.consequences && (
                        <div className="mb-2.5 p-2.5 rounded-xl bg-red-50/60 border border-red-100 text-xs text-red-700">
                          <span className="font-bold">Ответственность: </span>
                          {rule.consequences}
                        </div>
                      )}

                      {rule.requirement && (
                        <div className="mb-2.5 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                          <span className="font-bold">Требование регламента «Альфа Фин»: </span>
                          {rule.requirement}
                        </div>
                      )}

                      <div className="space-y-1 pt-1">
                        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Примеры ситуаций:</span>
                        <ul className="space-y-1">
                          {rule.examples.map((example, idx) => (
                            <li key={idx} className="text-xs text-gray-600 flex items-start gap-2">
                              <span className="text-[#EF3124] font-bold">•</span>
                              <span>{example}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-100 bg-[#F8F9FA] flex items-center justify-between">
          <div className="text-xs text-gray-500">
            ООО «Альфа Фин» • Регламент информационной безопасности & Закон РБ № 99-З
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#EF3124] hover:bg-[#D42014] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Понятно, закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
