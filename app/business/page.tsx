"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutGrid,
  Users,
  AlertCircle,
  Tag,
  Swords,
  Calculator,
  FlaskConical,
  CreditCard,
  FileText,
  TrendingUp,
  Copy,
  ArrowRight,
  Rocket,
  Cpu,
  Store,
  Check,
  Quote,
  ChevronRight,
} from "lucide-react";
import { AppShell } from "@/components/shell/AppShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { HealthScore, RiskIndicator, IndicatorGrid } from "@/components/dashboard/HealthScore";
import { useAppStore } from "@/store/useAppStore";
import { getModulesForTrack, getModuleById } from "@/data/courseData";
import { calculateFinance } from "@/lib/finance";
import { cn, formatMoney, formatNumber, formatPercent } from "@/lib/utils";
import type { Track } from "@/types";

type TabId =
  | "overview"
  | "client"
  | "offer"
  | "competitors"
  | "economics"
  | "experiments"
  | "payments"
  | "documents"
  | "plan";

const TABS: { id: TabId; label: string; icon: typeof LayoutGrid }[] = [
  { id: "overview", label: "Обзор", icon: LayoutGrid },
  { id: "client", label: "Клиент", icon: Users },
  { id: "offer", label: "Оффер", icon: Tag },
  { id: "competitors", label: "Конкуренты", icon: Swords },
  { id: "economics", label: "Экономика", icon: Calculator },
  { id: "experiments", label: "Эксперименты", icon: FlaskConical },
  { id: "payments", label: "Платежи", icon: CreditCard },
  { id: "documents", label: "Документы", icon: FileText },
  { id: "plan", label: "План роста", icon: TrendingUp },
];

export default function BusinessPage() {
  return (
    <AppShell>
      <BusinessContent />
    </AppShell>
  );
}

function BusinessContent() {
  const [tab, setTab] = useState<TabId>("overview");
  const [exportOpen, setExportOpen] = useState(false);

  // читаем ?tab= из URL один раз на клиенте
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("tab") as TabId | null;
    if (t && TABS.some((x) => x.id === t)) setTab(t);
  }, []);

  const project = useAppStore((s) => s.project);
  const profile = useAppStore((s) => s.profile);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-ink truncate">
            {project?.name ?? "Мой бизнес"}
          </h1>
          <p className="text-sm text-secondary mt-1 line-clamp-2 max-w-xl">
            {project?.description ?? "Заполните блоки курса — паспорт проекта соберётся автоматически."}
          </p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {profile?.stage && (
              <Badge tone="primary">
                {profile.stage === "idea" ? "Идея" : profile.stage === "mvp" ? "MVP" : "Продажи"}
              </Badge>
            )}
            {profile?.track && (
              <Badge tone="dark">
                {profile.track === "tech" ? "💻 Технологический" : "🛍️ Обычный бизнес"}
              </Badge>
            )}
            {project?.industry && <Badge tone="neutral">{project.industry}</Badge>}
          </div>
        </div>
        <Button size="sm" variant="secondary" onClick={() => setExportOpen(true)}>
          <Copy className="w-4 h-4" />
          Экспорт
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "chip whitespace-nowrap shrink-0 transition-colors",
                active ? "bg-primary text-white" : "bg-bg-surface text-secondary border border-bg-muted",
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      <motion.div
        key={tab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {tab === "overview" && <OverviewTab />}
        {tab === "client" && <ClientTab />}
        {tab === "offer" && <OfferTab />}
        {tab === "competitors" && <CompetitorsTab />}
        {tab === "economics" && <EconomicsTab />}
        {tab === "experiments" && <ExperimentsTab />}
        {tab === "payments" && <PaymentsTab />}
        {tab === "documents" && <DocumentsTab />}
        {tab === "plan" && <PlanTab />}
      </motion.div>

      <ExportModal open={exportOpen} onClose={() => setExportOpen(false)} />
    </div>
  );
}

