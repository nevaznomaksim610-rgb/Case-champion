import type { BusinessFormat, Goal30, Stage, Track } from "@/types";
import { COMMON_MODULES } from "@/data/courseData";

interface AnalyzeInput {
  stage: Stage | null;
  format: BusinessFormat | null;
  goal: Goal30 | null;
  budget: number;
  hours: number;
  teamSize: number;
}

export interface OnboardingRecommendation {
  track: Track;
  startModuleId: string;
  startModuleLabel: string;
  aiText: string;
  useDiagnostic: boolean;
  skippedByDiagnostic: string[];
}

export function analyzeOnboarding(input: AnalyzeInput): OnboardingRecommendation {
  const { stage, format, goal, budget, hours } = input;

  // Выбор трека
  let track: Track = "regular";
  if (format === "tech") track = "tech";
  if (goal === "scale" && format === "tech") track = "tech";
  if (goal === "first_payment" && (format === "horeca" || format === "retail" || format === "beauty" || format === "production")) {
    track = "regular";
  }

  // Стартовый блок
  let startModuleId = "m1";
  let startModuleLabel = "Выбор бизнес-идеи";

  if (stage === "selling") {
    startModuleId = "m5";
    startModuleLabel = "Проверка спроса реальным платежом";
  } else if (stage === "mvp") {
    startModuleId = "m4";
    startModuleLabel = "Продукт, оффер и цена";
  }

  // Диагностика: для MVP/продаж зачитываем часть блоков как «зачтено диагностикой»
  const useDiagnostic = stage === "mvp" || stage === "selling";
  const skippedByDiagnostic: string[] = [];
  if (stage === "selling") {
    skippedByDiagnostic.push("m1", "m2", "m3");
  } else if (stage === "mvp") {
    skippedByDiagnostic.push("m1");
  }

  // AI-текст
  const budgetText = budget > 0 ? `бюджет ${budget.toLocaleString("ru-RU")} ₽` : "бюджет не указан";
  const hoursText = hours > 0 ? `${hours} ч/неделю` : "гибкий график";

  let aiText = `По вашим ответам оптимальный трек — ${track === "tech" ? "«Технологический стартап»" : "«Обычный бизнес»"}. `;
  if (stage === "idea") {
    aiText += `Вы на старте, ${budgetText}, ${hoursText}. Начнём с фундамента: идея → проблема → оффер. `;
  } else if (stage === "mvp") {
    aiText += `MVP уже есть — нет смысла заново проходить «Идею». Перейдём сразу к офферу и проверке спроса. `;
  } else {
    aiText += `Вы уже продаёте — фокус на экономике, удержании и масштабировании. Базовые блоки зачтены диагностикой. `;
  }
  aiText += `Стартовый блок: «${startModuleLabel}». Следующий шаг — открыть его и заполнить практику.`;

  return {
    track,
    startModuleId,
    startModuleLabel,
    aiText,
    useDiagnostic,
    skippedByDiagnostic,
  };
}

export function getStartModuleLabel(stage: Stage | null): string {
  if (stage === "selling") return "Проверка спроса реальным платежом";
  if (stage === "mvp") return "Продукт, оффер и цена";
  return "Выбор бизнес-идеи";
}

export function modulesCount(): number {
  return COMMON_MODULES.length;
}
