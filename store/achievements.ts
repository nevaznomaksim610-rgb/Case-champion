import type { Achievement } from "@/types";

export const ACHIEVEMENT_DEFS: Achievement[] = [
  { id: "idea_set", label: "Сформулировал идею", emoji: "💡", unlocked: false, unlockedAt: null },
  { id: "first_interview", label: "Провёл первое интервью", emoji: "🎤", unlocked: false, unlockedAt: null },
  { id: "first_offer", label: "Создал оффер", emoji: "✨", unlocked: false, unlockedAt: null },
  { id: "first_lead", label: "Получил первую заявку", emoji: "📨", unlocked: false, unlockedAt: null },
  { id: "first_payment", label: "Получил первый платёж", emoji: "💰", unlocked: false, unlockedAt: null },
  { id: "economics_done", label: "Посчитал экономику", emoji: "📊", unlocked: false, unlockedAt: null },
  { id: "payments_set", label: "Настроил платежи", emoji: "🏦", unlocked: false, unlockedAt: null },
  { id: "demo_day", label: "Готов к Demo Day", emoji: "🏆", unlocked: false, unlockedAt: null },
];
