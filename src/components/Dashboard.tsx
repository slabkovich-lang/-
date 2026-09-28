import React, { useState } from 'react';
import { 
  Target, 
  Award, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  FileCheck, 
  ArrowRight, 
  Lock, 
  BookOpen, 
  Check, 
  AlertCircle, 
  Scale, 
  Building, 
  FileText,
  HelpCircle
} from 'lucide-react';
import { BELARUS_LAW_INFO, SAFETY_ZONES } from '../data/knowledgeBase';

interface DashboardProps {
  onStartPractice: () => void;
  onStartExam: () => void;
  onOpenSafetyModal: (zone?: 'all' | 'red' | 'yellow' | 'green') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onStartPractice,
  onStartExam,
  onOpenSafetyModal,
}) => {
  const [verifyInput, setVerifyInput] = useState('');
  const [verifyStatus, setVerifyStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = verifyInput.trim();
    if (!clean) return;
    // Format ALFA-AI-YYYY-XXXX-XXXX-(CERT|REV)
    const regex = /^ALFA-AI-\d{4}-[A-F0-9]{4}-[A-F0-9]{4}-(CERT|REV)$/i;
    if (regex.test(clean)) {
      setVerifyStatus('valid');
    } else {
      setVerifyStatus('invalid');
    }
  };

  return (
    <div className="space-y-8 py-6 sm:py-8">
      {/* Hero Section - Alfabank style with clean white card, soft shadows, Alfa Red accents */}
      <div className="relative overflow-hidden rounded-3xl bg-white border border-gray-200/90 p-6 sm:p-10 shadow-sm">
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-500/5 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 right-1/4 w-60 h-60 bg-blue-500/5 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 border border-red-200/80 text-[#EF3124] text-xs font-bold mb-4">
            <span className="w-2 h-2 rounded-full bg-[#EF3124] animate-pulse"></span>
            <span>Корпоративный стандарт ООО «Альфа Фин» & Закон РБ № 99-З</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-[#191C1F] tracking-tight leading-tight sm:leading-tight mb-4">
            Безопасный ИИ в логистике и ВЭД
          </h1>

          <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-8">
            Официальный тренажер и аттестация сотрудников <strong>«Альфа Фин»</strong>.
            Освойте использование искусственного интеллекта в международных перевозках без рисков разглашения коммерческой тайны, утечки персональных данных водителей и клиентов по <strong>Закону Республики Беларусь № 99-З</strong> и штрафов таможни.
          </p>

          <div className="flex flex-wrap gap-3 sm:gap-4">
            <button
              onClick={onStartExam}
              className="px-6 py-3.5 rounded-2xl bg-[#EF3124] hover:bg-[#D42014] text-white font-bold text-sm flex items-center gap-2.5 transition-all shadow-md shadow-[#EF3124]/25 hover:-translate-y-0.5 cursor-pointer"
            >
              <Award className="w-4 h-4 text-white" />
              <span>Сдать экзамен (10 вопросов)</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onStartPractice}
              className="px-6 py-3.5 rounded-2xl bg-[#F5F6F8] hover:bg-gray-200 text-[#191C1F] font-bold text-sm border border-gray-200 flex items-center gap-2.5 transition-all hover:-translate-y-0.5 cursor-pointer"
            >
              <Target className="w-4 h-4 text-[#EF3124]" />
              <span>🎯 Практика кейсов с подсказками</span>
            </button>
          </div>
        </div>

        {/* Stats Grid - Alfabank style light cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-10 pt-8 border-t border-gray-100">
          <div className="p-4 rounded-2xl bg-[#F8F9FA] border border-gray-200/70">
            <div className="text-2xl font-black text-[#EF3124]">10</div>
            <div className="text-xs text-gray-600 font-medium mt-0.5">Вопросов в экзамене</div>
          </div>
          <div className="p-4 rounded-2xl bg-[#F8F9FA] border border-gray-200/70">
            <div className="text-2xl font-black text-emerald-600">85%</div>
            <div className="text-xs text-gray-600 font-medium mt-0.5">Порог сдачи (9 из 10)</div>
          </div>
          <div className="p-4 rounded-2xl bg-[#F8F9FA] border border-gray-200/70">
            <div className="text-2xl font-black text-slate-800">№ 99-З</div>
            <div className="text-xs text-gray-600 font-medium mt-0.5">Закон РБ о защите ПДН</div>
          </div>
          <div className="p-4 rounded-2xl bg-[#F8F9FA] border border-gray-200/70">
            <div className="text-2xl font-black text-purple-600">НЦЗПД</div>
            <div className="text-xs text-gray-600 font-medium mt-0.5">Регуляторные нормы РБ</div>
          </div>
        </div>
      </div>

      {/* SPECIAL SECTION: REPUBLIC OF BELARUS LAW № 99-З SPOTLIGHT */}
      <div className="rounded-3xl bg-white border border-red-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-[#EF3124] shrink-0 font-bold text-xl">
              ⚖️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-[#191C1F]">
                  Закон Республики Беларусь № 99-З «О защите персональных данных»
                </h2>
                <span className="hidden sm:inline-block text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-[#EF3124]">
                  ОБЯЗАТЕЛЬНО К ИСПОЛНЕНИЮ
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Регулятор: <strong>Национальный центр защиты персональных данных Республики Беларусь (НЦЗПД)</strong>
              </p>
            </div>
          </div>

          <button
            onClick={() => onOpenSafetyModal('all')}
            className="px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-[#EF3124] font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer self-start md:self-auto"
          >
            <span>Изучить статьи закона</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-[#F8F9FA] border border-gray-200">
            <div className="text-xs font-bold text-[#EF3124] uppercase tracking-wider mb-1">Статья 9: Трансграничная передача</div>
            <h4 className="text-sm font-bold text-[#191C1F] mb-2">Запрет передачи в США (серверы ИИ)</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Серверы OpenAI, Google, Anthropic находятся в странах без надлежащего уровня защиты прав субъектов ПД. Передача данных белорусских граждан (паспорта, CMR, контакты) туда <strong>строго запрещена</strong> без специального согласия по форме ст. 9 или разрешения НЦЗПД.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F8F9FA] border border-gray-200">
            <div className="text-xs font-bold text-[#EF3124] uppercase tracking-wider mb-1">Статья 4 & 5: Принцип соразмерности</div>
            <h4 className="text-sm font-bold text-[#191C1F] mb-2">Обязательное согласие субъекта</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Согласие клиента или водителя должно быть свободным и информированным. Если в согласии не указано прямое право передачи данных провайдерам ИИ, любая загрузка в чат-боты считается незаконной.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F8F9FA] border border-gray-200">
            <div className="text-xs font-bold text-[#EF3124] uppercase tracking-wider mb-1">Статья 23.7 КоАП & 203-1 УК РБ</div>
            <h4 className="text-sm font-bold text-[#191C1F] mb-2">Штрафы и уголовная ответственность</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Штраф за незаконное распространение или передачу ПД — до 200 базовых величин (на компанию — до 500 БВ). Незаконные действия в отношении информации о частной жизни влекут до 5 лет лишения свободы.
            </p>
          </div>
        </div>
      </div>

      {/* Two Main Tracks (Cards) - Alfabank style */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Track 1: Exam (10 questions) */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-gray-200/90 shadow-xs hover:border-[#EF3124]/40 transition-all flex flex-col justify-between group">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-[#EF3124] mb-5 group-hover:scale-105 transition-transform">
              <Award className="w-6 h-6" />
            </div>
            <div className="inline-block px-2.5 py-1 rounded-md bg-red-50 text-[#EF3124] text-[11px] font-bold uppercase tracking-wider mb-2">
              Официальная аттестация «Альфа Фин»
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#191C1F] mb-3">
              Экзамен (10 вопросов)
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-6">
              Контрольное экспресс-тестирование для подтверждения допуска к использованию ИИ. Показ строго по 1 вопросу, таймер, отсутствие подсказок во время теста, криптографический код верификации и официальный сертификат.
            </p>
            <ul className="space-y-2 mb-6 text-xs text-gray-600">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Ровно 10 ключевых вопросов по всем 5 направлениям</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Проходной балл 85% (минимум 9 правильных ответов)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Генерация официального сертификата и отчета руководителю</span>
              </li>
            </ul>
          </div>
          <button
            onClick={onStartExam}
            className="w-full py-3.5 rounded-xl bg-[#EF3124] hover:bg-[#D42014] text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Зарегистрироваться и начать (10 вопросов)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Track 2: Practice */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-gray-200/90 shadow-xs hover:border-gray-300 transition-all flex flex-col justify-between group">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-700 mb-5 group-hover:scale-105 transition-transform">
              <Target className="w-6 h-6" />
            </div>
            <div className="inline-block px-2.5 py-1 rounded-md bg-gray-100 text-gray-700 text-[11px] font-bold uppercase tracking-wider mb-2">
              Обучающий тренажер
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#191C1F] mb-3">
              Практика кейсов с разбором
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-6">
              Интерактивные сценарии инцидентов: разбор реальных ситуаций в транспортных накладных, запросах кодов ТН ВЭД, ставках морского фрахта и фишинговых дипфейках. Мгновенная развивающая обратная связь без оценок.
            </p>
            <ul className="space-y-2 mb-6 text-xs text-gray-600">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#EF3124]" />
                <span>Цветовые статусы: Безопасно, Критический риск, Частичная ошибка</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#EF3124]" />
                <span>Ссылки на Закон РБ № 99-З и статьи КоАП РБ</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#EF3124]" />
                <span>Рекомендации безопасного обезличивания (десенсибилизации)</span>
              </li>
            </ul>
          </div>
          <button
            onClick={onStartPractice}
            className="w-full py-3.5 rounded-xl bg-[#F5F6F8] hover:bg-gray-200 text-[#191C1F] font-bold text-xs uppercase tracking-wider border border-gray-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Войти в тренажер кейсов</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Traffic Light Quick Reference - Light Theme */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xl font-bold text-[#191C1F] flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#EF3124]"></span>
              <span>Светофор безопасности: регламент «Альфа Фин»</span>
            </h3>
            <p className="text-xs text-gray-500">
              Градация задач по степени допустимости в общедоступных нейросетях
            </p>
          </div>
          <button
            onClick={() => onOpenSafetyModal('all')}
            className="text-xs font-bold text-[#EF3124] hover:text-[#D42014] flex items-center gap-1 cursor-pointer self-start sm:self-auto"
          >
            <span>Открыть полный регламент</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Red Zone */}
          <div
            onClick={() => onOpenSafetyModal('red')}
            className="p-5 rounded-2xl bg-red-50/70 border border-red-200 hover:border-red-400 transition-all cursor-pointer group shadow-xs"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-600" />
                <span className="font-bold text-sm text-red-700">КРАСНАЯ ЗОНА</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-200/80 text-red-800">
                ЗАПРЕЩЕНО
              </span>
            </div>
            <p className="text-xs text-gray-700 mb-3 leading-relaxed">
              ПДН граждан РБ (паспорта, идентификационные номера, CMR), прямые ставки фрахта и маржа «Альфа Фин», проверка санкций через ИИ, автоподача ДТ без декларанта, токены и логи 1С.
            </p>
            <div className="text-[11px] font-bold text-[#EF3124] group-hover:translate-x-1 transition-transform flex items-center gap-1">
              <span>Изучить 5 запретов</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>

          {/* Yellow Zone */}
          <div
            onClick={() => onOpenSafetyModal('yellow')}
            className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 hover:border-amber-400 transition-all cursor-pointer group shadow-xs"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <span className="font-bold text-sm text-amber-800">ЖЕЛТАЯ ЗОНА</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900">
                ОБЕЗЛИЧИВАНИЕ
              </span>
            </div>
            <p className="text-xs text-gray-700 mb-3 leading-relaxed">
              Переписка с иностранными агентами, правовой анализ чартер-партий и расчет демереджа (Free Time), суммаризация открытых отчетов Drewry/SCFI с маскированием реквизитов.
            </p>
            <div className="text-[11px] font-bold text-amber-700 group-hover:translate-x-1 transition-transform flex items-center gap-1">
              <span>Правила десенсибилизации</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>

          {/* Green Zone */}
          <div
            onClick={() => onOpenSafetyModal('green')}
            className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 hover:border-emerald-400 transition-all cursor-pointer group shadow-xs"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span className="font-bold text-sm text-emerald-800">ЗЕЛЕНАЯ ЗОНА</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900">
                СВОБОДНО
              </span>
            </div>
            <p className="text-xs text-gray-700 mb-3 leading-relaxed">
              Сложные формулы Excel (XLOOKUP, макросы), абстрактный брейншторм интермодальных маршрутов, толкование правил Инкотермс 2020 и конвенции CMR на синтетических данных.
            </p>
            <div className="text-[11px] font-bold text-emerald-700 group-hover:translate-x-1 transition-transform flex items-center gap-1">
              <span>Шаблоны безопасных запросов</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        </div>
      </div>

      {/* Verification Tool for Managers - Light Design */}
      <div className="p-6 rounded-3xl bg-white border border-gray-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-2xl bg-red-50 border border-red-200 text-[#EF3124] shrink-0">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-bold text-[#191C1F]">Служба безопасности «Альфа Фин»: Проверка сертификата</h4>
              <p className="text-xs text-gray-500 mt-0.5">
                Введите защитный код из сертификата сотрудника (например: <code className="text-[#EF3124] font-mono font-bold">ALFA-AI-2026-F81A-29BC-CERT</code>) для проверки подлинности аттестации
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleVerify} className="mt-4 flex flex-col sm:flex-row gap-2.5 max-w-2xl">
          <input
            type="text"
            placeholder="ALFA-AI-2026-XXXX-XXXX-CERT"
            value={verifyInput}
            onChange={(e) => {
              setVerifyInput(e.target.value);
              setVerifyStatus('idle');
            }}
            className="flex-1 px-4 py-2.5 bg-[#F8F9FA] border border-gray-200 rounded-xl text-xs sm:text-sm font-mono text-[#191C1F] placeholder-gray-400 focus:outline-none focus:border-[#EF3124]"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-[#191C1F] hover:bg-black text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0"
          >
            Проверить подлинность
          </button>
        </form>

        {verifyStatus === 'valid' && (
          <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Подлинный сертификат:</strong> Сигнатура кода подтверждена. Аттестация выдана системой контроля качества и ИБ ООО «Альфа Фин». Статус: АТТЕСТОВАН.
            </span>
          </div>
        )}

        {verifyStatus === 'invalid' && (
          <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-300 text-xs text-red-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>
              <strong>Недействительный код:</strong> Код не найден в реестре сертификатов «Альфа Фин» либо скомпрометирован. Запросите у сотрудника оригинальный JSON-отчет.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
