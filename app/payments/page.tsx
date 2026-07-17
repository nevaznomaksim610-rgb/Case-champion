"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Sparkles,
  Zap,
  Plug,
  CheckCircle2,
  Receipt,
  RotateCcw,
  ShoppingCart,
  AlertCircle,
} from "lucide-react";
import { AppShell } from "@/components/shell/AppShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input, Label } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAppStore } from "@/store/useAppStore";
import { DEFAULT_PAYMENT_ANSWERS, recommendPayments, validateAlfaPosVsMpos } from "@/lib/payments";
import { cn, formatMoney, todayISO } from "@/lib/utils";
import type { PaymentAnswers, PaymentRecommendation, PaymentProductId } from "@/types";

interface WizardStep {
  id: keyof PaymentAnswers;
  question: string;
  help?: string;
}

const STEPS: WizardStep[] = [
  { id: "online", question: "Принимаете оплату онлайн?", help: "Дистанционно, без встречи с клиентом" },
  { id: "offlineStationary", question: "Есть стационарная точка?", help: "Магазин, кафе, офис" },
  { id: "onTheGo", question: "Работаете на выезде?", help: "Доставка, выездные услуги" },
  { id: "siteOrApp", question: "Есть сайт или приложение?" },
  { id: "needsReceipt", question: "Нужны кассовые чеки?", help: "Фискализация по закону" },
  { id: "averageCheck", question: "Какой средний чек?", help: "Влияет на выбор «Подели»" },
  { id: "employeesOrContractors", question: "Есть сотрудники или исполнители?" },
  { id: "regularPayouts", question: "Нужны регулярные выплаты?", help: "Зарплаты, гонорары" },
  { id: "tips", question: "Принимаете чаевые?" },
  { id: "multiSided", question: "Маркетплейс или платформа?", help: "Несколько сторон платежей" },
  { id: "highFlow", question: "Большой поток клиентов?" },
  { id: "payInParts", question: "Нужна оплата частями?" },
];

export default function PaymentsPage() {
  return (
    <AppShell>
      <PaymentsContent />
    </AppShell>
  );
}

