"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  UserProfile,
  ProjectInfo,
  DashboardMetrics,
  ModuleProgress,
  ChatMessage,
  Competitor,
  Interview,
  ClientRow,
  AssortmentRow,
  TeamRow,
  Experiment,
  ConnectedPayment,
  Achievement,
  Toast,
  ModuleStatus,
  FinanceInput,
  PaymentAnswers,
  Track,
  Stage,
} from "@/types";
import {
  DEMO_PROFILE,
  DEMO_PROJECT,
  DEMO_METRICS,
  DEMO_COMPETITORS,
  DEMO_INTERVIEWS,
  DEMO_CLIENTS,
  DEMO_ASSORTMENT,
  DEMO_TEAM,
  DEMO_EXPERIMENTS,
  DEMO_PAYMENTS,
  DEMO_ACHIEVEMENTS,
  DEMO_MODULE_PROGRESS,
  DEMO_STREAK_DAYS,
  DEMO_START_DATE,
} from "@/data/demoData";
import {
  ALL_MODULES,
  getModulesForTrack,
  moduleStageIndex,
  startStageIndexForStage,
} from "@/data/courseData";
import { ACHIEVEMENT_DEFS } from "@/store/achievements";
import { todayISO, uid } from "@/lib/utils";

const emptyModuleProgress = (): ModuleProgress => ({
  status: "locked",
  answers: {},
  quizPassed: false,
  aiAnalyzed: false,
  acceptedAiSuggestions: [],
  artifactSaved: false,
  completedAt: null,
  startedAt: null,
});

function initialProgressMap(): Record<string, ModuleProgress> {
  const map: Record<string, ModuleProgress> = {};
  ALL_MODULES.forEach((m, idx) => {
    const p = emptyModuleProgress();
    if (idx === 0) p.status = "available";
    map[m.id] = p;
  });
  return map;
}

// Прогресс с учётом онбординга: старт с выбранной стадии, блоки предыдущих
// стадий помечаются «не требуется на вашей стадии», остальные — заблокированы.
function buildInitialProgress(
  track: Track | null,
  stage: Stage | null,
): Record<string, ModuleProgress> {
  const map: Record<string, ModuleProgress> = {};
  // По умолчанию всё закрыто (в т.ч. блоки другого трека).
  ALL_MODULES.forEach((m) => {
    map[m.id] = emptyModuleProgress();
  });

  const ordered = getModulesForTrack(track);
  const startStage = startStageIndexForStage(stage);
  let startIdx = ordered.findIndex((m) => moduleStageIndex(m.id) >= startStage);
  if (startIdx < 0) startIdx = 0;

  ordered.forEach((m, i) => {
    const p = emptyModuleProgress();
    if (i < startIdx) p.status = "skipped_not_applicable";
    else if (i === startIdx) p.status = "available";
    else p.status = "locked";
    map[m.id] = p;
  });

  return map;
}

interface AppState {
  // meta
  initialized: boolean;
  onboarded: boolean;
  startDate: string;

  // user & project
  profile: UserProfile | null;
  project: ProjectInfo | null;
  metrics: DashboardMetrics;

  // course
  moduleProgress: Record<string, ModuleProgress>;
  streakDays: number;
  lastActionDate: string | null;

  // chat
  chat: ChatMessage[];

  // business data
  competitors: Competitor[];
  interviews: Interview[];
  clients: ClientRow[];
  assortment: AssortmentRow[];
  team: TeamRow[];
  experiments: Experiment[];
  payments: ConnectedPayment[];
  achievements: Achievement[];

  // finance input (сохраняем последнюю сессию)
  financeInput: FinanceInput | null;
  paymentAnswers: PaymentAnswers | null;

  // toasts
  toasts: Toast[];

  // ===== actions =====
  setProfile: (p: Partial<UserProfile>) => void;
  setProject: (p: Partial<ProjectInfo>) => void;
  setMetrics: (m: Partial<DashboardMetrics>) => void;
  completeOnboarding: () => void;
  loadDemo: () => void;
  resetAll: () => void;

  startModule: (id: string) => void;
  saveModuleAnswers: (id: string, answers: Record<string, unknown>) => void;
  passQuiz: (id: string) => void;
  setAiAnalyzed: (id: string) => void;
  acceptAiSuggestion: (id: string, suggestionId: string) => void;
  saveArtifact: (id: string) => void;
  completeModule: (id: string) => void;
  setModuleStatus: (id: string, status: ModuleStatus) => void;
  isModuleUnlocked: (id: string) => boolean;

