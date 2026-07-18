import type { BusinessFormat, Goal30, Stage, Track } from "@/types";
import {
  COMMON_MODULES,
  getModulesForTrack,
  moduleStageIndex,
  startStageIndexForStage,
  COURSE_STAGES,
} from "@/data/courseData";

interface AnalyzeInput {
  track: Track;
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
  stageTitle: string;
  aiText: string;
  firstSteps: { number: string; title: string }[];
}

// Трек выбирает сам пользователь на вопросе «стартап или реальный бизнес».
// Мы НЕ зачитываем блоки «диагностикой» — новый пользователь начинает
// траекторию с самого начала, ничего не пройдено.
export function analyzeOnboarding(input: AnalyzeInput): OnboardingRecommendation {
  const { track, stage, format, goal, budget, hours } = input;

  // Стартуем с той стадии, которую человек выбрал в онбординге.
  const modules = getModulesForTrack(track);
  const startStage = startStageIndexForStage(stage);
  const stageModules = modules.filter((m) => moduleStageIndex(m.id) >= startStage);
  const first = stageModules[0] ?? modules[0];
  const startModuleId = first?.id ?? "m1";
  const startModuleLabel = first?.title ?? "Выбор бизнес-идеи";
  const stageTitle = COURSE_STAGES[startStage]?.title ?? COURSE_STAGES[0].title;

  const firstSteps = stageModules.slice(0, 4).map((m) => ({ number: m.number, title: m.title }));

  const budgetText = budget > 0 ? `бюджет ${budget.toLocaleString("ru-RU")} ₽` : "бюджет пока не указан";
  const hoursText = hours > 0 ? `${hours} ч/неделю` : "гибкий график";

  const trackText =
    track === "tech"
      ? "«Технологический стартап» — ищем масштабируемую модель через гипотезы, MVP и монетизацию"
      : "«Реальный бизнес» — выстраиваем повторяемые продажи понятного продукта или услуги";

  const stageText =
    stage === "idea"
      ? "Вы в самом начале — соберём фундамент от идеи до первого платежа."
      : stage === "mvp"
        ? "У вас уже есть первые попытки — стартуем со стадии запуска и первых продаж, не тратя время на азы."
        : stage === "selling"
          ? "Вы уже продаёте — начинаем сразу со стадии роста: монетизация/финансы, удержание и масштаб. Ранние блоки останутся доступны для обзора, но не обязательны."
          : "Идём по шагам от идеи до первого платежа.";

  const aiText =
    `Ваша траектория — ${trackText}. ${stageText} ` +
    `Учитываю ваши вводные: ${budgetText}, ${hoursText}. ` +
    `Начнём со стадии «${stageTitle}», блок «${startModuleLabel}». Всё персонализировано под вашу сферу.`;

  return {
    track,
    startModuleId,
    startModuleLabel,
    stageTitle,
    aiText,
    firstSteps,
  };
}

export function modulesCount(): number {
  return COMMON_MODULES.length;
}
