"use client";

import { useMemo } from "react";
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
  Target,
  Calculator,
  Briefcase,
  Trophy,
} from "lucide-react";
import { motion } from "framer-motion";
import { AppShell } from "@/components/shell/AppShell";
import { CourseMap } from "@/components/course/CourseMap";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useAppStore } from "@/store/useAppStore";
import { getModulesForTrack } from "@/data/courseData";
import { formatMoney, formatNumber } from "@/lib/utils";

export default function HomePage() {
  return (
    <AppShell>
      <HomeContent />
    </AppShell>
  );
}

function HomeContent() {
  const profile = useAppStore((s) => s.profile);
  const project = useAppStore((s) => s.project);
  const metrics = useAppStore((s) => s.metrics);
  const streak = useAppStore((s) => s.streakDays);
  const moduleProgress = useAppStore((s) => s.moduleProgress);

  const track = profile?.track ?? null;
  const modules = useMemo(() => getModulesForTrack(track), [track]);

  // Блоки предыдущих стадий («не требуется») не входят в прогресс траектории.
  const journeyModules = modules.filter(
    (m) => moduleProgress[m.id]?.status !== "skipped_not_applicable",
  );
  const completedCount = journeyModules.filter((m) => {
    const s = moduleProgress[m.id]?.status;
    return s === "completed" || s === "credited_by_diagnostic";
  }).length;
  const totalCount = journeyModules.length;
  const pct = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;

  const activeModule =
    modules.find((m) => {
      const s = moduleProgress[m.id]?.status;
      return s === "in_progress" || s === "available";
    }) ?? modules.find((m) => moduleProgress[m.id]?.status === "locked");

  return (
    <div className="space-y-5 lg:space-y-6">
      {/* Hero */}
      <HeroCard
        projectName={project?.name ?? "Мой проект"}
        stage={profile?.stage}
        goal={project?.goal ?? ""}
        track={track}
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
          <MetricCard icon={Users} label="Интервью" value={formatNumber(metrics.interviews)} tone="dark" />
          <MetricCard icon={MousePointerClick} label="Заявки" value={formatNumber(metrics.leads)} tone="warning" />
          <MetricCard icon={CreditCard} label="Оплаты" value={formatNumber(metrics.payments)} tone="primary" />
          <MetricCard icon={Wallet} label="Выручка" value={formatMoney(metrics.revenue)} tone="success" />
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

      {/* Journey + боковая колонка (на ПК — рядом, на мобиле — стопкой) */}
      <div className="grid lg:grid-cols-[1fr_360px] gap-5 lg:gap-6 items-start">
        <section>
          <SectionHeader
            title="Ваша траектория"
            subtitle={
              track === "tech"
                ? "Трек «Технологический стартап»"
                : track === "regular"
                  ? "Трек «Реальный бизнес»"
                  : "От идеи до первого платежа"
            }
          />
          <div className="card p-4 lg:p-6">
            <CourseMap modules={modules} progress={moduleProgress} />
          </div>
        </section>

        <aside className="space-y-5 lg:space-y-6 lg:sticky lg:top-6">
          <div>
            <SectionHeader title="Разделы" subtitle="Всё под рукой" />
            <div className="grid grid-cols-3 gap-3">
              <QuickTile href="/business" icon={Briefcase} label="Мой бизнес" />
              <QuickTile href="/finance" icon={Calculator} label="Экономика" />
              <QuickTile href="/demo-day" icon={Trophy} label="Demo Day" />
            </div>
          </div>
          <AiPromoCard />
        </aside>
      </div>
    </div>
  );
}

function AiPromoCard() {
  const router = useRouter();
  return (
    <div className="relative overflow-hidden rounded-3xl bg-ink text-white p-5">
      <div className="absolute -top-16 -right-10 w-44 h-44 rounded-full bg-primary/30 blur-2xl" />
      <div className="relative">
        <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center mb-3">
          <Sparkles className="w-5 h-5" />
        </div>
        <p className="font-semibold text-white">AI-кофаундер</p>
        <p className="text-sm text-white/70 mt-1">
          Знает всё о вашем бизнесе из онбординга и ответит на любой вопрос — по идее, офферу, экономике и платежам.
        </p>
        <Button size="sm" fullWidth className="mt-4" onClick={() => router.push("/ai")}>
          <Sparkles className="w-4 h-4" />
          Открыть чат
        </Button>
      </div>
    </div>
  );
}