  addChatMessage: (msg: ChatMessage) => void;
  clearChat: () => void;

  addCompetitor: (c: Omit<Competitor, "id">) => void;
  updateCompetitor: (id: string, patch: Partial<Competitor>) => void;
  removeCompetitor: (id: string) => void;

  addInterview: (i: Omit<Interview, "id">) => void;
  removeInterview: (id: string) => void;

  addClient: (c: Omit<ClientRow, "id">) => void;
  updateClient: (id: string, patch: Partial<ClientRow>) => void;
  removeClient: (id: string) => void;

  addAssortment: (a: Omit<AssortmentRow, "id">) => void;
  updateAssortment: (id: string, patch: Partial<AssortmentRow>) => void;
  removeAssortment: (id: string) => void;

  addTeam: (t: Omit<TeamRow, "id">) => void;
  updateTeam: (id: string, patch: Partial<TeamRow>) => void;
  removeTeam: (id: string) => void;

  addExperiment: (e: Omit<Experiment, "id">) => void;
  updateExperiment: (id: string, patch: Partial<Experiment>) => void;
  removeExperiment: (id: string) => void;

  connectPayment: (p: Omit<ConnectedPayment, "connectedAt">) => void;
  disconnectPayment: (productId: string) => void;

  setFinanceInput: (f: FinanceInput) => void;
  setPaymentAnswers: (a: PaymentAnswers) => void;

