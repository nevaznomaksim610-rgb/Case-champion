import type { UserProfile, ProjectInfo, DashboardMetrics, Module } from "@/types";

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

const STAGE_LABEL: Record<string, string> = {
  idea: "только идея",
  mvp: "есть первые попытки (MVP)",
  selling: "уже продаёт, есть выручка",
};

const TRACK_LABEL: Record<string, string> = {
  tech: "технологический стартап (масштабируемая модель, гипотезы, MVP)",
  regular: "реальный (обычный) бизнес — повторяемые продажи продукта или услуги",
};

export interface ProjectMaterials {
  brief?: string;
  files?: { name: string; text: string }[];
}

// Собираем портрет бизнеса пользователя из данных онбординга/проекта/метрик
// и дополнительных материалов (описание + распарсенная презентация/документы).
export function buildBusinessContext(
  profile: UserProfile | null,
  project: ProjectInfo | null,
  metrics: DashboardMetrics | null,
  materials?: ProjectMaterials,
): string {
  const hasMaterials = !!(materials?.brief?.trim() || (materials?.files && materials.files.length > 0));
  if (!profile && !project && !hasMaterials) {
    return "Пользователь ещё не заполнил профиль своего бизнеса.";
  }
  const lines: string[] = [];

  if (profile?.name) lines.push(`Основатель: ${profile.name}${profile.age ? `, ${profile.age} лет` : ""}.`);
  if (project?.name) lines.push(`Название проекта: ${project.name}.`);
  if (project?.description) lines.push(`Описание проекта: ${project.description}.`);
  if (profile?.track) lines.push(`Тип бизнеса: ${TRACK_LABEL[profile.track] ?? profile.track}.`);
  if (profile?.stage) lines.push(`Стадия: ${STAGE_LABEL[profile.stage] ?? profile.stage}.`);
  if (profile?.industry) lines.push(`Сфера: ${profile.industry}.`);
  if (project?.goal) lines.push(`Цель на 30 дней: ${project.goal}.`);
  if (profile?.budget) lines.push(`Бюджет на старт: ${profile.budget.toLocaleString("ru-RU")} ₽.`);
  if (profile?.hoursPerWeek) lines.push(`Доступно времени: ${profile.hoursPerWeek} ч/неделю.`);
  if (profile?.teamSize) lines.push(`Размер команды: ${profile.teamSize} чел.`);
  if (profile?.skills?.length) lines.push(`Навыки основателя: ${profile.skills.join(", ")}.`);

  if (metrics) {
    const met: string[] = [];
    if (metrics.interviews) met.push(`интервью: ${metrics.interviews}`);
    if (metrics.leads) met.push(`заявки: ${metrics.leads}`);
    if (metrics.payments) met.push(`оплаты: ${metrics.payments}`);
    if (metrics.revenue) met.push(`выручка: ${metrics.revenue.toLocaleString("ru-RU")} ₽`);
    if (metrics.averageCheck) met.push(`средний чек: ${metrics.averageCheck.toLocaleString("ru-RU")} ₽`);
    if (met.length) lines.push(`Текущие метрики — ${met.join(", ")}.`);
  }

  // Дополнительные материалы от пользователя (описание + презентация/документы).
  if (materials) {
    const extra: string[] = [];
    if (materials.brief?.trim()) {
      extra.push(`Описание проекта от пользователя:\n${materials.brief.trim()}`);
    }
    if (materials.files && materials.files.length > 0) {
      for (const f of materials.files) {
        if (f.text?.trim()) extra.push(`Материал «${f.name}»:\n${f.text.trim()}`);
      }
    }
    if (extra.length > 0) {
      // Ограничиваем общий объём материалов, чтобы не раздувать промпт.
      let block = extra.join("\n\n");
      if (block.length > 9000) block = block.slice(0, 9000) + "\n…(материалы обрезаны)";
      lines.push("\n=== ЗАГРУЖЕННЫЕ МАТЕРИАЛЫ ПРОЕКТА ===\n" + block);
    }
  }

  return lines.join("\n");
}

