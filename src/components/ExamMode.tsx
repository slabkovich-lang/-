import React, { useState, useEffect, useRef } from 'react';
import { 
  examQuestions, 
  ExamQuestion, 
  CATEGORY_NAMES 
} from '../data/examQuestions';
import { 
  ExamResultData, 
  generateVerificationCode, 
  generateReportText, 
  generateReportJson, 
  formatTime 
} from '../utils/verification';
import { 
  Award, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Copy, 
  Printer, 
  Send, 
  FileJson, 
  FileText, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  RotateCcw, 
  ChevronDown, 
  ChevronUp, 
  Building 
} from 'lucide-react';

interface ExamModeProps {
  onBackToDashboard: () => void;
  onOpenSafetyModal: () => void;
}

const DEPARTMENTS = [
  'Логистика и международное экспедирование',
  'Таможенное оформление и декларирование (ВЭД)',
  'Клиентский сервис и продажи «Альфа Фин»',
  'Бухгалтерия и финансовый мониторинг',
  'Служба безопасности и комплаенс-контроль',
];

export const ExamMode: React.FC<ExamModeProps> = ({ onBackToDashboard, onOpenSafetyModal }) => {
  // Step state: 'register' | 'test' | 'result'
  const [step, setStep] = useState<'register' | 'test' | 'result'>('register');

  // Registration Form
  const [candidateName, setCandidateName] = useState('');
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [email, setEmail] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [formError, setFormError] = useState('');

  // Exam Progress
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timerSeconds, setTimerSeconds] = useState(0);
  const timerRef = useRef<any>(null);

  // Result State
  const [resultData, setResultData] = useState<ExamResultData | null>(null);
  const [reportFormat, setReportFormat] = useState<'text' | 'json'>('text');
  const [copiedReport, setCopiedReport] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showDetailedReview, setShowDetailedReview] = useState(false);

  // Webhook integration
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookStatus, setWebhookStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [webhookMessage, setWebhookMessage] = useState('');

  // Timer effect during test
  useEffect(() => {
    if (step === 'test') {
      timerRef.current = setInterval(() => {
        setTimerSeconds(s => s + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [step]);

  const handleStartExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateName.trim()) {
      setFormError('Пожалуйста, укажите имя и фамилию сотрудника');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setFormError('Укажите корректный корпоративный E-mail');
      return;
    }
    if (!agreedTerms) {
      setFormError('Подтвердите ознакомление с Законом РБ № 99-З и регламентом «Альфа Фин»');
      return;
    }

    setFormError('');
    setAnswers({});
    setCurrentQIndex(0);
    setTimerSeconds(0);
    setStep('test');
  };

  const handleSelectAnswer = (qId: number, optionIdx: number) => {
    setAnswers(prev => ({
      ...prev,
      [qId]: optionIdx,
    }));
  };

  const handleNextQuestion = () => {
    if (currentQIndex + 1 < examQuestions.length) {
      setCurrentQIndex(currentQIndex + 1);
    } else {
      finishExam();
    }
  };

  const handlePrevQuestion = () => {
    if (currentQIndex > 0) {
      setCurrentQIndex(currentQIndex - 1);
    }
  };

  const finishExam = () => {
    if (timerRef.current) clearInterval(timerRef.current);

    let score = 0;
    const categoryStats: Record<string, { total: number; correct: number; percent: number }> = {};

    Object.values(CATEGORY_NAMES).forEach(catName => {
      categoryStats[catName] = { total: 0, correct: 0, percent: 0 };
    });

    const detailedAnswers = examQuestions.map(q => {
      const selected = answers[q.id] !== undefined ? answers[q.id] : -1;
      const isCorrect = selected === q.correct;
      if (isCorrect) score++;

      const catName = CATEGORY_NAMES[q.category];
      if (categoryStats[catName]) {
        categoryStats[catName].total += 1;
        if (isCorrect) categoryStats[catName].correct += 1;
      }

      return {
        questionId: q.id,
        selected,
        correct: q.correct,
        isCorrect,
      };
    });

    // Compute category percentages
    Object.keys(categoryStats).forEach(key => {
      const cat = categoryStats[key];
      cat.percent = cat.total > 0 ? Math.round((cat.correct / cat.total) * 100) : 0;
    });

    const totalQuestions = examQuestions.length; // 10 questions
    const percentage = Math.round((score / totalQuestions) * 100);
    const isPassed = percentage >= 85; // 9/10 (90%) passes, 8/10 (80%) fails

    const partialData: Omit<ExamResultData, 'verificationCode'> = {
      candidateName: candidateName.trim(),
      department,
      email: email.trim(),
      score,
      totalQuestions,
      percentage,
      isPassed,
      timestamp: new Date().toISOString(),
      elapsedSeconds: timerSeconds,
      categoryStats,
      userAnswers: detailedAnswers,
    };

    const verificationCode = generateVerificationCode(partialData);
    const fullResult: ExamResultData = {
      ...partialData,
      verificationCode,
    };

    setResultData(fullResult);
    setStep('result');
  };

  const handleCopyReport = () => {
    if (!resultData) return;
    const content = reportFormat === 'text' 
      ? generateReportText(resultData) 
      : generateReportJson(resultData);

    navigator.clipboard.writeText(content);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2500);
  };

  const handleCopyCode = () => {
    if (!resultData?.verificationCode) return;
    navigator.clipboard.writeText(resultData.verificationCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSendWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!webhookUrl.trim() || !resultData) return;

    setWebhookStatus('sending');
    setWebhookMessage('');

    try {
      const payload = {
        company: 'ООО «Альфа Фин»',
        candidateName: resultData.candidateName,
        department: resultData.department,
        email: resultData.email,
        score: resultData.score,
        total: resultData.totalQuestions,
        percentage: resultData.percentage,
        verdict: resultData.isPassed ? 'PASSED' : 'FAILED',
        verificationCode: resultData.verificationCode,
        elapsedSeconds: resultData.elapsedSeconds,
        timestamp: resultData.timestamp,
        categories: resultData.categoryStats,
      };

      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        mode: 'no-cors'
      });

      setWebhookStatus('success');
      setWebhookMessage('Результат успешно передан в Google Таблицу / корпоративный сервис «Альфа Фин»!');
    } catch (err: any) {
      setWebhookStatus('error');
      setWebhookMessage(`Ошибка при отправке: ${err.message || 'Сетевая ошибка'}`);
    }
  };

  const currentQ: ExamQuestion | undefined = examQuestions[currentQIndex];
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="py-6 sm:py-8 space-y-6">
      {/* ================= STEP 1: REGISTRATION ================= */}
      {step === 'register' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-[#EF3124] shadow-xs">
              <Award className="w-7 h-7" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#191C1F] tracking-tight">
              Экзамен: Безопасный ИИ в «Альфа Фин»
            </h1>
            <p className="text-xs sm:text-sm text-gray-500">
              Официальная корпоративная аттестация по кибербезопасности, ВЭД и Закону РБ № 99-З
            </p>
          </div>

          {/* Exam Rules Info Box */}
          <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-[#191C1F] uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#EF3124]" />
              <span>Регламент и условия аттестации</span>
            </h3>
            <ul className="space-y-2 text-xs text-gray-600">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#EF3124] mt-1.5"></span>
                <span>В тесте ровно <strong>10 вопросов</strong>, охватывающих все ключевые зоны рисков.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5"></span>
                <span>Проходной порог аттестации: <strong>85% (минимум 9 из 10 правильных ответов)</strong>.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5"></span>
                <span>Особое внимание уделено <strong>Закону РБ № 99-З</strong> (запрет трансграничной передачи ПДН на серверы в США).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-1.5"></span>
                <span>По итогам генерируется официальный <strong>Сертификат «Альфа Фин» с криптографическим кодом верификации</strong>.</span>
              </li>
            </ul>
          </div>

          {/* Form */}
          <form onSubmit={handleStartExam} className="p-6 sm:p-8 rounded-3xl bg-white border border-gray-200 shadow-sm space-y-5">
            <h2 className="text-lg font-bold text-[#191C1F] mb-4">Данные аттестуемого сотрудника</h2>

            {formError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Имя и Фамилия <span className="text-[#EF3124]">*</span>
              </label>
              <input
                type="text"
                placeholder="Сергей Лабкович"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#F8F9FA] border border-gray-200 rounded-xl text-sm text-[#191C1F] placeholder-gray-400 focus:outline-none focus:border-[#EF3124]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Подразделение в ООО «Альфа Фин» <span className="text-[#EF3124]">*</span>
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#F8F9FA] border border-gray-200 rounded-xl text-sm text-[#191C1F] focus:outline-none focus:border-[#EF3124]"
              >
                {DEPARTMENTS.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Корпоративный E-mail <span className="text-[#EF3124]">*</span>
              </label>
              <input
                type="email"
                placeholder="s.labkovich@alfafin.by"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#F8F9FA] border border-gray-200 rounded-xl text-sm text-[#191C1F] placeholder-gray-400 focus:outline-none focus:border-[#EF3124]"
                required
              />
            </div>

            <div className="pt-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-gray-300 text-[#EF3124] focus:ring-[#EF3124] cursor-pointer"
                />
                <span className="text-xs text-gray-600 leading-relaxed">
                  Я подтверждаю, что ознакомлен(а) с положениями <strong>Закона РБ № 99-З «О защите персональных данных»</strong> и Регламентом ИБ ООО «Альфа Фин», и обязуюсь проходить тестирование самостоятельно.
                </span>
              </label>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={onBackToDashboard}
                className="px-5 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Вернуться
              </button>
              <button
                type="submit"
                className="flex-1 py-3 rounded-xl bg-[#EF3124] hover:bg-[#D42014] text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Начать экзамен (10 вопросов)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= STEP 2: TEST IN PROGRESS (10 QUESTIONS) ================= */}
      {step === 'test' && currentQ && (
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Top Bar */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-gray-200 flex flex-wrap items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3">
              <span className="text-xs font-black text-[#EF3124] bg-red-50 px-3 py-1.5 rounded-xl border border-red-200">
                Вопрос {currentQIndex + 1} из {examQuestions.length}
              </span>
              <span className="text-xs font-bold text-gray-700">
                {CATEGORY_NAMES[currentQ.category]}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-gray-700 bg-gray-100 px-3 py-1.5 rounded-xl border border-gray-200">
                <Clock className="w-3.5 h-3.5 text-[#EF3124]" />
                <span>{formatTime(timerSeconds)}</span>
              </div>
              <div className="text-xs text-gray-500">
                Отвечено: <strong className="text-[#191C1F]">{answeredCount}</strong>/{examQuestions.length}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#EF3124] transition-all duration-300"
              style={{ width: `${((currentQIndex + 1) / examQuestions.length) * 100}%` }}
            ></div>
          </div>

          {/* Question Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-gray-200 shadow-sm space-y-6">
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Вопрос #{currentQIndex + 1}
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-[#191C1F] leading-relaxed">
                {currentQ.q}
              </h2>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {currentQ.options.map((option, idx) => {
                const isSelected = answers[currentQ.id] === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectAnswer(currentQ.id, idx)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-3.5 cursor-pointer ${
                      isSelected
                        ? 'bg-red-50/80 border-[#EF3124] text-[#191C1F] ring-2 ring-[#EF3124]/20 shadow-xs'
                        : 'bg-white border-gray-200 hover:bg-[#F8F9FA] hover:border-gray-400 text-gray-800'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0 mt-0.5 transition-colors ${
                      isSelected ? 'bg-[#EF3124] text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <div className="flex-1 text-xs sm:text-sm leading-relaxed font-medium">
                      {option}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Navigation Buttons */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handlePrevQuestion}
                disabled={currentQIndex === 0}
                className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-40 disabled:pointer-events-none text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Назад</span>
              </button>

              <div className="flex items-center gap-2">
                {currentQIndex + 1 < examQuestions.length ? (
                  <button
                    type="button"
                    onClick={handleNextQuestion}
                    className="px-5 py-2.5 rounded-xl bg-[#EF3124] hover:bg-[#D42014] text-white font-bold text-xs flex items-center gap-2 transition-all shadow-sm cursor-pointer"
                  >
                    <span>Далее</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={finishExam}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-md cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Завершить экзамен (10 вопросов)</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Quick Navigator Pill Grid (1-10) */}
          <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xs">
            <div className="text-[11px] font-bold text-gray-500 mb-2">Быстрая навигация по 10 вопросам:</div>
            <div className="flex flex-wrap gap-2">
              {examQuestions.map((q, idx) => {
                const isCurrent = idx === currentQIndex;
                const isAnswered = answers[q.id] !== undefined;
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQIndex(idx)}
                    className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-[#EF3124] text-white ring-2 ring-red-300'
                        : isAnswered
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ================= STEP 3: RESULTS & EXECUTIVE REPORT ================= */}
      {step === 'result' && resultData && (
        <div className="space-y-6">
          {/* Result Banner */}
          <div className={`p-6 sm:p-8 rounded-3xl border shadow-sm relative overflow-hidden ${
            resultData.isPassed
              ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
              : 'bg-red-50/80 border-red-300 text-red-950'
          }`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2 max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border">
                  {resultData.isPassed ? (
                    <span className="text-emerald-800 border-emerald-300 bg-emerald-100">
                      ✓ Аттестация пройдена (порог ≥ 85%)
                    </span>
                  ) : (
                    <span className="text-red-800 border-red-300 bg-red-100">
                      ⚠ Аттестация не пройдена
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-[#191C1F]">
                  {resultData.isPassed ? 'ЭКЗАМЕН СДАН (АТТЕСТОВАН В «АЛЬФА ФИН»)' : 'НЕ СДАН (ТРЕБУЕТСЯ ПОВТОРНАЯ АТТЕСТАЦИЯ)'}
                </h1>

                <p className="text-xs sm:text-sm text-gray-700">
                  Сотрудник: <strong>{resultData.candidateName}</strong> ({resultData.department}) • Время: {formatTime(resultData.elapsedSeconds)}
                </p>
              </div>

              {/* Score Badge */}
              <div className="flex items-center gap-4 bg-white p-5 rounded-2xl border border-gray-200 self-start md:self-auto shadow-xs">
                <div className="text-right">
                  <div className={`text-3xl sm:text-5xl font-black ${
                    resultData.isPassed ? 'text-emerald-600' : 'text-[#EF3124]'
                  }`}>
                    {resultData.score}/{resultData.totalQuestions}
                  </div>
                  <div className="text-xs text-gray-500 font-bold">
                    {resultData.percentage}% (проходной 85% = 9/10)
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 5 Categories Breakdown */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-gray-200 space-y-5 shadow-xs">
            <div>
              <h2 className="text-lg font-bold text-[#191C1F] mb-1">
                Аналитика компетенций по направлениям
              </h2>
              <p className="text-xs text-gray-500">
                Результаты проверки по Закону РБ № 99-З, таможенному праву и кибербезопасности
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(resultData.categoryStats).map(([catName, stat]) => {
                const isWeak = stat.percent < 75;
                const isPerfect = stat.percent >= 85;

                return (
                  <div key={catName} className="p-4 rounded-2xl bg-[#F8F9FA] border border-gray-200 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#191C1F]">{catName}</span>
                      <span className={`font-black ${
                        isPerfect ? 'text-emerald-600' : isWeak ? 'text-[#EF3124]' : 'text-amber-600'
                      }`}>
                        {stat.correct}/{stat.total} ({stat.percent}%)
                      </span>
                    </div>

                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isPerfect ? 'bg-emerald-500' : isWeak ? 'bg-[#EF3124]' : 'bg-amber-500'
                        }`}
                        style={{ width: `${stat.percent}%` }}
                      ></div>
                    </div>

                    {isWeak && (
                      <div className="text-[11px] text-red-700 font-bold flex items-center gap-1 mt-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                        <span>Зона риска: повторите регламент и Закон РБ № 99-З по данному разделу</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* MANAGER BLOCK */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-red-200 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-red-50 border border-red-200 text-[#EF3124]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#191C1F]">Блок руководителя: Защищенный отчет «Альфа Фин»</h2>
                <p className="text-xs text-gray-500">
                  Криптографическая защита от подделки скриншотов и отправка в HR-систему
                </p>
              </div>
            </div>

            {/* Verification Code */}
            <div className="p-4 rounded-2xl bg-[#F8F9FA] border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-[11px] uppercase font-bold tracking-wider text-gray-500">
                  Уникальный код верификации (Anti-Fraud Checksum):
                </div>
                <div className="text-base sm:text-lg font-mono font-black text-[#EF3124] tracking-wide mt-0.5">
                  {resultData.verificationCode}
                </div>
              </div>
              <button
                onClick={handleCopyCode}
                className="px-4 py-2 bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto shadow-xs"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-gray-600" />}
                <span>{copiedCode ? 'Скопировано!' : 'Копировать код'}</span>
              </button>
            </div>

            {/* Actions: Copy Report, Print Certificate */}
            <div className="flex flex-wrap gap-3">
              <div className="flex rounded-xl bg-gray-100 p-1 border border-gray-200">
                <button
                  onClick={() => setReportFormat('text')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    reportFormat === 'text' ? 'bg-white text-[#191C1F] shadow-xs' : 'text-gray-500 hover:text-black'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Текст</span>
                </button>
                <button
                  onClick={() => setReportFormat('json')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    reportFormat === 'json' ? 'bg-white text-[#191C1F] shadow-xs' : 'text-gray-500 hover:text-black'
                  }`}
                >
                  <FileJson className="w-3.5 h-3.5" />
                  <span>JSON</span>
                </button>
              </div>

              <button
                onClick={handleCopyReport}
                className="px-4 py-2.5 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
              >
                {copiedReport ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedReport ? 'Отчет скопирован!' : 'Скопировать отчет для руководства'}</span>
              </button>

              <button
                onClick={handlePrint}
                className="px-4 py-2.5 bg-[#EF3124] hover:bg-[#D42014] text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-sm cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Печать в PDF / Сохранить сертификат</span>
              </button>
            </div>

            {/* Google Sheets / Webhook Direct Submission */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#F8F9FA] border border-gray-200 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                <Send className="w-4 h-4 text-[#EF3124]" />
                <span>Отправка результата в Google Sheets / корпоративный Webhook «Альфа Фин»:</span>
              </div>
              <form onSubmit={handleSendWebhook} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="url"
                  placeholder="https://script.google.com/macros/s/.../exec или Webhook URL"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-xl text-xs font-mono text-[#191C1F] placeholder-gray-400 focus:outline-none focus:border-[#EF3124]"
                />
                <button
                  type="submit"
                  disabled={webhookStatus === 'sending'}
                  className="px-4 py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0 disabled:opacity-50"
                >
                  {webhookStatus === 'sending' ? 'Отправка...' : 'Отправить в таблицу'}
                </button>
              </form>

              {webhookMessage && (
                <div className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                  webhookStatus === 'success' 
                    ? 'bg-emerald-50 border border-emerald-300 text-emerald-800' 
                    : 'bg-red-50 border border-red-300 text-red-800'
                }`}>
                  {webhookStatus === 'success' ? <Check className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-red-600" />}
                  <span>{webhookMessage}</span>
                </div>
              )}
            </div>

            {/* Preview of Report Content */}
            <div className="rounded-2xl bg-[#191C1F] text-gray-200 p-4 font-mono text-[11px] sm:text-xs overflow-x-auto max-h-60 leading-relaxed">
              <pre className="whitespace-pre-wrap">
                {reportFormat === 'text' ? generateReportText(resultData) : generateReportJson(resultData)}
              </pre>
            </div>
          </div>

          {/* Detailed Question Review Accordion */}
          <div className="p-6 rounded-3xl bg-white border border-gray-200 space-y-4 shadow-xs">
            <button
              onClick={() => setShowDetailedReview(!showDetailedReview)}
              className="w-full flex items-center justify-between text-left text-sm font-bold text-[#191C1F] cursor-pointer"
            >
              <span>Посмотреть подробный разбор всех 10 вопросов с методикой «Альфа Фин»</span>
              {showDetailedReview ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
            </button>

            {showDetailedReview && (
              <div className="space-y-4 pt-2">
                {examQuestions.map((q, qIndex) => {
                  const userAnswer = resultData.userAnswers.find(a => a.questionId === q.id);
                  const isCorrect = userAnswer?.isCorrect;
                  const selectedIdx = userAnswer?.selected ?? -1;

                  return (
                    <div
                      key={q.id}
                      className={`p-4 rounded-2xl border ${
                        isCorrect
                          ? 'bg-emerald-50/60 border-emerald-300'
                          : 'bg-red-50/60 border-red-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="text-xs font-bold text-gray-800">
                          Вопрос #{qIndex + 1} ({CATEGORY_NAMES[q.category]}):
                        </div>
                        {isCorrect ? (
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                            ✓ Верно
                          </span>
                        ) : (
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-red-100 text-red-800 font-bold border border-red-300">
                            ✕ Ошибка
                          </span>
                        )}
                      </div>

                      <p className="text-xs sm:text-sm text-gray-900 font-medium mb-3">{q.q}</p>

                      <div className="space-y-1.5 mb-3 text-xs">
                        {q.options.map((opt, oIdx) => {
                          const isPicked = selectedIdx === oIdx;
                          const isRight = q.correct === oIdx;

                          let optStyle = "text-gray-600";
                          if (isRight) optStyle = "text-emerald-900 font-bold bg-emerald-100/80 px-2 py-1 rounded";
                          if (isPicked && !isRight) optStyle = "text-red-900 font-bold bg-red-100/80 px-2 py-1 rounded";

                          return (
                            <div key={oIdx} className={`flex items-start gap-2 ${optStyle}`}>
                              <span>{String.fromCharCode(65 + oIdx)}.</span>
                              <span>{opt} {isRight && "✓ (Правильный ответ)"} {isPicked && !isRight && "← (Ваш выбор)"}</span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="p-2.5 rounded-xl bg-white text-xs text-gray-800 leading-relaxed border border-gray-200 shadow-xs">
                        <strong className="text-[#EF3124]">Методическое пояснение эксперта ИБ: </strong>
                        {q.expl}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Action to Retake or Go Back */}
          <div className="flex items-center justify-between gap-4 pt-2">
            <button
              onClick={() => {
                setStep('register');
              }}
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-gray-100 text-gray-700 text-xs font-bold border border-gray-200 flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Сдать экзамен заново</span>
            </button>

            <button
              onClick={onBackToDashboard}
              className="px-5 py-2.5 rounded-xl bg-[#EF3124] hover:bg-[#D42014] text-white text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
            >
              <span>Вернуться на главную</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* ================= PRINT-ONLY OFFICIAL CERTIFICATE ================= */}
          <div className="print-only p-8 text-black bg-white border-8 border-black rounded-none max-w-4xl mx-auto my-8">
            <div className="border-4 border-black p-8 text-center space-y-6">
              <div className="flex justify-between items-center border-b-2 border-black pb-4">
                <div className="text-left font-serif">
                  <div className="text-2xl font-black tracking-wider text-black">ООО «АЛЬФА ФИН»</div>
                  <div className="text-xs uppercase text-gray-700 font-bold">СЛУЖБА ИНФОРМАЦИОННОЙ БЕЗОПАСНОСТИ И ВЭД</div>
                </div>
                <div className="text-right font-mono text-xs">
                  <div>СТАНДАРТ: ЗАКОН РБ № 99-З & PROTOCOL v2.6</div>
                  <div>ID: {resultData.verificationCode}</div>
                </div>
              </div>

              <div className="py-4">
                <div className="text-xs uppercase tracking-widest text-gray-600 font-bold mb-2">ОФИЦИАЛЬНЫЙ СЕРТИФИКАТ АТТЕСТАЦИИ</div>
                <h1 className="text-3xl font-serif font-black tracking-wide text-black">
                  {resultData.isPassed ? 'СЕРТИФИКАТ ДОПУСКА К РАБОТЕ С ИИ' : 'СПРАВКА О ПРОХОЖДЕНИИ ТЕСТИРОВАНИЯ'}
                </h1>
                <p className="text-sm italic text-gray-700 mt-2">
                  Настоящим подтверждается, что сотрудник ООО «Альфа Фин»
                </p>
                <div className="text-2xl font-bold font-serif text-black underline underline-offset-8 decoration-black py-3">
                  {resultData.candidateName}
                </div>
                <p className="text-sm text-gray-800">
                  Подразделение: <strong>{resultData.department}</strong> (E-mail: {resultData.email})
                </p>
              </div>

              <div className="py-2 border-y-2 border-gray-300 text-sm leading-relaxed max-w-2xl mx-auto text-gray-900">
                успешно завершил(а) программу аттестации <strong>«Безопасный ИИ в международной логистике, ВЭД и защита данных по Закону РБ № 99-З»</strong> с результатом <strong>{resultData.score} из {resultData.totalQuestions} ({resultData.percentage}%)</strong>.
                Вердикт: <strong>{resultData.isPassed ? 'АТТЕСТОВАН(А) / ДОПУЩЕН(А) К РАБОТЕ С НЕЙРОСЕТЯМИ' : 'НЕ АТТЕСТОВАН(А)'}</strong>.
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs text-left max-w-lg mx-auto py-2">
                {Object.entries(resultData.categoryStats).map(([cat, st]) => (
                  <div key={cat} className="flex justify-between border-b border-gray-300 py-1">
                    <span>{cat}:</span>
                    <span className="font-bold">{st.correct}/{st.total} ({st.percent}%)</span>
                  </div>
                ))}
              </div>

              <div className="pt-8 flex justify-between items-end text-xs text-gray-700">
                <div className="text-left">
                  <div className="w-44 border-b-2 border-black mb-1"></div>
                  <div>Директор ООО «Альфа Фин»</div>
                  <div className="font-mono text-[10px] text-gray-500">Дата: {new Date(resultData.timestamp).toLocaleDateString('ru-RU')}</div>
                </div>

                <div className="text-center">
                  <div className="w-24 h-24 rounded-full border-2 border-black mx-auto flex items-center justify-center font-bold text-[9px] uppercase tracking-tighter text-black rotate-12">
                    ООО «АЛЬФА ФИН»<br/>СЛУЖБА БЕЗОПАСНОСТИ<br/>г. Минск
                  </div>
                </div>

                <div className="text-right">
                  <div className="w-44 border-b-2 border-black mb-1 ml-auto"></div>
                  <div>Офицер информационной безопасности</div>
                  <div className="font-mono text-[10px] text-gray-700">HASH: {resultData.verificationCode}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