  pushToast: (t: Omit<Toast, "id">) => void;
  dismissToast: (id: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      initialized: true,
      onboarded: false,
      startDate: todayISO(),

      profile: null,
      project: null,
      metrics: { interviews: 0, visits: 0, leads: 0, payments: 0, revenue: 0, averageCheck: 0, cac: 0 },

      moduleProgress: initialProgressMap(),
      streakDays: 0,
      lastActionDate: null,

      chat: [],
      competitors: [],
      interviews: [],
      clients: [],
      assortment: [],
      team: [],
      experiments: [],
      payments: [],
      achievements: ACHIEVEMENT_DEFS,

      financeInput: null,
      paymentAnswers: null,

      toasts: [],

      setProfile: (p) =>
        set((s) => ({ profile: { ...(s.profile ?? ({} as UserProfile)), ...p } as UserProfile })),

      setProject: (p) =>
        set((s) => ({ project: { ...(s.project ?? ({} as ProjectInfo)), ...p } as ProjectInfo })),

      setMetrics: (m) => set((s) => ({ metrics: { ...s.metrics, ...m } })),

      // Завершение онбординга = старт «с чистого листа».
      // profile/project уже установлены отдельными вызовами до этого,
      // поэтому здесь их не трогаем, но гарантируем, что в траектории
      // НИЧЕГО не пройдено — это новый пользователь.
      completeOnboarding: () =>
        set((s) => ({
          onboarded: true,
          // Траектория строится под выбранный трек и стадию из онбординга.
          moduleProgress: buildInitialProgress(s.profile?.track ?? null, s.profile?.stage ?? null),
          metrics: { interviews: 0, visits: 0, leads: 0, payments: 0, revenue: 0, averageCheck: 0, cac: 0 },
          streakDays: 0,
          lastActionDate: null,
          startDate: todayISO(),
          competitors: [],
          interviews: [],
          clients: [],
          assortment: [],
          team: [],
          experiments: [],
          payments: [],
          achievements: ACHIEVEMENT_DEFS.map((a) => ({ ...a, unlocked: false, unlockedAt: null })),
          chat: [],
          financeInput: null,
          paymentAnswers: null,
        })),

      loadDemo: () => {
        set({
          onboarded: true,
          profile: DEMO_PROFILE,
          project: DEMO_PROJECT,
          metrics: DEMO_METRICS,
          moduleProgress: { ...DEMO_MODULE_PROGRESS },
          streakDays: DEMO_STREAK_DAYS,
          startDate: DEMO_START_DATE,
          lastActionDate: todayISO(),
          competitors: DEMO_COMPETITORS,
          interviews: DEMO_INTERVIEWS,
          clients: DEMO_CLIENTS,
          assortment: DEMO_ASSORTMENT,
          team: DEMO_TEAM,
          experiments: DEMO_EXPERIMENTS,
          payments: DEMO_PAYMENTS,
          achievements: DEMO_ACHIEVEMENTS,
          chat: [
            {
              id: uid("msg_"),
              role: "assistant",
              createdAt: todayISO(),
              content:
                "Привет, Алексей! Я твой AI-кофаундер. Видел Campus Coffee — 11 оплат, выручка 27 500₽. Готов помочь довести до 20 продаж. С чего начнём?",
            },
          ],
        });
      },

      resetAll: () => {
        const fresh = initialProgressMap();
        set({
          onboarded: false,
          profile: null,
          project: null,
          metrics: { interviews: 0, visits: 0, leads: 0, payments: 0, revenue: 0, averageCheck: 0, cac: 0 },
          moduleProgress: fresh,
          streakDays: 0,
          startDate: todayISO(),
          lastActionDate: null,
          competitors: [],
          interviews: [],
          clients: [],
          assortment: [],
          team: [],
          experiments: [],
          payments: [],
          achievements: ACHIEVEMENT_DEFS.map((a) => ({ ...a, unlocked: false, unlockedAt: null })),
          chat: [],
          financeInput: null,
          paymentAnswers: null,
          toasts: [],
        });
      },

      startModule: (id) =>
        set((s) => {
          const cur = s.moduleProgress[id];
          if (!cur) return {};
          const today = todayISO();
          const streak = s.lastActionDate === today ? s.streakDays : s.streakDays + 1;
          return {
            moduleProgress: {
              ...s.moduleProgress,
              [id]: {
                ...cur,
                status: cur.status === "locked" ? "in_progress" : cur.status === "available" ? "in_progress" : cur.status,
                startedAt: cur.startedAt ?? today,
              },
            },
            streakDays: streak,
            lastActionDate: today,
          };
        }),

      saveModuleAnswers: (id, answers) =>
        set((s) => {
          const cur = s.moduleProgress[id];
          if (!cur) return {};
          return {
            moduleProgress: {
              ...s.moduleProgress,
              [id]: { ...cur, answers: { ...cur.answers, ...answers } },
            },
          };
        }),

      passQuiz: (id) =>
        set((s) => {
          const cur = s.moduleProgress[id];
          if (!cur) return {};
          return {
            moduleProgress: { ...s.moduleProgress, [id]: { ...cur, quizPassed: true } },
          };
        }),

      setAiAnalyzed: (id) =>
        set((s) => {
          const cur = s.moduleProgress[id];
          if (!cur) return {};
          return {
            moduleProgress: { ...s.moduleProgress, [id]: { ...cur, aiAnalyzed: true } },
          };
        }),

      acceptAiSuggestion: (id, suggestionId) =>
        set((s) => {
          const cur = s.moduleProgress[id];
          if (!cur) return {};
          const accepted = cur.acceptedAiSuggestions.includes(suggestionId)
            ? cur.acceptedAiSuggestions
            : [...cur.acceptedAiSuggestions, suggestionId];
          return {
            moduleProgress: { ...s.moduleProgress, [id]: { ...cur, acceptedAiSuggestions: accepted } },
          };
        }),

      saveArtifact: (id) =>
        set((s) => {
          const cur = s.moduleProgress[id];
          if (!cur) return {};
          return {
            moduleProgress: { ...s.moduleProgress, [id]: { ...cur, artifactSaved: true } },
          };
        }),

      completeModule: (id) =>
        set((s) => {
          const cur = s.moduleProgress[id];
          if (!cur) return {};
          const today = todayISO();
          // Unlock next module within same track list
          const moduleIdList = ALL_MODULES.map((m) => m.id);
          const idx = moduleIdList.indexOf(id);
          const newProgress = { ...s.moduleProgress };
          newProgress[id] = { ...cur, status: "completed", completedAt: today, artifactSaved: true };

          // Unlock next: find next module with same track-or-lower
          const mod = ALL_MODULES.find((m) => m.id === id);
          if (mod && idx >= 0) {
            for (let i = idx + 1; i < moduleIdList.length; i++) {
              const nextMod = ALL_MODULES[i];
              if (!nextMod) break;
              // unlock only modules of the user's track or common
              const userTrack = s.profile?.track;
              if (nextMod.track === "common" || nextMod.track === userTrack) {
                const np = newProgress[nextMod.id];
                if (np && (np.status === "locked")) {
                  newProgress[nextMod.id] = { ...np, status: "available" };
                }
                break;
              }
            }
          }

          // Achievement unlocking
          const mod2 = ALL_MODULES.find((m) => m.id === id);
          let achievements = s.achievements;
          if (mod2?.milestone) {
            const achId = milestoneToAchievement(mod2.milestone.id);
            if (achId) {
              achievements = s.achievements.map((a) =>
                a.id === achId && !a.unlocked ? { ...a, unlocked: true, unlockedAt: today } : a,
              );
            }
          }

          return { moduleProgress: newProgress, achievements };
        }),

      setModuleStatus: (id, status) =>
        set((s) => {
          const cur = s.moduleProgress[id];
          if (!cur) return {};
          return {
            moduleProgress: { ...s.moduleProgress, [id]: { ...cur, status } },
          };
        }),

      isModuleUnlocked: (id) => {
        const cur = get().moduleProgress[id];
        if (!cur) return false;
        return cur.status !== "locked";
      },

      addChatMessage: (msg) => set((s) => ({ chat: [...s.chat, msg] })),
      clearChat: () => set({ chat: [] }),

      addCompetitor: (c) =>
        set((s) => ({ competitors: [...s.competitors, { ...c, id: uid("c_") }] })),
      updateCompetitor: (id, patch) =>
        set((s) => ({
          competitors: s.competitors.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        })),
      removeCompetitor: (id) =>
        set((s) => ({ competitors: s.competitors.filter((c) => c.id !== id) })),

      addInterview: (i) =>
        set((s) => ({ interviews: [...s.interviews, { ...i, id: uid("i_") }] })),
      removeInterview: (id) =>
        set((s) => ({ interviews: s.interviews.filter((i) => i.id !== id) })),

      addClient: (c) => set((s) => ({ clients: [...s.clients, { ...c, id: uid("cl_") }] })),
      updateClient: (id, patch) =>
        set((s) => ({ clients: s.clients.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),
      removeClient: (id) => set((s) => ({ clients: s.clients.filter((c) => c.id !== id) })),

      addAssortment: (a) =>
        set((s) => ({ assortment: [...s.assortment, { ...a, id: uid("a_") }] })),
      updateAssortment: (id, patch) =>
        set((s) => ({
          assortment: s.assortment.map((a) => (a.id === id ? { ...a, ...patch } : a)),
        })),
      removeAssortment: (id) =>
        set((s) => ({ assortment: s.assortment.filter((a) => a.id !== id) })),

      addTeam: (t) => set((s) => ({ team: [...s.team, { ...t, id: uid("t_") }] })),
      updateTeam: (id, patch) =>
        set((s) => ({ team: s.team.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),
      removeTeam: (id) => set((s) => ({ team: s.team.filter((t) => t.id !== id) })),

      addExperiment: (e) =>
        set((s) => ({ experiments: [...s.experiments, { ...e, id: uid("e_") }] })),
      updateExperiment: (id, patch) =>
        set((s) => ({
          experiments: s.experiments.map((e) => (e.id === id ? { ...e, ...patch } : e)),
        })),
      removeExperiment: (id) =>
        set((s) => ({ experiments: s.experiments.filter((e) => e.id !== id) })),

      connectPayment: (p) =>
        set((s) => ({
          payments: s.payments.some((x) => x.productId === p.productId)
            ? s.payments
            : [...s.payments, { ...p, connectedAt: todayISO() }],
        })),
      disconnectPayment: (productId) =>
        set((s) => ({ payments: s.payments.filter((p) => p.productId !== productId) })),

      setFinanceInput: (f) => set({ financeInput: f }),
      setPaymentAnswers: (a) => set({ paymentAnswers: a }),

      pushToast: (t) =>
        set((s) => ({
          toasts: [...s.toasts, { ...t, id: uid("t_") }],
        })),
      dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
    }),
    {
      name: "alfa-buduschee-store-v1",
      version: 1,
    },
  ),
);

function milestoneToAchievement(milestoneId: string): string | null {
  const map: Record<string, string> = {
    idea_set: "idea_set",
    problem_validated: "first_interview",
    positioning: "first_offer",
    first_offer: "first_offer",
    first_payment: "first_payment",
    economics_done: "economics_done",
    legal_set: "payments_set",
    payments_set: "payments_set",
  };
  return map[milestoneId] ?? null;
}
