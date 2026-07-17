"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  FlaskConical,
  Trash2,
  TrendingUp,
  Target,
  Sparkles,
  Play,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell } from "@/components/shell/AppShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input, Label, Textarea, Select } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAppStore } from "@/store/useAppStore";
import {
  calcExperimentMetrics,
  experimentRecommendation,
  funnelStages,
} from "@/lib/experiments";
import { formatMoney, formatNumber, formatPercent, cn } from "@/lib/utils";
import type { Experiment } from "@/types";

export default function ExperimentsPage() {
  return (
    <AppShell>
      <ExperimentsContent />
    </AppShell>
  );
}

function ExperimentsContent() {
  const experiments = useAppStore((s) => s.experiments);
  const addExperiment = useAppStore((s) => s.addExperiment);
  const removeExperiment = useAppStore((s) => s.removeExperiment);
  const updateExperiment = useAppStore((s) => s.updateExperiment);
  const pushToast = useAppStore((s) => s.pushToast);

  const [open, setOpen] = useState(false);
  const [removeId, setRemoveId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(experiments[0]?.id ?? null);

  return (
    <div className="max-w-[1000px] mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Эксперименты</h1>
          <p className="text-secondary mt-1">Тестируйте гипотезы и измеряйте реальную воронку</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4" />
          Новый
        </Button>
      </div>

      {experiments.length === 0 ? (
        <EmptyState
          icon={<FlaskConical className="w-6 h-6" />}
          title="Пока нет экспериментов"
          description="Создайте первый тест гипотезы: канал, бюджет, цель — и фиксируйте результат"
          action={
            <Button onClick={() => setOpen(true)}>
              <Plus className="w-4 h-4" />
              Создать эксперимент
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {experiments.map((exp) => (
            <ExperimentCard
              key={exp.id}
              exp={exp}
              expanded={expanded === exp.id}
              onToggle={() => setExpanded(expanded === exp.id ? null : exp.id)}
              onUpdate={(patch) => updateExperiment(exp.id, patch)}
              onRemove={() => setRemoveId(exp.id)}
            />
          ))}
        </div>
      )}

      <ExperimentModal
        open={open}
        onClose={() => setOpen(false)}
        onCreate={(exp) => {
          addExperiment(exp);
          setOpen(false);
          pushToast({ title: "Эксперимент создан", variant: "success" });
        }}
      />

      <ConfirmDialog
        open={!!removeId}
        onClose={() => setRemoveId(null)}
        onConfirm={() => {
          if (removeId) {
            removeExperiment(removeId);
            pushToast({ title: "Эксперимент удалён", variant: "default" });
          }
        }}
        title="Удалить эксперимент?"
        description="Все данные будут потеряны."
        confirmLabel="Удалить"
        danger
      />
    </div>
  );
}

function ExperimentCard({
  exp,
  expanded,
  onToggle,
  onUpdate,
  onRemove,
}: {
  exp: Experiment;
  expanded: boolean;
  onToggle: () => void;
  onUpdate: (patch: Partial<Experiment>) => void;
  onRemove: () => void;
}) {
  const metrics = calcExperimentMetrics(exp);
  const rec = experimentRecommendation(exp, metrics);
  const funnel = funnelStages(exp);

  const statusTone =
    exp.status === "running" ? "primary" : exp.status === "done" ? "success" : "neutral";
  const statusLabel =
    exp.status === "running" ? "Идёт" : exp.status === "done" ? "Завершён" : "Остановлен";

  const recTone =
    rec.action === "continue" ? "success" : rec.action === "change" ? "warning" : "danger";
  const recLabel = rec.action === "continue" ? "Продолжить" : rec.action === "change" ? "Изменить" : "Закрыть";

  return (
    <Card className="overflow-hidden p-0">
      <button onClick={onToggle} className="w-full p-5 text-left">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <Badge tone={statusTone as never}>{statusLabel}</Badge>
              <span className="chip bg-bg-muted text-secondary text-[10px]">
                {exp.channel}
              </span>
            </div>
            <h3 className="font-semibold text-ink leading-tight">{exp.name}</h3>
            <p className="text-sm text-secondary mt-1 line-clamp-2">{exp.hypothesis}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-secondary">ROAS</p>
            <p className={cn("text-xl font-bold", metrics.roas >= 100 ? "text-success" : metrics.roas >= 50 ? "text-warning" : "text-danger")}>
              {formatPercent(metrics.roas, 0)}
            </p>
          </div>
        </div>

        {/* Mini funnel */}
        <div className="flex items-center gap-1 mt-4">
          {funnel.map((f, i) => (
            <div key={f.stage} className="flex-1">
              <div
                className="h-2 rounded-full"
                style={{
                  background: f.color,
                  opacity: 0.4 + 0.6 * (f.value / (funnel[0]?.value || 1)),
                }}
              />
              <p className="text-[10px] text-secondary mt-1 truncate">{f.stage}</p>
              <p className="text-xs font-semibold text-ink">{formatNumber(f.value)}</p>
            </div>
          ))}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-bg-muted"
          >
            <div className="p-5 space-y-4">
              {/* Цели vs факт */}
              <div className="grid grid-cols-3 gap-3">
                <Stat label="Бюджет" value={formatMoney(exp.budget)} />
                <Stat label="Цель оплаты" value={formatNumber(exp.targetPayments)} />
                <Stat label="Факт оплат" value={formatNumber(exp.payments)} tone={exp.payments >= exp.targetPayments ? "success" : "default"} />
              </div>

              {/* Метрики */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-secondary mb-2">
                  Рассчитанные метрики
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <Metric label="CTR" value={formatPercent(metrics.ctr)} />
                  <Metric label="Conv → Lead" value={formatPercent(metrics.convToLead)} />
                  <Metric label="Conv → Paid" value={formatPercent(metrics.convToPaid)} />
                  <Metric label="CPL" value={formatMoney(metrics.cpl)} />
                  <Metric label="CAC" value={formatMoney(metrics.cac)} />
                  <Metric label="ROAS" value={formatPercent(metrics.roas, 0)} />
                  <Metric label="Ср. чек" value={formatMoney(metrics.avgCheck)} />
                  <Metric label="Выручка" value={formatMoney(exp.revenue)} />
                </div>
              </div>

              {/* AI рекомендация */}
              <div
                className={cn(
                  "rounded-2xl border-2 p-4",
                  recTone === "success"
                    ? "border-success/30 bg-success/5"
                    : recTone === "warning"
                      ? "border-warning/30 bg-warning/5"
                      : "border-danger/30 bg-danger/5",
                )}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <Sparkles className={cn("w-4 h-4", recTone === "success" ? "text-success" : recTone === "warning" ? "text-warning" : "text-danger")} />
                  <Badge tone={recTone as never}>{recLabel}</Badge>
                </div>
                <p className="text-sm text-ink">{rec.reason}</p>
              </div>

              {/* Редактируемые факт-данные */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-secondary mb-2">
                  Фактические данные
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <EditableNum label="Показы" value={exp.impressions} onChange={(v) => onUpdate({ impressions: v })} />
                  <EditableNum label="Переходы" value={exp.clicks} onChange={(v) => onUpdate({ clicks: v })} />
                  <EditableNum label="Заявки" value={exp.leads} onChange={(v) => onUpdate({ leads: v })} />
                  <EditableNum label="Оплаты" value={exp.payments} onChange={(v) => onUpdate({ payments: v })} />
                  <EditableNum label="Выручка, ₽" value={exp.revenue} onChange={(v) => onUpdate({ revenue: v })} />
                  <EditableNum label="Расход, ₽" value={exp.spend} onChange={(v) => onUpdate({ spend: v })} />
                </div>
              </div>

              {/* Воронка (график) */}
              <div className="h-[160px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={funnel}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8E8EA" vertical={false} />
                    <XAxis dataKey="stage" tick={{ fontSize: 11, fill: "#6B6B73" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#6B6B73" }} axisLine={false} tickLine={false} />
                    <RTooltip contentStyle={{ borderRadius: 16, border: "1px solid #E8E8EA", fontSize: 12 }} />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {funnel.map((f, i) => (
                        <Cell key={i} fill={f.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="flex gap-2">
                {exp.status === "running" && (
                  <Button size="sm" variant="secondary" onClick={() => onUpdate({ status: "done" })}>
                    Завершить
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={onRemove} className="text-danger">
                  <Trash2 className="w-4 h-4" /> Удалить
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

function Stat({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "success" }) {
  return (
    <div className="rounded-2xl bg-bg-muted/40 p-3">
      <p className="text-xs text-secondary">{label}</p>
      <p className={cn("text-lg font-bold mt-0.5", tone === "success" ? "text-success" : "text-ink")}>{value}</p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-bg-muted/30 p-2.5">
      <p className="text-[10px] text-secondary">{label}</p>
      <p className="text-sm font-semibold text-ink mt-0.5">{value}</p>
    </div>
  );
}

function EditableNum({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <Label>{label}</Label>
      <Input
        type="number"
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
      />
    </div>
  );
}

function ExperimentModal({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (exp: Omit<Experiment, "id">) => void;
}) {
  const [form, setForm] = useState({
    name: "",
    hypothesis: "",
    channel: "Telegram-чат",
    budget: 3000,
    expectedTraffic: 200,
    targetLeads: 20,
    targetPayments: 5,
    durationDays: 7,
    successCriteria: "",
  });

  const valid = form.name.trim().length > 0 && form.hypothesis.trim().length > 0;

  const submit = () => {
    if (!valid) return;
    onCreate({
      ...form,
      impressions: 0,
      clicks: 0,
      leads: 0,
      payments: 0,
      revenue: 0,
      spend: form.budget,
      status: "running",
    });
    setForm({
      name: "",
      hypothesis: "",
      channel: "Telegram-чат",
      budget: 3000,
      expectedTraffic: 200,
      targetLeads: 20,
      targetPayments: 5,
      durationDays: 7,
      successCriteria: "",
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Новый эксперимент"
      subtitle="Опишите гипотезу и критерии успеха"
      footer={
        <div className="flex gap-3">
          <Button variant="secondary" fullWidth onClick={onClose}>
            Отмена
          </Button>
          <Button fullWidth disabled={!valid} onClick={submit}>
            <Play className="w-4 h-4" />
            Запустить
          </Button>
        </div>
      }
    >
      <div className="space-y-3">
        <div>
          <Label required>Название</Label>
          <Input
            placeholder="Запуск у общежития №3"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div>
          <Label required>Гипотеза</Label>
          <Textarea
            placeholder="10 студентов оплатят бронь кофе за 150₽ за 7 дней"
            value={form.hypothesis}
            onChange={(e) => setForm({ ...form, hypothesis: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Канал</Label>
            <Select value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })}>
              <option>Telegram-чат</option>
              <option>ВКонтакте</option>
              <option>Яндекс.Директ</option>
              <option>Стикеры офлайн</option>
              <option>Реферальная программа</option>
              <option>Другое</option>
            </Select>
          </div>
          <div>
            <Label>Бюджет, ₽</Label>
            <Input
              type="number"
              value={form.budget}
              onChange={(e) => setForm({ ...form, budget: Number(e.target.value) })}
            />
          </div>
          <div>
            <Label>Цель по заявкам</Label>
            <Input
              type="number"
              value={form.targetLeads}
              onChange={(e) => setForm({ ...form, targetLeads: Number(e.target.value) })}
            />
          </div>
          <div>
            <Label>Цель по оплатам</Label>
            <Input
              type="number"
              value={form.targetPayments}
              onChange={(e) => setForm({ ...form, targetPayments: Number(e.target.value) })}
            />
          </div>
        </div>
        <div>
          <Label>Критерий успеха</Label>
          <Input
            placeholder="≥5 оплат, CAC < 800₽"
            value={form.successCriteria}
            onChange={(e) => setForm({ ...form, successCriteria: e.target.value })}
          />
        </div>
      </div>
    </Modal>
  );
}