const PERSONA = [
  "Ты — AI-кофаундер в приложении «Альфа.Будущее: Первый бизнес» от Альфа-Банка.",
  "Твоя задача — помочь начинающему предпринимателю запустить и развить ИМЕННО ЕГО бизнес: от идеи до первых реальных платежей.",
  "Правила общения:",
  "— Отвечай на русском, тёплым и поддерживающим тоном, но по делу и без воды.",
  "— Всегда опирайся на данные бизнеса пользователя (ниже). Обращайся по имени, если оно известно.",
  "— Давай конкретику: пошаговые действия, примеры формулировок, цифры и метрики.",
  "— Если данных не хватает для точного ответа — задай 1 уточняющий вопрос.",
  "— Не выдумывай факты о бизнесе пользователя, которых нет в контексте.",
  "— По юридическим и налоговым темам давай только ориентиры и советуй проверить у специалиста.",
  "— Держи ответы компактными: обычно 3–7 предложений или короткий список.",
].join("\n");

// Базовый системный промпт для общего чата AI-кофаундера.
export function baseSystemPrompt(businessContext: string): string {
  return `${PERSONA}\n\n=== ДАННЫЕ БИЗНЕСА ПОЛЬЗОВАТЕЛЯ ===\n${businessContext || "Пока не заполнено."}`;
}

// Системный промпт для AI прямо внутри урока — добавляет контекст текущего блока.
export function lessonSystemPrompt(
  businessContext: string,
  module: Module,
  answers: Record<string, unknown>,
): string {
  const theses = module.learn.map((c) => `• ${c.title}: ${c.thesis}`).join("\n");
  const filled = Object.entries(answers)
    .filter(([, v]) => {
      if (Array.isArray(v)) return v.length > 0;
      if (typeof v === "string") return v.trim().length > 0;
      return v !== undefined && v !== null && v !== "";
    })
    .map(([k, v]) => {
      const label = module.practice.fields.find((f) => f.name === k)?.label ?? k;
      return `• ${label}: ${Array.isArray(v) ? v.join(", ") : String(v)}`;
    })
    .join("\n");

  const lessonBlock = [
    `Сейчас пользователь проходит блок курса «${module.title}».`,
    `Ожидаемый результат блока: ${module.resultDescription}`,
    theses ? `Ключевые тезисы урока:\n${theses}` : "",
    filled ? `Что пользователь уже заполнил в практике этого блока:\n${filled}` : "Практику этого блока пользователь пока не заполнял.",
    "Помогай именно с этим блоком: объясняй, приводи примеры под его бизнес, проверяй ответы, предлагай улучшения. Но можешь отвечать и на любые смежные вопросы о его бизнесе.",
  ]
    .filter(Boolean)
    .join("\n");

  return `${PERSONA}\n\n=== ДАННЫЕ БИЗНЕСА ПОЛЬЗОВАТЕЛЯ ===\n${businessContext || "Пока не заполнено."}\n\n=== ТЕКУЩИЙ УРОК ===\n${lessonBlock}`;
}

// Клиентский дневной лимит (мгновенная обратная связь + меньше лишних запросов).
// Серверный лимит по IP — основной, его нельзя обойти очисткой localStorage.
const AI_DAILY_LIMIT = 67;

function withinClientDailyLimit(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const key = "alfa-ai-usage";
    const day = new Date(Date.now() + 3 * 3600_000).toISOString().slice(0, 10);
    const raw = window.localStorage.getItem(key);
    const rec = raw ? (JSON.parse(raw) as { day: string; count: number }) : null;
    const count = rec && rec.day === day ? rec.count : 0;
    if (count >= AI_DAILY_LIMIT) return false;
    window.localStorage.setItem(key, JSON.stringify({ day, count: count + 1 }));
    return true;
  } catch {
    return true;
  }
}

// Запрос к серверному маршруту (ключ живёт только на сервере).
export async function askAi(messages: ChatTurn[], system: string): Promise<string> {
  if (!withinClientDailyLimit()) {
    return "На сегодня лимит исчерпан: 67 сообщений в день. Возвращайтесь завтра, я буду на связи 🦁";
  }
  try {
    const res = await fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, system }),
    });
    const data = (await res.json().catch(() => null)) as { content?: string } | null;
    return data?.content ?? "Не удалось получить ответ. Попробуйте ещё раз.";
  } catch {
    return "Не удалось связаться с AI. Проверьте соединение и попробуйте снова.";
  }
}
