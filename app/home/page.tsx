"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Flame,
  Sparkles,
  Play,
  Users,
  MousePointerClick,
  CreditCard,
  Wallet,
  ArrowRight,
  Trophy,
  Target,
} from "lucide-react";
import { motion } from "framer-motion";
import { AppShell } from "@/components/shell/AppShell";
import { CourseMap } from "@/components/course/CourseMap";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useAppStore } from "@/store/useAppStore";
import { getModulesForTrack } from "@/data/courseData";
import { ALL_MODULES } from "@/data/courseData";
import { formatMoney, formatNumber } from "@/lib/utils";
import type { ModuleProgress } from "@/types";

export default function HomePage() {
  return (
    <AppShell>
      <HomeContent />
    </AppShell>
  );
}

function HomeContent() {
  const router = useRouter();
  const profile = useAppStore((s) => s.profile);
  const project = useAppStore((s) => s.project);
  const metrics = useAppStore((s) => s.metrics);
  const streak = useAppStore((s) => s.streakDays);
  const moduleProgress = useAppStore((s) => s.moduleProgress);

  const track = profile?.track ?? null;
  const modules = useMemo(() => getModulesForTrack(track), [track]);

  const completedCount = modules.filter((m) => {
    const s = moduleProgress[m.id]?.status;
    return s === "completed" || s === "credited_by_diagnostic";
  }).length;
  const totalCount = modules.length;
  const pct = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;

  // Активный модуль
  const activeModule = modules.find((m) => {
    const s = moduleProgress[m.id]?.status;
    return s === "in_progress" || s === "available";
  }) ?? modules.find((m) => moduleProgress[m.id]?.status === "locked");

  // Desktop right panel: AI hint + next task + progress
  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-6">
      <div className="space-y-5">
        {/* Hero */}
        <HeroCard
          projectName={project?.name ?? "Мой проект"}
          stage={profile?.stage}
          goal={project?.goal ?? ""}
          pct={pct}
          completedCount={completedCount}
          totalCount={totalCount}
          streak={streak}
          activeModuleTitle={activeModule?.title}
          activeModuleId={activeModule?.id}
        />

        {/* Metrics */}
        <section>
          <SectionHeader title="Результаты" subtitle="Метрики вашего бизнеса" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <MetricCard
              icon={Users}
              label="Интервью"
              value={formatNumber(metrics.interviews)}
              tone="dark"
            />
            <MetricCard
              icon={MousePointerClick}
              label="Заявки"
              value={formatNumber(metrics.leads)}
              tone="warning"
              delta={metrics.leads > 0 ? { value: "+12%", up: true } : undefined}
            />
            <MetricCard
              icon={CreditCard}
              label="Оплаты"
              value={formatNumber(metrics.payments)}
              tone="primary"
              delta={metrics.payments > 0 ? { value: "+3", up: true } : undefined}
            />
            <MetricCard
              icon={Wallet}
              label="Выручка"
              value={formatMoney(metrics.revenue)}
              tone="success"
            />
          </div>
        </section>

        {/* Next action */}
        {activeModule && (
          <NextActionCard
            moduleId={activeModule.id}
            moduleNumber={activeModule.number}
            title={activeModule.title}
            description={activeModule.description}
            milestone={activeModule.milestone?.label}
          />
        )}

        {/* Course map */}
        <section>
          <SectionHeader
            title="Карта курса"
            subtitle={
              track === "tech"
                ? "Трек «Технологический стартап»"
                : track === "regular"
                  ? "Трек «Обычный бизнес»"
                  : "Общая часть — выберите трек после блока 8"
            }
            action={
              !track ? (
                <button
                  onClick={() => router.push("/business?tab=plan")}
                  className="chip bg-primary-soft text-primary text-xs font-medium"
                >
                  Выбрать трек
                </button>
              ) : undefined
            }
          />
          <div className="card p-5 lg:p-6">
            <CourseMap modules={modules} progress={moduleProgress} />
          </div>
        </section>

        {/* Week results */}
        <section>
          <SectionHeader title="Результаты недели" subtitle="Что произошло за 7 дней" />
          <WeekResults />
        </section>
      </div>

      {/* Desktop right panel */}
      <aside className="hidden lg:block space-y-4">
        <ProgressCard pct={pct} completed={completedCount} total={totalCount} streak={streak} />
        <AIHintCard />
        <AchievementsPreview />
      </aside>
    </div>
  );
}