function HeroCard({
  projectName,
  stage,
  goal,
  track,
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
  track: "tech" | "regular" | null;
  pct: number;
  completedCount: number;
  totalCount: number;
  streak: number;
  activeModuleTitle?: string;
  activeModuleId?: string;
}) {
  const router = useRouter();
  const stageLabel =
    stage === "idea" ? "Идея" : stage === "mvp" ? "MVP" : stage === "selling" ? "Продаю" : "Старт";
  const trackLabel = track === "tech" ? "💻 Стартап" : track === "regular" ? "🛍️ Реальный бизнес" : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-4xl bg-ink text-white p-6"
    >
      <div className="absolute -top-24 -right-16 w-64 h-64 rounded-full bg-primary/30 blur-3xl" />
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <span className="chip bg-white/10 text-white text-xs">
            <Target className="w-3.5 h-3.5" /> Первый бизнес
          </span>
          {streak > 0 && (
            <span className="chip bg-warning/20 text-warning text-xs font-semibold">
              <Flame className="w-3.5 h-3.5" /> {streak} {streak === 1 ? "день" : streak < 5 ? "дня" : "дней"}
            </span>
          )}
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-white">{projectName}</h1>
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <Badge tone="primary">{stageLabel}</Badge>
          {trackLabel && <span className="chip bg-white/10 text-white text-xs">{trackLabel}</span>}
        </div>
        {goal && <p className="text-sm text-white/70 mt-2">Цель: {goal}</p>}

        <div className="mt-5">
          <div className="flex items-end justify-between mb-2">
            <div>
              <p className="text-xs text-white/60">Прогресс траектории</p>
              <p className="text-3xl font-bold mt-0.5 text-white">{pct}%</p>
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
          <div className="mt-5 flex items-center justify-between gap-3 bg-white/5 rounded-2xl p-3.5">
            <div className="min-w-0">
              <p className="text-xs text-white/60">Ближайший шаг</p>
              <p className="font-semibold mt-0.5 truncate text-white">{activeModuleTitle}</p>
            </div>
            <Button size="sm" onClick={() => router.push(`/course/${activeModuleId}`)}>
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
        whileTap={{ scale: 0.99 }}
        className="card p-4 border-2 border-primary/30 bg-gradient-to-br from-primary-soft/50 to-bg-surface"
      >
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl bg-primary text-white flex items-center justify-center shrink-0 font-bold">
            {moduleNumber}
          </div>
          <div className="flex-1 min-w-0">
            <span className="chip bg-primary text-white text-[10px] mb-1">
              <Sparkles className="w-3 h-3" /> Следующее действие
            </span>
            <h3 className="font-semibold text-ink leading-tight">{title}</h3>
            <p className="text-sm text-secondary mt-1 line-clamp-2">{description}</p>
            {milestone && <p className="text-xs text-primary mt-2 font-medium">🎯 {milestone}</p>}
          </div>
          <ArrowRight className="w-5 h-5 text-primary shrink-0" />
        </div>
      </motion.div>
    </Link>
  );
}

function QuickTile({
  href,
  icon: Icon,
  label,
  accent,
}: {
  href: string;
  icon: typeof Briefcase;
  label: string;
  accent?: boolean;
}) {
  return (
    <Link
      href={href}
      className="card p-3 flex flex-col items-center justify-center gap-2 text-center hover:border-primary/40 hover:shadow-card hover:-translate-y-0.5 transition-all"
    >
      <div
        className={
          accent
            ? "w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center"
            : "w-10 h-10 rounded-2xl bg-primary-soft text-primary flex items-center justify-center"
        }
      >
        <Icon className="w-5 h-5" />
      </div>
      <span className="text-xs font-medium text-ink leading-tight">{label}</span>
    </Link>
  );
}
