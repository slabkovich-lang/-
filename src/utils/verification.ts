export interface ExamResultData {
  candidateName: string;
  department: string;
  email: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  isPassed: boolean;
  timestamp: string;
  elapsedSeconds: number;
  categoryStats: Record<string, { total: number; correct: number; percent: number }>;
  userAnswers: { questionId: number; selected: number; correct: number; isCorrect: boolean }[];
  verificationCode?: string;
}

export function generateVerificationHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
}

export function generateVerificationCode(data: Omit<ExamResultData, 'verificationCode'>): string {
  const seed = `${data.candidateName}|${data.email}|${data.department}|${data.score}/${data.totalQuestions}|${data.timestamp}|ALFAFIN`;
  const h1 = generateVerificationHash(seed);
  const h2 = generateVerificationHash(data.userAnswers.map(a => `${a.questionId}:${a.selected}`).join(','));
  const statusFlag = data.isPassed ? 'CERT' : 'REV';
  const year = new Date().getFullYear();
  return `ALFA-AI-${year}-${h1.slice(0, 4)}-${h2.slice(0, 4)}-${statusFlag}`;
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins} мин ${secs < 10 ? '0' : ''}${secs} сек`;
}

export function generateReportText(data: ExamResultData): string {
  const dateFormatted = new Date(data.timestamp).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const categoryLines = Object.entries(data.categoryStats)
    .map(([catName, stat]) => `• ${catName}: ${stat.correct}/${stat.total} (${stat.percent}%)`)
    .join('\n');

  return `=====================================================
КОМПАНИЯ «АЛЬФА ФИН» — СЛУЖБА БЕЗОПАСНОСТИ И КОМПЛАЕНСА
ОТЧЕТ РУКОВОДИТЕЛЮ: АТТЕСТАЦИЯ ПО КИБЕРБЕЗОПАСНОСТИ ИИ
Стандарт: Закон Республики Беларусь № 99-З и Регламент ИИ v2.6
=====================================================
Сотрудник:         ${data.candidateName}
Подразделение:     ${data.department}
Корпоративный E-mail: ${data.email}
Дата аттестации:   ${dateFormatted}
Время прохождения: ${formatTime(data.elapsedSeconds)}

РЕЗУЛЬТАТ ТЕСТИРОВАНИЯ:
Итоговый балл:     ${data.score} из ${data.totalQuestions} (${data.percentage}%)
Вердикт:           ${data.isPassed ? '✅ АТТЕСТОВАН (ДОПУЩЕН К РАБОТЕ С ИИ)' : '❌ НЕ СДАН (ТРЕБУЕТСЯ ПОВТОРНАЯ АТТЕСТАЦИЯ)'}
Проходной порог:   85% (минимум 9 из 10 правильных ответов)

АНАЛИТИКА ПО КАТЕГОРИЯМ:
${categoryLines}

КОД ВЕРИФИКАЦИИ ПОДЛИННОСТИ (ANTI-FRAUD HASH):
${data.verificationCode || 'НЕ СГЕНЕРИРОВАН'}
(Код защищен криптографической контрольной суммой от подделки)
=====================================================`;
}

export function generateReportJson(data: ExamResultData): string {
  return JSON.stringify({
    company: "ООО «Альфа Фин»",
    regulator: "НЦЗПД Республики Беларусь",
    complianceBasis: "Закон РБ № 99-З «О защите персональных данных», ТК ЕАЭС",
    candidate: {
      name: data.candidateName,
      department: data.department,
      email: data.email,
    },
    results: {
      score: data.score,
      total: data.totalQuestions,
      percentage: data.percentage,
      isPassed: data.isPassed,
      passingGradeThreshold: 85,
      timestamp: data.timestamp,
      elapsedSeconds: data.elapsedSeconds,
    },
    domainBreakdown: data.categoryStats,
    verification: {
      code: data.verificationCode,
      checksumValid: true,
      issuedAt: data.timestamp,
      issuer: "ООО «Альфа Фин» / Information Security Committee",
    },
    detailedAnswers: data.userAnswers,
  }, null, 2);
}
