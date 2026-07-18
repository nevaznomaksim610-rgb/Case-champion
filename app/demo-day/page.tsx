"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  CheckCircle2,
  Circle,
  Presentation,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Users,
  CreditCard,
  Wallet,
  Repeat,
  Target,
  FlaskConical,
  Sparkles,
  X,
} from "lucide-react";
import { AppShell } from "@/components/shell/AppShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useAppStore } from "@/store/useAppStore";
import { getModulesForTrack } from "@/data/courseData";
import { calcExperimentMetrics } from "@/lib/experiments";
import { formatMoney, formatNumber, formatPercent } from "@/lib/utils";

export default function DemoDayPage() {
  return (
    <AppShell>
      <DemoDayContent />
    </AppShell>
  );
}

function DemoDayContent() {
  const profile = useAppStore((s) => s.profile);
  const project = useAppStore((s) => s.project);
  const metrics = useAppStore((s) => s.metrics);
  const moduleProgress = useAppStore((s) => s.moduleProgress);
  const experiments = useAppStore((s) => s.experiments);
  const clients = useAppStore((s) => s.clients);
  const achievements = useAppStore((s) => s.achievements);
  const pushToast = useAppStore((s) => s.pushToast);

  const [presenting, setPresenting] = useState(false);

  const modules = useMemo(() => getModulesForTrack(profile?.track ?? null), [profile?.track]);
  const completed = modules.filter((m) => {
    const st = moduleProgress[m.id]?.status;
    return st === "completed" || st === "credited_by_diagnostic";
  }).length;
  const courseReadiness = modules.length ? completed / modules.length : 0;

  // Repeat rate из клиентов
  const repeatRate = clients.length
    ? clients.filter((c) => c.purchaseCount > 1).length / clients.length
    : 0;

  // Checklist готовности
  const checklist = useMemo(() => {
    const items: { id: string; label: string; done: boolean }[] = [
      { id: "idea", label: "Идея сформулирована", done: isDone(moduleProgress, "m1") },
      { id: "problem", label: "Проблема подтверждена интервью", done: metrics.interviews > 0 },
      { id: "offer", label: "Оффер готов", done: isDone(moduleProgress, "m4") },
      { id: "payment", label: "Получен первый платёж", done: metrics.payments > 0 },
      { id: "economics", label: "Экономика посчитана", done: isDone(moduleProgress, "m6") },
      { id: "payments_infra", label: "Платежи настроены", done: isDone(moduleProgress, "m8") },
      { id: "experiment", label: "Проведён эксперимент спроса", done: experiments.length > 0 },
    ];
    return items;
  }, [moduleProgress, metrics, experiments]);

  const checklistDone = checklist.filter((c) => c.done).length;
  const readiness = Math.round(
    ((courseReadiness * 0.5 + (checklistDone / checklist.length) * 0.5) * 100),
  );

  const readinessTone =
    readiness >= 70 ? "success" : readiness >= 40 ? "warning" : "danger";

  const pitchSlides = useMemo(
    () => buildPitch(project?.name ?? "Мой проект", project?.description ?? "", metrics, repeatRate),
    [project, metrics, repeatRate],
  );

  const metricCards = [
    { icon: CreditCard, label: "Платежи", value: formatNumber(metrics.payments) },
    { icon: Wallet, label: "Оборот", value: formatMoney(metrics.revenue) },
    { icon: Users, label: "Интервью", value: formatNumber(metrics.interviews) },
    { icon: Target, label: "Заявки", value: formatNumber(metrics.leads) },
    { icon: Wallet, label: "Средний чек", value: formatMoney(metrics.averageCheck) },
    { icon: CreditCard, label: "CAC", value: formatMoney(metrics.cac) },
    { icon: Repeat, label: "Repeat rate", value: formatPercent(repeatRate * 100, 0) },
    { icon: FlaskConical, label: "Эксперименты", value: formatNumber(experiments.length) },
  ];

  const demoReady = achievements.find((a) => a.id === "demo_day")?.unlocked;

  return (
    <div className="space-y-5 max-w-[900px] mx-auto">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-4xl bg-ink text-white p-6 lg:p-8"
      >
        <div className="absolute -top-24 -right-16 w-72 h-72 rounded-full bg-primary/30 blur-3xl" />
        <div className="relative">
          <span className="chip bg-primary text-white text-xs">
            <Trophy className="w-3.5 h-3.5" /> Demo Day
          </span>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight mt-4 text-white">
            {project?.name ?? "Ваш проект"}
          </h1>
          <p className="text-sm text-white/70 mt-2 max-w-lg">
            {project?.description ?? "Соберите метрики и презентуйте проект за 90 секунд."}
          </p>

          <div className="mt-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs text-white/60">Готовность к Demo Day</p>
              <p className="text-4xl font-bold mt-1">{readiness}%</p>
            </div>
            <Button onClick={() => setPresenting(true)}>
              <Presentation className="w-4 h-4" />
              Режим презентации
            </Button>
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden mt-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${readiness}%` }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className={`h-full rounded-full ${
                readinessTone === "success"
                  ? "bg-success"
                  : readinessTone === "warning"
                    ? "bg-warning"
                    : "bg-primary"
              }`}
            />
          </div>
        </div>
      </motion.div>

      {demoReady && (
        <Card className="bg-success/5 border-success/20 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-success/10 text-success flex items-center justify-center shrink-0">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold text-ink">Вы готовы к Demo Day 🏆</p>
            <p className="text-sm text-secondary">Все ключевые этапы пройдены — время презентовать.</p>
          </div>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Checklist */}
        <section>
          <SectionHeader
            title="Чек-лист готовности"
            subtitle={`${checklistDone} из ${checklist.length} пунктов`}
          />
          <Card>
            <div className="space-y-3">
              {checklist.map((c) => (
                <div key={c.id} className="flex items-center gap-3">
                  {c.done ? (
                    <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-bg-muted shrink-0" />
                  )}
                  <span
                    className={`text-sm ${c.done ? "text-ink font-medium" : "text-secondary"}`}
                  >
                    {c.label}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </section>

        {/* Metrics */}
        <section>
          <SectionHeader title="Метрики для питча" subtitle="Ключевые цифры проекта" />
          <div className="grid grid-cols-2 gap-3">
            {metricCards.map((m, i) => {
              const Icon = m.icon;
              return (
                <div key={i} className="card p-4">
                  <div className="w-8 h-8 rounded-xl bg-primary-soft text-primary flex items-center justify-center mb-2">
                    <Icon className="w-4 h-4" />
                  </div>
                  <p className="text-lg font-bold text-ink leading-none">{m.value}</p>
                  <p className="text-xs text-secondary mt-1">{m.label}</p>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Experiments summary */}
      {experiments.length > 0 && (
        <section>
          <SectionHeader title="Артефакты экспериментов" subtitle="Доказательства спроса" />
          <div className="space-y-3">
            {experiments.map((e) => {
              const em = calcExperimentMetrics(e);
              return (
                <Card key={e.id} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-ink truncate">{e.name}</p>
                    <p className="text-xs text-secondary truncate">{e.hypothesis}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge tone="success">{e.payments} оплат</Badge>
                    <Badge tone="neutral">ROAS {em.roas.toFixed(0)}%</Badge>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* Pitch summary */}
      <section>
        <SectionHeader title="Pitch summary" subtitle="Черновик выступления на 90 секунд" />
        <Card>
          <div className="space-y-4">
            {pitchSlides.map((s, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-7 h-7 rounded-xl bg-primary-soft text-primary flex items-center justify-center text-xs font-bold shrink-0">
                  {i + 1}
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                    {s.title}
                  </p>
                  <p className="text-sm text-ink mt-0.5">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-5">
            <Button
              fullWidth
              onClick={() => {
                copyPitch(pitchSlides);
                pushToast({ title: "Питч скопирован", variant: "success" });
              }}
            >
              <Copy className="w-4 h-4" />
              Скопировать текст выступления
            </Button>
            <Button variant="secondary" fullWidth onClick={() => setPresenting(true)}>
              <Presentation className="w-4 h-4" />
              Сформировать выступление
            </Button>
          </div>
        </Card>
      </section>

      {presenting && (
        <PresentationMode slides={pitchSlides} onClose={() => setPresenting(false)} />
      )}
    </div>
  );
}

function isDone(progress: Record<string, { status: string }>, id: string): boolean {
  const st = progress[id]?.status;
  return st === "completed" || st === "credited_by_diagnostic";
}

interface Slide {
  title: string;
  body: string;
}

function buildPitch(
  name: string,
  description: string,
  metrics: { payments: number; revenue: number; averageCheck: number; interviews: number; cac: number },
  repeatRate: number,
): Slide[] {
  return [
    {
      title: "Проблема",
      body: description
        ? `${description}`
        : "Клиенты сталкиваются с проблемой, которую пока решают неудобными способами.",
    },
    {
      title: "Решение",
      body: `${name} — продукт, который закрывает эту боль быстро и понятно.`,
    },
    {
      title: "Доказательство спроса",
      body: `Проведено ${metrics.interviews} интервью, получено ${metrics.payments} реальных оплат на ${formatMoney(
        metrics.revenue,
      )}.`,
    },
    {
      title: "Экономика",
      body: `Средний чек ${formatMoney(metrics.averageCheck)}, CAC ${formatMoney(
        metrics.cac,
      )}, повторные покупки у ${formatPercent(repeatRate * 100, 0)} клиентов.`,
    },
    {
      title: "Что дальше",
      body: "Масштабируем каналы привлечения, подключаем платёжную инфраструктуру Альфа-Банка и растём к устойчивой прибыли.",
    },
  ];
}

function copyPitch(slides: Slide[]) {
  const text = slides.map((s, i) => `${i + 1}. ${s.title}\n${s.body}`).join("\n\n");
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    navigator.clipboard.writeText(text).catch(() => {});
  }
}

function PresentationMode({ slides, onClose }: { slides: Slide[]; onClose: () => void }) {
  const [idx, setIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const slide = slides[idx];

  const next = () => setIdx((i) => Math.min(slides.length - 1, i + 1));
  const prev = () => setIdx((i) => Math.max(0, i - 1));

  return (
    <div className="fixed inset-0 z-50 bg-ink flex flex-col">
      <div className="flex items-center justify-between p-4 text-white/70">
        <span className="text-sm">
          {idx + 1} / {slides.length}
        </span>
        <button
          onClick={onClose}
          aria-label="Закрыть презентацию"
          className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25 }}
            className="max-w-2xl text-center"
          >
            <span className="chip bg-primary text-white text-xs mb-6 inline-flex">
              <Sparkles className="w-3.5 h-3.5" /> {slide.title}
            </span>
            <p className="text-2xl sm:text-4xl font-bold text-white leading-tight">{slide.body}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* progress dots */}
      <div className="flex items-center justify-center gap-2 pb-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            aria-label={`Слайд ${i + 1}`}
            className={`h-1.5 rounded-full transition-all ${
              i === idx ? "w-8 bg-primary" : "w-1.5 bg-white/20"
            }`}
          />
        ))}
      </div>

      <div className="flex items-center justify-between gap-3 p-4">
        <Button variant="secondary" size="sm" onClick={prev} disabled={idx === 0}>
          <ChevronLeft className="w-4 h-4" />
          Назад
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="!text-white hover:!bg-white/10"
          onClick={() => {
            copyPitch(slides);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? "Скопировано" : "Копировать"}
        </Button>
        {idx < slides.length - 1 ? (
          <Button size="sm" onClick={next}>
            Далее
            <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button size="sm" onClick={onClose}>
            Готово
            <Check className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
