"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  TrendingUp,
  Wallet,
  PiggyBank,
  Target,
  Info,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { AppShell } from "@/components/shell/AppShell";
import { Card } from "@/components/ui/Card";
import { Input, Label } from "@/components/ui/Field";
import { Badge } from "@/components/ui/Badge";
import { Tooltip } from "@/components/ui/Tooltip";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useAppStore } from "@/store/useAppStore";
import {
  applyScenario,
  calculateFinance,
  financeVerdict,
  FINANCE_TOOLTIPS,
} from "@/lib/finance";
import { formatMoney, formatPercent, cn } from "@/lib/utils";
import type { FinanceInput, Scenario } from "@/types";

const DEFAULT_INPUT: FinanceInput = {
  price: 250,
  variableCost: 50,
  fixedCost: 30000,
  adBudget: 5000,
  leads: 200,
  customers: 80,
  purchasesPerCustomer: 1,
  customerLifetimeMonths: 3,
  taxRate: 6,
  cashReserve: 50000,
};

export default function FinancePage() {
  return (
    <AppShell>
      <FinanceContent />
    </AppShell>
  );
}

function FinanceContent() {
  const financeInput = useAppStore((s) => s.financeInput);
  const setFinanceInput = useAppStore((s) => s.setFinanceInput);
  const pushToast = useAppStore((s) => s.pushToast);

  const [input, setInput] = useState<FinanceInput>(financeInput ?? DEFAULT_INPUT);
  const [scenario, setScenario] = useState<Scenario>("base");

  const update = (key: keyof FinanceInput, value: number) => {
    const next = { ...input, [key]: value };
    setInput(next);
    setFinanceInput(next);
  };

  const scenarioInput = useMemo(() => applyScenario(input, scenario), [input, scenario]);
  const result = useMemo(() => calculateFinance(scenarioInput), [scenarioInput]);
  const verdict = useMemo(() => financeVerdict(result), [result]);

  // Данные для графиков
  const revenueExpenseData = useMemo(() => {
    const months = 6;
    return Array.from({ length: months }, (_, i) => {
      const growth = 1 + i * 0.15;
      return {
        month: `${i + 1} мес`,
        Выручка: Math.round(result.revenue * growth),
        Расходы: Math.round((result.revenue - result.operatingProfit) * (1 + i * 0.05)),
      };
    });
  }, [result]);

  const profitByCustomers = useMemo(() => {
    const max = Math.max(20, Math.round((result.breakEvenCustomers || 10) * 1.8));
    const step = Math.max(1, Math.round(max / 8));
    return Array.from({ length: 9 }, (_, i) => {
      const c = i * step;
      const profit = c * (input.price - input.variableCost) - input.fixedCost - input.adBudget;
      return { customers: c, Прибыль: Math.round(profit) };
    });
  }, [result, input]);

  const costStructure = useMemo(() => {
    const varTotal = input.variableCost * input.customers * input.purchasesPerCustomer;
    return [
      { name: "Переменные", value: Math.round(varTotal), color: "#F2A100" },
      { name: "Постоянные", value: input.fixedCost, color: "#6B6B73" },
      { name: "Реклама", value: input.adBudget, color: "#EF3124" },
      { name: "Налоги", value: Math.round(result.revenue * (input.taxRate / 100)), color: "#242424" },
    ].filter((x) => x.value > 0);
  }, [input, result]);

  return (
    <div className="max-w-[1100px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Финансы бизнеса</h1>
        <p className="text-secondary mt-1">
          Реальные формулы. Меняйте цифры — расчёты и графики обновляются сразу.
        </p>
      </div>

      <div className="grid lg:grid-cols-[360px_1fr] gap-6">
        {/* Input */}
        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="section-title mb-4">Вводные данные</h3>
            <div className="grid grid-cols-2 gap-3">
              <NumberField label="Цена" unit="₽" value={input.price} onChange={(v) => update("price", v)} />
              <NumberField label="Переменные затраты" unit="₽" value={input.variableCost} onChange={(v) => update("variableCost", v)} />
              <NumberField label="Постоянные расходы" unit="₽/мес" value={input.fixedCost} onChange={(v) => update("fixedCost", v)} />
              <NumberField label="Реклама" unit="₽/мес" value={input.adBudget} onChange={(v) => update("adBudget", v)} />
              <NumberField label="Лиды" unit="/мес" value={input.leads} onChange={(v) => update("leads", v)} />
              <NumberField label="Клиенты" unit="/мес" value={input.customers} onChange={(v) => update("customers", v)} />
              <NumberField label="Покупок на клиента" value={input.purchasesPerCustomer} onChange={(v) => update("purchasesPerCustomer", v)} />
              <NumberField label="Срок жизни" unit="мес" value={input.customerLifetimeMonths} onChange={(v) => update("customerLifetimeMonths", v)} />
              <NumberField label="Налог" unit="%" value={input.taxRate} onChange={(v) => update("taxRate", v)} />
              <NumberField label="Запас денег" unit="₽" value={input.cashReserve} onChange={(v) => update("cashReserve", v)} />
            </div>
            <button
              onClick={() => {
                setInput(DEFAULT_INPUT);
                setFinanceInput(DEFAULT_INPUT);
                pushToast({ title: "Сброшено к демо-значениям", variant: "default" });
              }}
              className="text-xs text-secondary hover:text-primary mt-4"
            >
              Сбросить к демо
            </button>
          </Card>

          {/* AI verdict */}
          <Card
            className={cn(
              "p-5 border-2",
              verdict.status === "ok"
                ? "border-success/30 bg-success/5"
                : verdict.status === "warning"
                  ? "border-warning/30 bg-warning/5"
                  : "border-danger/30 bg-danger/5",
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center",
                  verdict.status === "ok"
                    ? "bg-success/10 text-success"
                    : verdict.status === "warning"
                      ? "bg-warning/15 text-warning"
                      : "bg-danger/10 text-danger",
                )}
              >
                <Sparkles className="w-4 h-4" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wide text-secondary">AI-вывод</p>
            </div>
            <p className="font-semibold text-ink">{verdict.title}</p>
            <p className="text-sm text-secondary mt-1">{verdict.text}</p>
          </Card>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {/* Scenario switch */}
          <div className="flex gap-2">
            {(["pessimistic", "base", "optimistic"] as Scenario[]).map((s) => (
              <button
                key={s}
                onClick={() => setScenario(s)}
                className={cn(
                  "flex-1 chip justify-center cursor-pointer transition-colors",
                  scenario === s
                    ? "bg-primary text-white"
                    : "bg-bg-surface border border-bg-muted text-ink hover:border-primary",
                )}
              >
                {s === "pessimistic" ? "Пессимистичный" : s === "base" ? "Базовый" : "Оптимистичный"}
              </button>
            ))}
          </div>

          {/* Main metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            <MetricBox
              icon={<Wallet className="w-4 h-4" />}
              label="Выручка"
              value={formatMoney(result.revenue)}
              tooltip={FINANCE_TOOLTIPS.revenue}
            />
            <MetricBox
              icon={<TrendingUp className="w-4 h-4" />}
              label="Валовая прибыль"
              value={formatMoney(result.grossProfit)}
              tooltip={FINANCE_TOOLTIPS.grossProfit}
            />
            <MetricBox
              icon={<PiggyBank className="w-4 h-4" />}
              label="Маржинальность"
              value={formatPercent(result.margin)}
              tooltip={FINANCE_TOOLTIPS.margin}
              tone={result.margin >= 30 ? "success" : result.margin >= 10 ? "warning" : "danger"}
            />
            <MetricBox
              icon={<Wallet className="w-4 h-4" />}
              label="Операционная прибыль"
              value={formatMoney(result.operatingProfit)}
              tooltip={FINANCE_TOOLTIPS.operatingProfit}
              tone={result.operatingProfit >= 0 ? "success" : "danger"}
            />
            <MetricBox
              icon={<Target className="w-4 h-4" />}
              label="CAC"
              value={formatMoney(result.cac)}
              tooltip={FINANCE_TOOLTIPS.cac}
            />
            <MetricBox
              icon={<TrendingUp className="w-4 h-4" />}
              label="LTV"
              value={formatMoney(result.ltv)}
              tooltip={FINANCE_TOOLTIPS.ltv}
            />
            <MetricBox
              icon={<Sparkles className="w-4 h-4" />}
              label="LTV / CAC"
              value={result.ltvCacRatio > 0 ? result.ltvCacRatio.toFixed(2) : "—"}
              tooltip={FINANCE_TOOLTIPS.ltvCacRatio}
              tone={result.ltvCacRatio >= 3 ? "success" : result.ltvCacRatio >= 1 ? "warning" : "danger"}
            />
            <MetricBox
              icon={<Target className="w-4 h-4" />}
              label="Безубыточность"
              value={isFinite(result.breakEvenCustomers) ? `${result.breakEvenCustomers} кл.` : "∞"}
              tooltip={FINANCE_TOOLTIPS.breakEvenCustomers}
            />
            <MetricBox
              icon={<PiggyBank className="w-4 h-4" />}
              label="Runway"
              value={isFinite(result.runwayMonths) ? `${Math.round(result.runwayMonths)} мес` : "∞"}
              tooltip={FINANCE_TOOLTIPS.runwayMonths}
            />
          </div>

          {/* Charts */}
          <Card className="p-5">
            <h3 className="section-title mb-4">Выручка и расходы (6 месяцев)</h3>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueExpenseData}>
                  <defs>
                    <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#EF3124" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#EF3124" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gExp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#242424" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#242424" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8E8EA" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#6B6B73" }} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#6B6B73" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}к`}
                  />
                  <RTooltip
                    formatter={(v: number) => formatMoney(v)}
                    contentStyle={{
                      borderRadius: 16,
                      border: "1px solid #E8E8EA",
                      fontSize: 12,
                    }}
                  />
                  <Area type="monotone" dataKey="Выручка" stroke="#EF3124" strokeWidth={2.5} fill="url(#gRev)" />
                  <Area type="monotone" dataKey="Расходы" stroke="#242424" strokeWidth={2} fill="url(#gExp)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <div className="grid lg:grid-cols-2 gap-4">
            <Card className="p-5">
              <h3 className="section-title mb-4">Прибыль по числу клиентов</h3>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={profitByCustomers}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8E8EA" vertical={false} />
                    <XAxis dataKey="customers" tick={{ fontSize: 12, fill: "#6B6B73" }} axisLine={false} tickLine={false} />
                    <YAxis
                      tick={{ fontSize: 12, fill: "#6B6B73" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `${(v / 1000).toFixed(0)}к`}
                    />
                    <RTooltip
                      formatter={(v: number) => formatMoney(v)}
                      contentStyle={{ borderRadius: 16, border: "1px solid #E8E8EA", fontSize: 12 }}
                    />
                    <ReferenceLine y={0} stroke="#D92D20" strokeDasharray="4 4" />
                    <Line type="monotone" dataKey="Прибыль" stroke="#EF3124" strokeWidth={2.5} dot={{ r: 3, fill: "#EF3124" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-secondary mt-2">
                Точка безубыточности: <span className="font-semibold text-ink">{isFinite(result.breakEvenCustomers) ? `${result.breakEvenCustomers} клиентов` : "недостижима"}</span>
              </p>
            </Card>

            <Card className="p-5">
              <h3 className="section-title mb-4">Структура затрат</h3>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={costStructure}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                    >
                      {costStructure.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <RTooltip
                      formatter={(v: number) => formatMoney(v)}
                      contentStyle={{ borderRadius: 16, border: "1px solid #E8E8EA", fontSize: 12 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-3 mt-3">
                {costStructure.map((c) => (
                  <div key={c.name} className="flex items-center gap-1.5 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: c.color }} />
                    <span className="text-secondary">{c.name}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <Card className="p-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center shrink-0">
                <Info className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-ink">Допустимый CAC</h3>
                <p className="text-sm text-secondary mt-1">
                  Максимальная стоимость привлечения клиента при LTV/CAC = 3:
                  <span className="font-semibold text-ink ml-1">{formatMoney(result.maxAllowableCac)}</span>
                  . Запас прочности: <span className="font-semibold text-ink">{formatPercent(result.safetyMargin)}</span>.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function NumberField({
  label,
  unit,
  value,
  onChange,
}: {
  label: string;
  unit?: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <Input
        type="number"
        inputMode="numeric"
        value={value}
        unit={unit}
        onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
      />
    </div>
  );
}

function MetricBox({
  icon,
  label,
  value,
  tooltip,
  tone = "default",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tooltip?: string;
  tone?: "default" | "success" | "warning" | "danger";
}) {
  const toneClass =
    tone === "success"
      ? "text-success"
      : tone === "warning"
        ? "text-warning"
        : tone === "danger"
          ? "text-danger"
          : "text-ink";
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="w-8 h-8 rounded-xl bg-primary-soft text-primary flex items-center justify-center">
          {icon}
        </div>
        {tooltip && (
          <Tooltip content={tooltip}>
            <Info className="w-3.5 h-3.5 text-secondary cursor-help" />
          </Tooltip>
        )}
      </div>
      <p className={cn("text-xl font-bold leading-none", toneClass)}>{value}</p>
      <p className="text-xs text-secondary mt-1.5">{label}</p>
    </div>
  );
}