// ===== helpers =====
function useHealth() {
  const metrics = useAppStore((s) => s.metrics);
  const interviews = useAppStore((s) => s.interviews);
  const payments = useAppStore((s) => s.payments);
  const financeInput = useAppStore((s) => s.financeInput);
  const moduleProgress = useAppStore((s) => s.moduleProgress);

  const offerDone =
    moduleProgress["m4"]?.status === "completed" ||
    moduleProgress["m4"]?.status === "credited_by_diagnostic";

  const margin = financeInput
    ? calculateFinance(financeInput).margin
    : 0;

  const items = [
    { id: "problem", label: "Доказанность проблемы", value: clampScore(metrics.interviews * 12) },
    { id: "offer", label: "Понятность оффера", value: offerDone ? 85 : 30 },
    { id: "interviews", label: "Реальные интервью", value: clampScore((interviews.length || metrics.interviews / 3) * 20) },
    { id: "payments_real", label: "Реальные платежи", value: clampScore(metrics.payments * 9) },
    { id: "margin", label: "Положительная маржа", value: margin > 0 ? clampScore(margin) : 15 },
    { id: "payinfra", label: "Платёжный сценарий", value: payments.length > 0 ? 90 : 20 },
  ];
  return items;
}

function clampScore(v: number): number {
  return Math.max(0, Math.min(100, Math.round(v)));
}

// ===== OVERVIEW =====
function OverviewTab() {
  const project = useAppStore((s) => s.project);
  const metrics = useAppStore((s) => s.metrics);
  const payments = useAppStore((s) => s.payments);
  const financeInput = useAppStore((s) => s.financeInput);
  const items = useHealth();

  const margin = financeInput ? calculateFinance(financeInput).margin : 0;
  const risk =
    metrics.payments === 0
      ? "Нет ни одного реального платежа — спрос пока не подтверждён деньгами."
      : margin <= 0 && financeInput
        ? "Маржа не положительная — каждая продажа не приносит прибыли."
        : payments.length === 0
          ? "Платёжная инфраструктура не подключена — сложно масштабировать приём оплат."
          : "Ключевые риски под контролем. Фокус — рост объёма и удержание.";

  const indicators: { id: string; label: string; tone: "ok" | "warn" | "off" }[] = [
    { id: "client", label: "Клиент", tone: metrics.interviews > 5 ? "ok" : metrics.interviews > 0 ? "warn" : "off" },
    { id: "product", label: "Продукт", tone: project?.description ? "ok" : "off" },
    { id: "demand", label: "Спрос", tone: metrics.leads > 0 ? "ok" : "off" },
    { id: "economics", label: "Экономика", tone: margin > 0 ? "ok" : financeInput ? "warn" : "off" },
    { id: "ops", label: "Операции", tone: metrics.payments > 0 ? "ok" : "off" },
    { id: "payments", label: "Платежи", tone: payments.length > 0 ? "ok" : "off" },
  ];

  return (
    <div className="grid lg:grid-cols-2 gap-5">
      <div className="space-y-5">
        <HealthScore items={items} />
        <RiskIndicator risk={risk} />
      </div>
      <div className="space-y-5">
        <div>
          <h3 className="section-title mb-3">Индикаторы бизнеса</h3>
          <IndicatorGrid items={indicators} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <MiniStat label="Оплаты" value={formatNumber(metrics.payments)} />
          <MiniStat label="Выручка" value={formatMoney(metrics.revenue)} />
          <MiniStat label="Интервью" value={formatNumber(metrics.interviews)} />
          <MiniStat label="Средний чек" value={formatMoney(metrics.averageCheck)} />
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-4">
      <p className="text-lg font-bold text-ink leading-none">{value}</p>
      <p className="text-xs text-secondary mt-1.5">{label}</p>
    </div>
  );
}