function PaymentsContent() {
  const payments = useAppStore((s) => s.payments);
  const connectPayment = useAppStore((s) => s.connectPayment);
  const disconnectPayment = useAppStore((s) => s.disconnectPayment);
  const setPaymentAnswers = useAppStore((s) => s.setPaymentAnswers);
  const savedAnswers = useAppStore((s) => s.paymentAnswers);
  const pushToast = useAppStore((s) => s.pushToast);
  const completeModule = useAppStore((s) => s.completeModule);

  const [wizardOpen, setWizardOpen] = useState(false);
  const [connectedModal, setConnectedModal] = useState<string | null>(null);
  const [testModal, setTestModal] = useState<string | null>(null);
  const [resetOpen, setResetOpen] = useState(false);

  const answers = savedAnswers ?? DEFAULT_PAYMENT_ANSWERS;
  const recs = recommendPayments(answers);
  const validation = validateAlfaPosVsMpos(recs);

  const handleConnect = (productId: PaymentProductId) => {
    connectPayment({ productId });
    setConnectedModal(productId);
    pushToast({ title: "Продукт подключён (mock)", variant: "success" });
    // Зачесть блок 8 если ещё не зачтён
    completeModule("m8");
  };

  const hasAnswers = savedAnswers !== null;

  return (
    <div className="max-w-[1000px] mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Платежи</h1>
          <p className="text-secondary mt-1">
            Персональный комплект продуктов Альфа-Банка под ваш сценарий
          </p>
        </div>
        {payments.length > 0 && (
          <Button variant="ghost" onClick={() => setResetOpen(true)} className="text-danger">
            <RotateCcw className="w-4 h-4" />
            Сбросить
          </Button>
        )}
      </div>

      {/* Wizard CTA или результат */}
      {!hasAnswers ? (
        <Card className="p-8 text-center bg-gradient-to-br from-primary-soft/60 to-bg-surface border-primary/20">
          <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-ink">Подберём ваши платежи</h2>
          <p className="text-secondary mt-2 max-w-md mx-auto">
            Ответьте на 12 коротких вопросов — подберём комплект продуктов и объясним каждый выбор. AlfaPOS и mPOS не будут смешаны.
          </p>
          <Button size="lg" className="mt-5" onClick={() => setWizardOpen(true)}>
            <Plug className="w-5 h-5" />
            Подобрать платежи
          </Button>
        </Card>
      ) : (
        <>
          {/* Сводка ответов */}
          <Card className="p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-secondary">Ваш сценарий</p>
                <p className="font-semibold text-ink mt-0.5">{summarizeScenario(answers)}</p>
              </div>
              <Button size="sm" variant="secondary" onClick={() => setWizardOpen(true)}>
                Изменить ответы
              </Button>
            </div>
          </Card>

          {/* Validation note */}
          {validation.note && (
            <div className="rounded-2xl bg-warning/5 border border-warning/20 p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
              <p className="text-sm text-ink">{validation.note}</p>
            </div>
          )}

          {/* Рекомендации */}
          <div>
            <h2 className="text-lg font-semibold text-ink mb-3">Ваш комплект</h2>
            <div className="space-y-3">
              {recs.map((rec, i) => (
                <RecommendationCard
                  key={rec.product.id}
                  rec={rec}
                  order={i + 1}
                  connected={payments.some((p) => p.productId === rec.product.id)}
                  onConnect={() => handleConnect(rec.product.id)}
                  onDisconnect={() => disconnectPayment(rec.product.id)}
                  onTest={() => setTestModal(rec.product.id)}
                />
              ))}
            </div>
          </div>

          {/* Подключенные */}
          {payments.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-ink mb-3">Подключено ({payments.length})</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {payments.map((p) => {
                  const product = recs.find((r) => r.product.id === p.productId)?.product;
                  if (!product) return null;
                  return (
                    <Card key={p.productId} className="p-4 flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0"
                        style={{ background: product.accent + "20" }}
                      >
                        {product.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-ink truncate">{product.name}</p>
                        <p className="text-xs text-secondary">
                          {p.testTransaction ? (
                            <span className="text-success">Тест: {formatMoney(p.testTransaction.amount)} ✓</span>
                          ) : (
                            "Подключён"
                          )}
                        </p>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => setTestModal(p.productId)}>
                        Тест
                      </Button>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      <Wizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        initial={answers}
        onComplete={(a) => {
          setPaymentAnswers(a);
          setWizardOpen(false);
          pushToast({ title: "Комплект подобран!", variant: "success" });
        }}
      />

      {/* Modal: продукт подключён */}
      <Modal
        open={!!connectedModal}
        onClose={() => setConnectedModal(null)}
        title="Заявка создана"
        size="sm"
      >
        <div className="text-center py-2">
          <div className="w-14 h-14 rounded-2xl bg-success/10 text-success flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <p className="font-semibold text-ink">
            {connectedModal && recs.find((r) => r.product.id === connectedModal)?.product.name} подключён
          </p>
          <p className="text-sm text-secondary mt-1">
            Это mock-подключение. В реальном продукте здесь была бы интеграция с эквайрингом.
          </p>
          <Button
            fullWidth
            className="mt-5"
            onClick={() => {
              const pid = connectedModal;
              setConnectedModal(null);
              if (pid) setTestModal(pid);
            }}
          >
            Провести тестовый платёж
          </Button>
        </div>
      </Modal>

      {/* Modal: тестовый платёж */}
      <TestPaymentModal
        productId={testModal}
        onClose={() => setTestModal(null)}
        onConfirm={(amount) => {
          if (testModal) {
            connectPayment({
              productId: testModal as never,
              testTransaction: { amount, status: "success", at: todayISO() },
            });
            pushToast({
              title: "Тестовый платёж прошёл",
              description: `${formatMoney(amount)} — успешно`,
              variant: "success",
            });
          }
          setTestModal(null);
        }}
        recs={recs}
      />

      <ConfirmDialog
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        onConfirm={() => {
          payments.forEach((p) => disconnectPayment(p.productId));
          pushToast({ title: "Платежи сброшены", variant: "default" });
        }}
        title="Сбросить подключённые платежи?"
        description="Ответы мастера сохранятся, но mock-подключения будут удалены."
        confirmLabel="Сбросить"
        danger
      />
    </div>
  );
}

function summarizeScenario(a: PaymentAnswers): string {
  const parts: string[] = [];
  if (a.online) parts.push("онлайн");
  if (a.offlineStationary) parts.push("точка");
  if (a.onTheGo) parts.push("выезд");
  if (a.siteOrApp) parts.push("сайт/приложение");
  if (a.tips) parts.push("чаевые");
  if (a.multiSided) parts.push("платформа");
  if (a.regularPayouts) parts.push("выплаты команде");
  if (parts.length === 0) return "Базовый старт";
  return parts.join(" · ");
}

function RecommendationCard({
  rec,
  order,
  connected,
  onConnect,
  onDisconnect,
  onTest,
}: {
  rec: PaymentRecommendation;
  order: number;
  connected: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onTest: () => void;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start gap-3">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
          style={{ background: rec.product.accent + "20" }}
        >
          {rec.product.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-6 h-6 rounded-full bg-bg-muted text-ink text-xs font-bold flex items-center justify-center">
              {order}
            </span>
            <h3 className="font-semibold text-ink">{rec.product.name}</h3>
            {connected && (
              <Badge tone="success">
                <Check className="w-3 h-3" /> Подключён
              </Badge>
            )}
          </div>
          <p className="text-sm text-secondary">{rec.product.tagline}</p>
          <ul className="mt-2 space-y-1">
            {rec.reasons.map((r, i) => (
              <li key={i} className="text-sm text-ink flex items-start gap-2">
                <Zap className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                {r}
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {rec.product.bestFor.map((b) => (
              <span key={b} className="chip bg-bg-muted text-secondary text-[10px]">
                {b}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        {!connected ? (
          <Button size="sm" onClick={onConnect}>
            <Plug className="w-4 h-4" />
            Подключить
          </Button>
        ) : (
          <>
            <Button size="sm" variant="secondary" onClick={onTest}>
              <Receipt className="w-4 h-4" />
              Тест
            </Button>
            <Button size="sm" variant="ghost" onClick={onDisconnect} className="text-danger">
              Отключить
            </Button>
          </>
        )}
      </div>
    </Card>
  );
}

function Wizard({
  open,
  onClose,
  initial,
  onComplete,
}: {
  open: boolean;
  onClose: () => void;
  initial: PaymentAnswers;
  onComplete: (a: PaymentAnswers) => void;
}) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<PaymentAnswers>(initial);

  const reset = () => {
    setStep(0);
    setAnswers(initial);
  };

  const current = STEPS[step];

  const setValue = (value: unknown) => {
    setAnswers((a) => ({ ...a, [current.id]: value } as PaymentAnswers));
  };

  const next = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
    else onComplete(answers);
  };

  const isNumber = current.id === "averageCheck";

  return (
    <Modal
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title="Мастер платежей"
      subtitle={`Шаг ${step + 1} из ${STEPS.length}`}
    >
      <div className="mb-5">
        <div className="h-1.5 rounded-full bg-bg-muted overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-2">
            Вопрос {step + 1}
          </p>
          <h3 className="text-xl font-bold text-ink leading-tight">{current.question}</h3>
          {current.help && <p className="text-sm text-secondary mt-1.5">{current.help}</p>}

          {isNumber ? (
            <div className="mt-6">
              <Label>Средний чек, ₽</Label>
              <Input
                type="number"
                inputMode="numeric"
                placeholder="2500"
                value={(answers.averageCheck as number) ?? ""}
                onChange={(e) => setValue(e.target.value === "" ? null : Number(e.target.value))}
                unit="₽"
                autoFocus
              />
            </div>
          ) : (
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setValue(true)}
                className={cn(
                  "flex-1 rounded-2xl border-2 p-5 transition-all",
                  answers[current.id] === true
                    ? "border-primary bg-primary-soft"
                    : "border-bg-muted hover:border-bg-muted",
                )}
              >
                <Check className={cn("w-6 h-6 mx-auto", answers[current.id] === true ? "text-primary" : "text-secondary")} />
                <p className="font-semibold text-ink mt-2">Да</p>
              </button>
              <button
                onClick={() => setValue(false)}
                className={cn(
                  "flex-1 rounded-2xl border-2 p-5 transition-all",
                  answers[current.id] === false
                    ? "border-primary bg-primary-soft"
                    : "border-bg-muted hover:border-bg-muted",
                )}
              >
                <p className={cn("text-2xl", answers[current.id] === false ? "text-primary" : "text-secondary")}>—</p>
                <p className="font-semibold text-ink mt-2">Нет</p>
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex gap-3 mt-6">
        <Button
          variant="secondary"
          fullWidth
          disabled={step === 0}
          onClick={() => setStep(step - 1)}
        >
          <ArrowLeft className="w-4 h-4" />
          Назад
        </Button>
        <Button
          fullWidth
          disabled={answers[current.id] === null}
          onClick={next}
        >
          {step === STEPS.length - 1 ? (
            <>
              <Sparkles className="w-4 h-4" />
              Подобрать
            </>
          ) : (
            <>
              Далее
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </Modal>
  );
}

function TestPaymentModal({
  productId,
  onClose,
  onConfirm,
  recs,
}: {
  productId: string | null;
  onClose: () => void;
  onConfirm: (amount: number) => void;
  recs: PaymentRecommendation[];
}) {
  const [amount, setAmount] = useState(250);
  const product = productId ? recs.find((r) => r.product.id === productId)?.product : null;

  return (
    <Modal
      open={!!productId}
      onClose={onClose}
      title={`Тестовый платёж — ${product?.name ?? ""}`}
      subtitle="Mock-операция для демонстрации потока"
    >
      <div className="space-y-4">
        <div className="rounded-2xl bg-bg-muted/50 p-4 text-center">
          <ShoppingCart className="w-8 h-8 text-primary mx-auto mb-2" />
          <p className="text-sm text-secondary">Сумма платежа</p>
          <p className="text-2xl font-bold text-ink mt-1">{formatMoney(amount)}</p>
        </div>
        <div>
          <Label>Изменить сумму</Label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            unit="₽"
          />
        </div>
        <div className="flex gap-2">
          {[250, 500, 2500].map((v) => (
            <button
              key={v}
              onClick={() => setAmount(v)}
              className="chip bg-bg-muted text-ink cursor-pointer"
            >
              {v} ₽
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" fullWidth onClick={onClose}>
            Отмена
          </Button>
          <Button fullWidth onClick={() => onConfirm(amount)}>
            <Zap className="w-4 h-4" />
            Оплатить
          </Button>
        </div>
      </div>
    </Modal>
  );
}