function HeroCard({
  projectName,
  stage,
  goal,
  pct,
  completedCount,
  totalCount,
  streak,
  activeModuleTitle,
  activeModuleId,
}: {
  projectName: string;
  stage: string | null | undefined;
  goal: string;
  pct: number;
  completedCount: number;
  totalCount: number;
  streak: number;
  activeModuleTitle?: string;
  activeModuleId?: string;
}) {
  const stageLabel =
    stage === "idea" ? "Идея" : stage === "mvp" ? "MVP" : stage === "selling" ? "Продаю" : "Старт";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-4xl bg-ink text-white p-6 lg:p-8"
    >
      <div className="absolute -top-24 -right-16 w-72 h-72 rounded-full bg-primary/30 blur-3xl" />
      <div className="absolute top-20 -left-20 w-48 h-48 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative">
        <div className="flex items-center justify-between mb-5">
          <span className="chip bg-white/10 text-white text-xs">
            <Target className="w-3.5 h-3.5" /> Первый бизнес
          </span>
          {streak > 0 && (
            <span className="chip bg-warning/20 text-warning text-xs font-semibold">
              <Flame className="w-3.5 h-3.5" /> 🔥 {streak} {streak === 1 ? "день" : streak < 5 ? "дня" : "дней"}
            </span>
          )}
        </div>

        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">{projectName}</h1>
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <Badge tone="primary">{stageLabel}</Badge>
          {goal && <span className="text-sm text-white/70">→ {goal}</span>}
        </div>

        <div className="mt-6">
          <div className="flex items-end justify-between mb-2">
            <div>
              <p className="text-xs text-white/60">Прогресс курса</p>
              <p className="text-3xl font-bold mt-0.5">{pct}%</p>
            </div>
            <p className="text-xs text-white/60">
              {completedCount} из {totalCount} блоков
            </p>
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="h-full bg-primary rounded-full"
            />
          </div>
        </div>

        {activeModuleTitle && activeModuleId && (
          <div className="mt-6 flex items-center justify-between gap-4 bg-white/5 rounded-2xl p-4">
            <div className="min-w-0">
              <p className="text-xs text-white/60">Ближайший результат</p>
              <p className="font-semibold mt-0.5 truncate">{activeModuleTitle}</p>
            </div>
            <Button
              size="sm"
              onClick={() => {
                window.location.href = `/course/${activeModuleId}`;
              }}
            >
              <Play className="w-4 h-4" fill="white" />
              Продолжить
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function NextActionCard({
  moduleId,
  moduleNumber,
  title,
  description,
  milestone,
}: {
  moduleId: string;
  moduleNumber: string;
  title: string;
  description: string;
  milestone?: string;
}) {
  return (
    <Link href={`/course/${moduleId}`}>
      <motion.div
        whileHover={{ y: -2 }}
        className="card p-5 border-2 border-primary/30 bg-gradient-to-br from-primary-soft/50 to-bg-surface"
      >
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl bg-primary text-white flex items-center justify-center shrink-0 font-bold">
            {moduleNumber}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="chip bg-primary text-white text-[10px]">
                <Sparkles className="w-3 h-3" /> Следующее действие
              </span>
            </div>
            <h3 className="font-semibold text-ink leading-tight">{title}</h3>
            <p className="text-sm text-secondary mt-1 line-clamp-2">{description}</p>
            {milestone && (
              <p className="text-xs text-primary mt-2 font-medium">🎯 {milestone}</p>
            )}
          </div>
          <ArrowRight className="w-5 h-5 text-primary shrink-0" />
        </div>
      </motion.div>
    </Link>
  );
}

function WeekResults() {
  const payments = useAppStore((s) => s.payments);
  const experiments = useAppStore((s) => s.experiments);
  const interviews = useAppStore((s) => s.interviews);
  const clients = useAppStore((s) => s.clients);

  const events = [
    { icon: "💵", label: `Подключено платежей: ${payments.length}`, time: "сегодня" },
    { icon: "🎯", label: `Экспериментов запущено: ${experiments.length}`, time: "на неделе" },
    { icon: "🎤", label: `Интервью проведено: ${interviews.length}`, time: "за всё время" },
    { icon: "👥", label: `Клиентов в CRM: ${clients.length}`, time: "за всё время" },
  ];

  return (
    <Card className="p-5">
      <div className="space-y-3">
        {events.map((e, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-bg-muted flex items-center justify-center text-lg shrink-0">
              {e.icon}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-ink">{e.label}</p>
              <p className="text-xs text-secondary">{e.time}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function ProgressCard({
  pct,
  completed,
  total,
  streak,
}: {
  pct: number;
  completed: number;
  total: number;
  streak: number;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="section-title">Ваш прогресс</h3>
        <span className="text-2xl">{pct}%</span>
      </div>
      <Progress value={pct} className="mb-3" />
      <div className="flex items-center justify-between text-sm">
        <div>
          <p className="text-secondary text-xs">Блоков пройдено</p>
          <p className="font-semibold text-ink">
            {completed} / {total}
          </p>
        </div>
        <div className="text-right">
          <p className="text-secondary text-xs">Streak</p>
          <p className="font-semibold text-warning flex items-center gap-1 justify-end">
            <Flame className="w-4 h-4" /> {streak} дн.
          </p>
        </div>
      </div>
    </Card>
  );
}

function AIHintCard() {
  const router = useRouter();
  const project = useAppStore((s) => s.project);
  return (
    <Card className="p-5 bg-gradient-to-br from-primary-soft/60 to-bg-surface border-primary/20">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <p className="font-semibold text-ink leading-none">AI-кофаундер</p>
          <p className="text-xs text-secondary mt-0.5">Готов помочь</p>
        </div>
      </div>
      <p className="text-sm text-secondary mt-3">
        {project
          ? `По «${project.name}» могу предложить следующий шаг — спросите меня.`
          : "Спросите меня про идею, оффер или экономику."}
      </p>
      <Button size="sm" fullWidth className="mt-3" onClick={() => router.push("/ai")}>
        <Sparkles className="w-4 h-4" />
        Попросить AI помочь
      </Button>
    </Card>
  );
}

function AchievementsPreview() {
  const achievements = useAppStore((s) => s.achievements);
  const unlocked = achievements.filter((a) => a.unlocked);
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="section-title">Достижения</h3>
        <Link href="/profile" className="text-xs text-primary font-medium">
          Все
        </Link>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {achievements.slice(0, 8).map((a) => (
          <div
            key={a.id}
            title={a.label}
            className={`aspect-square rounded-2xl flex items-center justify-center text-xl ${
              a.unlocked ? "bg-primary-soft" : "bg-bg-muted grayscale opacity-40"
            }`}
          >
            {a.unlocked ? a.emoji : "🔒"}
          </div>
        ))}
      </div>
      <p className="text-xs text-secondary mt-3">
        Открыто {unlocked.length} из {achievements.length}
      </p>
    </Card>
  );
}