// ===== CLIENT / PROBLEM =====
function ClientTab() {
  const interviews = useAppStore((s) => s.interviews);
  const m2 = useAppStore((s) => s.moduleProgress["m2"]);
  const segment = (m2?.answers?.segment as string) ?? "";
  const conclusion = (m2?.answers?.conclusion as string) ?? "";

  return (
    <div className="space-y-4">
      {(segment || conclusion) && (
        <Card className="bg-primary-soft/40 border-primary/20">
          {segment && (
            <p className="text-sm">
              <span className="text-secondary">Сегмент: </span>
              <span className="font-medium text-ink">{segment}</span>
            </p>
          )}
          {conclusion && (
            <p className="text-sm mt-2">
              <span className="text-secondary">Вывод: </span>
              <span className="font-medium text-ink">{conclusion}</span>
            </p>
          )}
        </Card>
      )}

      {interviews.length === 0 ? (
        <EmptyState
          icon={<Users className="w-6 h-6" />}
          title="Пока нет интервью"
          description="Проведите интервью в блоке «Клиент и проблема» — они появятся здесь."
          action={
            <Link href="/course/m2">
              <Button size="sm">
                Перейти к блоку <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          <h3 className="section-title">Интервью ({interviews.length})</h3>
          {interviews.map((i) => (
            <Card key={i.id}>
              <div className="flex items-center justify-between gap-2 mb-2">
                <Badge tone="neutral">{i.segment}</Badge>
                <Badge tone={i.willingnessToPay ? "success" : "warning"}>
                  {i.willingnessToPay || "готовность неясна"}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Quote className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <p className="text-sm text-ink italic">{i.quote}</p>
              </div>
              {i.conclusion && (
                <p className="text-xs text-secondary mt-2 border-t border-bg-muted pt-2">
                  {i.conclusion}
                </p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ===== OFFER =====
function OfferTab() {
  const m4 = useAppStore((s) => s.moduleProgress["m4"]);
  const a = m4?.answers ?? {};
  const hasOffer = Object.keys(a).length > 0;

  const rows: { label: string; key: string }[] = [
    { label: "Для кого", key: "forWhom" },
    { label: "Проблема", key: "problem" },
    { label: "Результат", key: "result" },
    { label: "Механизм", key: "mechanism" },
    { label: "Доказательство", key: "proof" },
    { label: "CTA", key: "cta" },
  ];

  if (!hasOffer) {
    return (
      <EmptyState
        icon={<Tag className="w-6 h-6" />}
        title="Оффер ещё не собран"
        description="Сформулируйте оффер в блоке «Продукт, оффер и цена»."
        action={
          <Link href="/course/m4">
            <Button size="sm">
              Собрать оффер <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <h3 className="section-title mb-3">Ценностное предложение</h3>
        <div className="space-y-2.5">
          {rows.map((r) =>
            a[r.key] ? (
              <div key={r.key} className="flex gap-3 text-sm">
                <span className="text-secondary w-32 shrink-0">{r.label}</span>
                <span className="text-ink font-medium">{String(a[r.key])}</span>
              </div>
            ) : null,
          )}
        </div>
      </Card>
      <Card>
        <h3 className="section-title mb-3">Тарифная сетка</h3>
        <div className="grid grid-cols-3 gap-3">
          {(["priceLow", "priceMid", "priceHigh"] as const).map((k, i) => (
            <div
              key={k}
              className={cn(
                "rounded-2xl p-4 text-center border-2",
                i === 1 ? "border-primary bg-primary-soft" : "border-bg-muted",
              )}
            >
              <p className="text-xs text-secondary">
                {i === 0 ? "Базовый" : i === 1 ? "Оптимальный" : "Премиум"}
              </p>
              <p className="text-xl font-bold text-ink mt-1">
                {a[k] ? formatMoney(Number(a[k])) : "—"}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ===== COMPETITORS =====
function CompetitorsTab() {
  const competitors = useAppStore((s) => s.competitors);
  if (competitors.length === 0) {
    return (
      <EmptyState
        icon={<Swords className="w-6 h-6" />}
        title="Конкуренты не добавлены"
        description="Сравните 5–7 игроков в блоке «Рынок и конкуренты»."
        action={
          <Link href="/course/m3">
            <Button size="sm">
              К анализу рынка <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        }
      />
    );
  }
  return (
    <div className="space-y-3">
      {competitors.map((c) => (
        <Card key={c.id}>
          <div className="flex items-center justify-between gap-2 mb-2">
            <p className="font-semibold text-ink">{c.name}</p>
            <Badge tone="primary">{c.price}</Badge>
          </div>
          <p className="text-sm text-secondary">{c.product} · {c.customer}</p>
          <div className="grid sm:grid-cols-2 gap-2 mt-3 text-xs">
            <p className="text-success flex gap-1.5">
              <Check className="w-3.5 h-3.5 shrink-0 mt-0.5" /> {c.pros}
            </p>
            <p className="text-danger flex gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" /> {c.cons}
            </p>
          </div>
          {c.note && <p className="text-xs text-secondary mt-2 italic">{c.note}</p>}
        </Card>
      ))}
    </div>
  );
}

// ===== ECONOMICS =====
function EconomicsTab() {
  const financeInput = useAppStore((s) => s.financeInput);
  if (!financeInput) {
    return (
      <EmptyState
        icon={<Calculator className="w-6 h-6" />}
        title="Экономика ещё не посчитана"
        description="Заполните финансовую модель — CAC, LTV и точку безубыточности."
        action={
          <Link href="/finance">
            <Button size="sm">
              Посчитать экономику <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        }
      />
    );
  }
  const r = calculateFinance(financeInput);
  const stats = [
    { label: "Выручка", value: formatMoney(r.revenue) },
    { label: "Маржа", value: formatPercent(r.margin, 0) },
    { label: "CAC", value: formatMoney(r.cac) },
    { label: "LTV", value: formatMoney(r.ltv) },
    { label: "LTV/CAC", value: r.ltvCacRatio ? r.ltvCacRatio.toFixed(2) : "—" },
    {
      label: "Безубыточность",
      value: isFinite(r.breakEvenCustomers) ? `${r.breakEvenCustomers} кл.` : "—",
    },
  ];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {stats.map((s) => (
          <MiniStat key={s.label} label={s.label} value={s.value} />
        ))}
      </div>
      <Link href="/finance">
        <Card className="flex items-center justify-between hover:border-primary transition-colors">
          <span className="text-sm font-medium text-ink">Открыть полный калькулятор и сценарии</span>
          <ChevronRight className="w-5 h-5 text-primary" />
        </Card>
      </Link>
    </div>
  );
}

// ===== EXPERIMENTS =====
function ExperimentsTab() {
  const experiments = useAppStore((s) => s.experiments);
  if (experiments.length === 0) {
    return (
      <EmptyState
        icon={<FlaskConical className="w-6 h-6" />}
        title="Экспериментов пока нет"
        description="Запустите тест спроса и зафиксируйте результат."
        action={
          <Link href="/experiments">
            <Button size="sm">
              К экспериментам <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        }
      />
    );
  }
  return (
    <div className="space-y-3">
      {experiments.map((e) => (
        <Card key={e.id}>
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold text-ink">{e.name}</p>
            <Badge tone={e.status === "running" ? "warning" : "success"}>
              {e.status === "running" ? "Идёт" : e.status === "done" ? "Завершён" : "Остановлен"}
            </Badge>
          </div>
          <p className="text-sm text-secondary mt-1">{e.hypothesis}</p>
          <div className="flex gap-2 mt-3">
            <Badge tone="neutral">{e.leads} заявок</Badge>
            <Badge tone="success">{e.payments} оплат</Badge>
            <Badge tone="primary">{formatMoney(e.revenue)}</Badge>
          </div>
        </Card>
      ))}
      <Link href="/experiments">
        <Button variant="secondary" fullWidth>
          Управлять экспериментами <ArrowRight className="w-4 h-4" />
        </Button>
      </Link>
    </div>
  );
}

// ===== PAYMENTS =====
function PaymentsTab() {
  const payments = useAppStore((s) => s.payments);
  if (payments.length === 0) {
    return (
      <EmptyState
        icon={<CreditCard className="w-6 h-6" />}
        title="Платежи не подключены"
        description="Подберите платёжный комплект под ваш сценарий в мастере."
        action={
          <Link href="/payments">
            <Button size="sm">
              Подобрать платежи <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        }
      />
    );
  }
  return (
    <div className="space-y-3">
      {payments.map((p) => (
        <Card key={p.productId} className="flex items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-ink">{getModuleById("m8") ? p.productId.toUpperCase() : p.productId}</p>
            <p className="text-xs text-secondary">Подключено · mock</p>
          </div>
          {p.testTransaction && (
            <Badge tone={p.testTransaction.status === "success" ? "success" : "warning"}>
              Тест: {formatMoney(p.testTransaction.amount)}
            </Badge>
          )}
        </Card>
      ))}
      <Link href="/payments">
        <Button variant="secondary" fullWidth>
          Открыть мастер платежей <ArrowRight className="w-4 h-4" />
        </Button>
      </Link>
    </div>
  );
}

// ===== DOCUMENTS =====
function DocumentsTab() {
  const m7 = useAppStore((s) => s.moduleProgress["m7"]);
  const a = m7?.answers ?? {};
  const form = (a.form as string) ?? "";
  const checklist = (a.checklist as string[]) ?? [];

  return (
    <div className="space-y-4">
      <Card>
        <h3 className="section-title mb-3">Юридическая схема</h3>
        {form ? (
          <div className="space-y-2 text-sm">
            <p>
              <span className="text-secondary">Форма: </span>
              <span className="font-medium text-ink">{form}</span>
            </p>
            {a.b2b2c ? (
              <p>
                <span className="text-secondary">Модель: </span>
                <span className="font-medium text-ink">{String(a.b2b2c)}</span>
              </p>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-secondary">
            Выберите форму регистрации в блоке «Юридический запуск».
          </p>
        )}
      </Card>

      <Card>
        <h3 className="section-title mb-3">Чек-лист запуска</h3>
        {checklist.length > 0 ? (
          <ul className="space-y-2">
            {checklist.map((c, i) => (
              <li key={i} className="text-sm text-ink flex items-center gap-2">
                <Check className="w-4 h-4 text-success" /> {c}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-secondary">Чек-лист появится после блока 7.</p>
        )}
        <p className="text-xs text-secondary mt-4 bg-bg-muted/50 rounded-xl p-3">
          ⚠️ Это ориентир, а не юридическая консультация. Перед регистрацией проверьте детали со
          специалистом.
        </p>
      </Card>

      <Link href="/course/m7">
        <Button variant="secondary" fullWidth>
          Открыть блок «Юридический запуск» <ArrowRight className="w-4 h-4" />
        </Button>
      </Link>
    </div>
  );
}

// ===== PLAN / TRACK SELECT =====
function PlanTab() {
  const router = useRouter();
  const profile = useAppStore((s) => s.profile);
  const moduleProgress = useAppStore((s) => s.moduleProgress);
  const setProfile = useAppStore((s) => s.setProfile);
  const setProject = useAppStore((s) => s.setProject);
  const setModuleStatus = useAppStore((s) => s.setModuleStatus);
  const pushToast = useAppStore((s) => s.pushToast);

  const track = profile?.track ?? null;
  const commonDone = ["m1", "m2", "m3", "m4", "m5", "m6", "m7", "m8"].every((id) => {
    const st = moduleProgress[id]?.status;
    return st === "completed" || st === "credited_by_diagnostic";
  });

  const chooseTrack = (t: Track) => {
    setProfile({ track: t });
    setProject({ track: t });
    const firstId = t === "tech" ? "t9" : "r9";
    if (moduleProgress[firstId]?.status === "locked" || !moduleProgress[firstId]) {
      setModuleStatus(firstId, "available");
    }
    pushToast({
      title: t === "tech" ? "Трек «Технологический стартап»" : "Трек «Обычный бизнес»",
      description: "Карта курса обновлена.",
      variant: "success",
    });
    router.push("/home");
  };

  const trackModules = useMemo(
    () => (track ? getModulesForTrack(track).filter((m) => m.track !== "common") : []),
    [track],
  );

  return (
    <div className="space-y-5">
      {!track ? (
        <>
          {!commonDone && (
            <Card className="bg-warning/5 border-warning/20 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
              <p className="text-sm text-ink">
                Общая часть (блоки 1–8) ещё не завершена. Выбрать трек можно сейчас, но сначала
                рекомендуем пройти базу.
              </p>
            </Card>
          )}
          <h3 className="section-title">Выберите трек развития</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <TrackCard
              icon={<Cpu className="w-6 h-6" />}
              title="Технологический стартап"
              description="Гипотезы, MVP, первые пользователи, монетизация, платформа и рост."
              points={["Карта гипотез", "Прототип и MVP", "Модели монетизации", "Инвестиции"]}
              onSelect={() => chooseTrack("tech")}
            />
            <TrackCard
              icon={<Store className="w-6 h-6" />}
              title="Обычный бизнес"
              description="Услуги, бьюти, HoReCa, розница, производство: продажи и операционка."
              points={["Ассортимент и цены", "Организация продаж", "Управление финансами", "Удержание"]}
              onSelect={() => chooseTrack("regular")}
            />
          </div>
        </>
      ) : (
        <>
          <Card className="bg-primary-soft/40 border-primary/20 flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-primary text-white flex items-center justify-center shrink-0">
              {track === "tech" ? <Cpu className="w-5 h-5" /> : <Store className="w-5 h-5" />}
            </div>
            <div>
              <p className="font-semibold text-ink">
                {track === "tech" ? "Технологический стартап" : "Обычный бизнес"}
              </p>
              <p className="text-sm text-secondary">Ваш выбранный трек развития</p>
            </div>
          </Card>

          <div>
            <h3 className="section-title mb-3">Дорожная карта трека</h3>
            <div className="space-y-2.5">
              {trackModules.map((m) => {
                const st = moduleProgress[m.id]?.status ?? "locked";
                const done = st === "completed" || st === "credited_by_diagnostic";
                const locked = st === "locked";
                return (
                  <Link key={m.id} href={locked ? "#" : `/course/${m.id}`}>
                    <Card
                      className={cn(
                        "flex items-center gap-3 transition-colors",
                        !locked && "hover:border-primary",
                        locked && "opacity-60",
                      )}
                    >
                      <div
                        className={cn(
                          "w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0",
                          done
                            ? "bg-success text-white"
                            : locked
                              ? "bg-bg-muted text-secondary"
                              : "bg-primary text-white",
                        )}
                      >
                        {done ? <Check className="w-5 h-5" /> : m.number}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-ink truncate">{m.title}</p>
                        <p className="text-xs text-secondary truncate">{m.description}</p>
                      </div>
                      {!locked && <ChevronRight className="w-5 h-5 text-secondary shrink-0" />}
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>

          <Card className="flex items-center gap-3">
            <Rocket className="w-5 h-5 text-primary" />
            <p className="text-sm text-secondary flex-1">Хотите сменить трек?</p>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setProfile({ track: null });
                setProject({ track: null });
              }}
            >
              Сбросить трек
            </Button>
          </Card>
        </>
      )}
    </div>
  );
}

function TrackCard({
  icon,
  title,
  description,
  points,
  onSelect,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  points: string[];
  onSelect: () => void;
}) {
  return (
    <motion.div whileHover={{ y: -3 }}>
      <Card className="h-full flex flex-col">
        <div className="w-12 h-12 rounded-2xl bg-primary-soft text-primary flex items-center justify-center mb-3">
          {icon}
        </div>
        <h4 className="font-semibold text-ink text-lg">{title}</h4>
        <p className="text-sm text-secondary mt-1">{description}</p>
        <ul className="space-y-1.5 mt-3 flex-1">
          {points.map((p) => (
            <li key={p} className="text-sm text-ink flex items-center gap-2">
              <Check className="w-4 h-4 text-primary" /> {p}
            </li>
          ))}
        </ul>
        <Button fullWidth className="mt-4" onClick={onSelect}>
          Выбрать этот трек <ArrowRight className="w-4 h-4" />
        </Button>
      </Card>
    </motion.div>
  );
}

// ===== EXPORT =====
function ExportModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const project = useAppStore((s) => s.project);
  const profile = useAppStore((s) => s.profile);
  const metrics = useAppStore((s) => s.metrics);
  const pushToast = useAppStore((s) => s.pushToast);
  const [copied, setCopied] = useState(false);
  const textRef = useRef<string>("");

  const summary = useMemo(() => {
    const lines = [
      `ПРОЕКТ: ${project?.name ?? "—"}`,
      project?.description ? `Описание: ${project.description}` : "",
      `Стадия: ${profile?.stage === "idea" ? "Идея" : profile?.stage === "mvp" ? "MVP" : "Продажи"}`,
      profile?.track ? `Трек: ${profile.track === "tech" ? "Технологический стартап" : "Обычный бизнес"}` : "",
      "",
      "МЕТРИКИ:",
      `• Интервью: ${metrics.interviews}`,
      `• Заявки: ${metrics.leads}`,
      `• Оплаты: ${metrics.payments}`,
      `• Выручка: ${formatMoney(metrics.revenue)}`,
      `• Средний чек: ${formatMoney(metrics.averageCheck)}`,
      `• CAC: ${formatMoney(metrics.cac)}`,
      "",
      "ПЛАН НА 30 ДНЕЙ:",
      "1. Довести проверку спроса до стабильных оплат.",
      "2. Улучшить экономику и удержание.",
      "3. Подключить подходящую платёжную инфраструктуру и масштабировать канал.",
    ].filter(Boolean);
    const text = lines.join("\n");
    textRef.current = text;
    return text;
  }, [project, profile, metrics]);

  const copy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(textRef.current).catch(() => {});
    }
    setCopied(true);
    pushToast({ title: "Скопировано в буфер", variant: "success" });
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Modal open={open} onClose={onClose} title="Экспорт проекта" subtitle="Карточка для Demo Day" size="md">
      <pre className="text-xs text-ink bg-bg-muted/50 rounded-2xl p-4 whitespace-pre-wrap font-sans leading-relaxed max-h-[50vh] overflow-y-auto">
        {summary}
      </pre>
      <Button fullWidth className="mt-4" onClick={copy}>
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        {copied ? "Скопировано" : "Скопировать"}
      </Button>
    </Modal>
  );
}
