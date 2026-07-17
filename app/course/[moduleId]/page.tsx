"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  PenLine,
  Sparkles,
  CheckCircle2,
  Check,
  X,
  ChevronRight,
  Clock,
  Target,
  Trophy,
  Lightbulb,
  AlertCircle,
  ArrowRight,
  Save,
  PlayCircle,
} from "lucide-react";
import { AppShell } from "@/components/shell/AppShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { Input, Label, Textarea, Select } from "@/components/ui/Field";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useAppStore } from "@/store/useAppStore";
import { getModuleById, ALL_MODULES } from "@/data/courseData";
import { analyzeModule } from "@/lib/aiEngine";
import { cn } from "@/lib/utils";
import type { FormFieldDef, AIInsight } from "@/types";

const STEPS = ["Урок", "Практика", "AI", "Результат"] as const;
type Step = (typeof STEPS)[number];

export default function ModulePage() {
  return (
    <AppShell>
      <ModuleContent />
    </AppShell>
  );
}

function ModuleContent() {
  const params = useParams<{ moduleId: string }>();
  const router = useRouter();
  const moduleId = params.moduleId;

  const mod = getModuleById(moduleId);

  const moduleProgress = useAppStore((s) => (moduleId ? s.moduleProgress[moduleId] : undefined));
  const startModule = useAppStore((s) => s.startModule);
  const saveModuleAnswers = useAppStore((s) => s.saveModuleAnswers);
  const passQuiz = useAppStore((s) => s.passQuiz);
  const setAiAnalyzed = useAppStore((s) => s.setAiAnalyzed);
  const acceptAiSuggestion = useAppStore((s) => s.acceptAiSuggestion);
  const saveArtifact = useAppStore((s) => s.saveArtifact);
  const completeModule = useAppStore((s) => s.completeModule);
  const pushToast = useAppStore((s) => s.pushToast);
  const profile = useAppStore((s) => s.profile);
  const project = useAppStore((s) => s.project);

  const [step, setStep] = useState<Step>("Урок");
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [insight, setInsight] = useState<AIInsight | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [completeOpen, setCompleteOpen] = useState(false);

  // Init
  useEffect(() => {
    if (!mod) return;
    if (!moduleProgress) {
      startModule(mod.id);
    } else {
      setAnswers(moduleProgress.answers ?? {});
      if (moduleProgress.quizPassed) setQuizSubmitted(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleId]);

  if (!mod) {
    return (
      <div className="text-center py-20">
        <p className="text-secondary">Блок не найден.</p>
        <Link href="/home" className="text-primary font-medium mt-3 inline-block">
          ← На главную
        </Link>
      </div>
    );
  }

  if (moduleProgress?.status === "locked") {
    return (
      <div className="text-center py-20">
        <p className="text-secondary">Этот блок закрыт. Сначала завершите предыдущие.</p>
        <Link href="/home" className="text-primary font-medium mt-3 inline-block">
          ← На главную
        </Link>
      </div>
    );
  }

  const handleAnswerChange = (name: string, value: unknown) => {
    const next = { ...answers, [name]: value };
    setAnswers(next);
    saveModuleAnswers(mod.id, { [name]: value });
  };

  const runAI = () => {
    const result = analyzeModule({
      module: mod,
      answers,
      profile,
      project,
    });
    setInsight(result);
    setAiAnalyzed(mod.id);
  };

  const totalSteps = STEPS.length;
  const stepIndex = STEPS.indexOf(step);
  const stepPct = ((stepIndex + 1) / totalSteps) * 100;

  const isPracticeFilled = mod.practice.fields.length === 0 || mod.practice.fields
    .filter((f) => f.required)
    .every((f) => {
      const v = answers[f.name];
      if (Array.isArray(v)) return v.length > 0;
      if (typeof v === "string") return v.trim().length > 0;
      return v !== undefined && v !== null && v !== "";
    });

  const quizAllCorrect = mod.quiz.length === 0 || mod.quiz.every((q, i) => quizAnswers[i] === q.correctIndex);

  return (
    <div className="max-w-[760px] mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => router.back()}
          aria-label="Назад"
          className="w-10 h-10 rounded-full hover:bg-bg-muted flex items-center justify-center shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <Badge tone="primary">Блок {mod.number}</Badge>
            {moduleProgress?.status === "credited_by_diagnostic" && (
              <Badge tone="warning">Зачтено диагностикой</Badge>
            )}
            {moduleProgress?.status === "completed" && (
              <Badge tone="success">
                <CheckCircle2 className="w-3 h-3" /> Завершён
              </Badge>
            )}
          </div>
          <h1 className="text-xl font-bold text-ink leading-tight truncate">{mod.title}</h1>
        </div>
      </div>

      {/* Stepper */}
      <div className="card p-4 mb-5">
        <div className="flex items-center justify-between mb-2">
          {STEPS.map((s, i) => {
            const done = i < stepIndex || (s === "Урок" && quizSubmitted);
            const active = s === step;
            return (
              <button
                key={s}
                onClick={() => setStep(s)}
                className={cn(
                  "flex flex-col items-center gap-1.5 flex-1 text-xs transition-colors",
                  active ? "text-primary" : done ? "text-success" : "text-secondary",
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-all",
                    active
                      ? "border-primary bg-primary text-white"
                      : done
                        ? "border-success bg-success text-white"
                        : "border-bg-muted bg-bg-surface text-secondary",
                  )}
                >
                  {done ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                {s}
              </button>
            );
          })}
        </div>
        <Progress value={stepPct} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.2 }}
        >
          {step === "Урок" && (
            <LessonStep
              module={mod}
              quizAnswers={quizAnswers}
              setQuizAnswers={setQuizAnswers}
              quizSubmitted={quizSubmitted}
              onSubmitQuiz={() => {
                if (quizAllCorrect) {
                  passQuiz(mod.id);
                  setQuizSubmitted(true);
                  pushToast({
                    title: "Квиз пройден!",
                    description: "Переходите к практике.",
                    variant: "success",
                  });
                } else {
                  setQuizSubmitted(true);
                  pushToast({
                    title: "Есть ошибки",
                    description: "Проверьте ответы с подсказками ниже.",
                    variant: "warning",
                  });
                }
              }}
            />
          )}

          {step === "Практика" && (
            <PracticeStep
              module={mod}
              answers={answers}
              onChange={handleAnswerChange}
            />
          )}

          {step === "AI" && (
            <AIStep
              insight={insight}
              onRun={runAI}
              accepted={moduleProgress?.acceptedAiSuggestions ?? []}
              onAccept={(id) => {
                acceptAiSuggestion(mod.id, id);
                pushToast({ title: "Рекомендация принята", variant: "success" });
              }}
              onUseInProject={(text) => {
                pushToast({ title: "Использовано в проекте", description: text.slice(0, 60) + "…", variant: "success" });
              }}
            />
          )}

          {step === "Результат" && (
            <ResultStep
              module={mod}
              answers={answers}
              insight={insight}
              saved={!!moduleProgress?.artifactSaved}
              completed={moduleProgress?.status === "completed"}
              onSave={() => {
                saveArtifact(mod.id);
                pushToast({ title: "Результат сохранён", variant: "success" });
              }}
              onComplete={() => setCompleteOpen(true)}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Footer navigation */}
      <div className="sticky bottom-[84px] lg:bottom-4 mt-6 z-20">
        <div className="card p-3 flex items-center justify-between gap-3 shadow-soft">
          <Button
            variant="secondary"
            size="sm"
            disabled={stepIndex === 0}
            onClick={() => setStep(STEPS[Math.max(0, stepIndex - 1)])}
          >
            <ArrowLeft className="w-4 h-4" />
            Назад
          </Button>
          <div className="text-xs text-secondary hidden sm:block">
            {step} · {stepIndex + 1}/{totalSteps}
          </div>
          {stepIndex < totalSteps - 1 ? (
            <Button
              size="sm"
              disabled={
                (step === "Урок" && mod.quiz.length > 0 && !quizSubmitted) ||
                (step === "Практика" && !isPracticeFilled) ||
                (step === "AI" && !moduleProgress?.aiAnalyzed)
              }
              onClick={() => setStep(STEPS[stepIndex + 1])}
            >
              Далее
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              size="sm"
              disabled={moduleProgress?.status === "completed"}
              onClick={() => setCompleteOpen(true)}
            >
              <Trophy className="w-4 h-4" />
              Завершить блок
            </Button>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={completeOpen}
        onClose={() => setCompleteOpen(false)}
        onConfirm={() => {
          saveArtifact(mod.id);
          completeModule(mod.id);
          pushToast({
            title: "Блок завершён! 🎉",
            description: mod.milestone ? `Milestone: ${mod.milestone.label}` : undefined,
            variant: "success",
          });
          // redirect to next module
          const idx = ALL_MODULES.findIndex((m) => m.id === mod.id);
          const next = ALL_MODULES[idx + 1];
          setTimeout(() => {
            if (next) router.push(`/course/${next.id}`);
            else router.push("/demo-day");
          }, 600);
        }}
        title="Завершить блок?"
        description={
          mod.milestone
            ? `Получите milestone «${mod.milestone.label}» и разблокируете следующий блок.`
            : "Блок будет отмечен завершённым."
        }
        confirmLabel="Завершить"
      />
    </div>
  );
}

// ===== LESSON =====
function LessonStep({
  module,
  quizAnswers,
  setQuizAnswers,
  quizSubmitted,
  onSubmitQuiz,
}: {
  module: ReturnType<typeof getModuleById>;
  quizAnswers: Record<number, number>;
  setQuizAnswers: (a: Record<number, number>) => void;
  quizSubmitted: boolean;
  onSubmitQuiz: () => void;
}) {
  const [openCard, setOpenCard] = useState<number | null>(0);
  if (!module) return null;

  return (
    <div className="space-y-4">
      <Card className="p-5 bg-primary-soft/40 border-primary/20">
        <div className="flex items-start gap-3">
          <Target className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              Ожидаемый результат
            </p>
            <p className="font-medium text-ink mt-1">{module.resultDescription}</p>
          </div>
        </div>
      </Card>

      <div className="flex items-center gap-3 text-sm text-secondary">
        <Clock className="w-4 h-4" />
        {formatMinutes(module.estimatedMinutes)}
      </div>

      {/* Lesson cards (аккордеон) */}
      <div className="space-y-3">
        {module.learn.map((card, i) => {
          const open = openCard === i;
          return (
            <Card key={i} className="overflow-hidden p-0">
              <button
                onClick={() => setOpenCard(open ? null : i)}
                className="w-full flex items-center justify-between gap-3 p-4 text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-primary-soft text-primary flex items-center justify-center text-sm font-bold shrink-0">
                    {i + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-ink leading-tight">{card.title}</p>
                  </div>
                </div>
                <ChevronRight
                  className={cn(
                    "w-5 h-5 text-secondary transition-transform shrink-0",
                    open && "rotate-90",
                  )}
                />
              </button>
              {open && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  className="px-4 pb-4"
                >
                  <p className="text-sm text-ink leading-relaxed">{card.thesis}</p>
                  {card.examples && card.examples.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-semibold text-secondary uppercase tracking-wide mb-2">
                        Примеры
                      </p>
                      <ul className="space-y-1.5">
                        {card.examples.map((ex, ei) => (
                          <li key={ei} className="text-sm text-secondary flex items-start gap-2">
                            <span className="text-primary mt-0.5">→</span>
                            {ex}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {card.checklist && card.checklist.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-semibold text-secondary uppercase tracking-wide mb-2">
                        Чек-лист
                      </p>
                      <ul className="space-y-1.5">
                        {card.checklist.map((c, ci) => (
                          <li key={ci} className="text-sm text-ink flex items-start gap-2">
                            <Check className="w-4 h-4 text-success mt-0.5 shrink-0" />
                            {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </motion.div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Quiz */}
      {module.quiz.length > 0 && (
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-primary" />
            <h3 className="section-title">Мини-квиз</h3>
          </div>
          <div className="space-y-5">
            {module.quiz.map((q, qi) => (
              <div key={qi}>
                <p className="font-medium text-ink mb-2.5">
                  {qi + 1}. {q.question}
                </p>
                <div className="space-y-2">
                  {q.options.map((opt, oi) => {
                    const selected = quizAnswers[qi] === oi;
                    const correct = q.correctIndex === oi;
                    const showResult = quizSubmitted;
                    return (
                      <button
                        key={oi}
                        onClick={() => setQuizAnswers({ ...quizAnswers, [qi]: oi })}
                        className={cn(
                          "w-full flex items-center gap-3 p-3 rounded-2xl border-2 text-left text-sm transition-all",
                          selected
                            ? showResult
                              ? correct
                                ? "border-success bg-success/5"
                                : "border-danger bg-danger/5"
                              : "border-primary bg-primary-soft"
                            : "border-bg-muted hover:border-bg-muted",
                        )}
                      >
                        <div
                          className={cn(
                            "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                            selected
                              ? showResult
                                ? correct
                                  ? "border-success bg-success"
                                  : "border-danger bg-danger"
                                : "border-primary bg-primary"
                              : "border-bg-muted",
                          )}
                        >
                          {selected && (showResult && correct ? <Check className="w-3 h-3 text-white" /> : showResult && !correct ? <X className="w-3 h-3 text-white" /> : <Check className="w-3 h-3 text-white" />)}
                        </div>
                        <span className={cn("flex-1", selected ? "text-ink font-medium" : "text-secondary")}>
                          {opt}
                        </span>
                        {showResult && correct && (
                          <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
                {quizSubmitted && (
                  <p className="text-xs text-secondary mt-2 bg-bg-muted/50 rounded-xl p-2.5">
                    💡 {q.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>
          <Button fullWidth className="mt-5" onClick={onSubmitQuiz}>
            {quizSubmitted ? "Проверить заново" : "Проверить ответы"}
          </Button>
        </Card>
      )}
    </div>
  );
}

// ===== PRACTICE =====
function PracticeStep({
  module,
  answers,
  onChange,
}: {
  module: NonNullable<ReturnType<typeof getModuleById>>;
  answers: Record<string, unknown>;
  onChange: (name: string, value: unknown) => void;
}) {
  // Special variant routing
  if (module.variant === "payments_wizard") {
    return (
      <Card className="p-5 text-center">
        <div className="w-12 h-12 rounded-2xl bg-primary-soft text-primary flex items-center justify-center mx-auto mb-3">
          <PlayCircle className="w-6 h-6" />
        </div>
        <h3 className="font-semibold text-ink">Платёжный мастер</h3>
        <p className="text-sm text-secondary mt-1 max-w-md mx-auto">
          Этот блок открывается через интерактивный мастер в разделе «Платежи». Он подберёт комплект продуктов под ваш сценарий.
        </p>
        <Link href="/payments" className="mt-4 inline-block">
          <Button>
            Открыть мастер платежей
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </Card>
    );
  }

  if (module.variant === "finance_calc") {
    return (
      <Card className="p-5 text-center">
        <div className="w-12 h-12 rounded-2xl bg-primary-soft text-primary flex items-center justify-center mx-auto mb-3">
          <Target className="w-6 h-6" />
        </div>
        <h3 className="font-semibold text-ink">Финансовый калькулятор</h3>
        <p className="text-sm text-secondary mt-1 max-w-md mx-auto">
          Расчёт CAC, LTV, точки безубыточности и трёх сценариев. Откройте в разделе «Финансы».
        </p>
        <Link href="/finance" className="mt-4 inline-block">
          <Button>
            Посчитать экономику
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </Card>
    );
  }

  if (module.variant === "experiments") {
    return (
      <Card className="p-5 text-center">
        <div className="w-12 h-12 rounded-2xl bg-primary-soft text-primary flex items-center justify-center mx-auto mb-3">
          <Target className="w-6 h-6" />
        </div>
        <h3 className="font-semibold text-ink">Эксперимент спроса</h3>
        <p className="text-sm text-secondary mt-1 max-w-md mx-auto">
          Зафиксируйте гипотезу и результат теста в разделе «Эксперименты» — это засчитается как практика блока.
        </p>
        <Link href="/experiments" className="mt-4 inline-block">
          <Button>
            Открыть эксперименты
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </Card>
    );
  }

  const filled = module.practice.fields.filter((f) => {
    const v = answers[f.name];
    if (Array.isArray(v)) return v.length > 0;
    if (typeof v === "string") return v.trim().length > 0;
    return v !== undefined && v !== null && v !== "";
  }).length;
  const totalReq = module.practice.fields.filter((f) => f.required).length || 1;
  const filledReq = module.practice.fields.filter((f) => {
    if (!f.required) return false;
    const v = answers[f.name];
    if (Array.isArray(v)) return v.length > 0;
    if (typeof v === "string") return v.trim().length > 0;
    return v !== undefined && v !== null && v !== "";
  }).length;
  const pct = Math.round((filledReq / totalReq) * 100);

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="section-title">Практика</h3>
            <p className="text-sm text-secondary mt-0.5">{module.practice.intro}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-secondary">Заполнено</p>
            <p className="font-semibold text-ink">{pct}%</p>
          </div>
        </div>
        <Progress value={pct} />
      </Card>

      <Card className="p-5">
        <div className="grid sm:grid-cols-2 gap-4">
          {module.practice.fields.map((field) => (
            <FieldRenderer
              key={field.name}
              field={field}
              value={answers[field.name]}
              onChange={(v) => onChange(field.name, v)}
            />
          ))}
        </div>
        <p className="text-xs text-success mt-4 flex items-center gap-1.5">
          <Check className="w-3.5 h-3.5" />
          Автосохранение включено
        </p>
      </Card>
    </div>
  );
}

function FieldRenderer({
  field,
  value,
  onChange,
}: {
  field: FormFieldDef;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const fullWidth = field.type === "textarea" || field.type === "multiselect";
  return (
    <div className={fullWidth ? "sm:col-span-2" : ""}>
      <Label required={field.required}>{field.label}</Label>
      {field.type === "text" && (
        <Input
          placeholder={field.placeholder}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          unit={field.unit}
        />
      )}
      {field.type === "number" && (
        <Input
          type="number"
          inputMode="numeric"
          placeholder={field.placeholder}
          value={(value as string | number) ?? ""}
          onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
          unit={field.unit}
        />
      )}
      {field.type === "textarea" && (
        <Textarea
          placeholder={field.placeholder}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
        />
      )}
      {field.type === "select" && (
        <Select
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">Выберите…</option>
          {field.options?.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </Select>
      )}
      {field.type === "multiselect" && (
        <div className="flex flex-wrap gap-2 pt-1">
          {field.options?.map((opt) => {
            const arr = (value as string[]) ?? [];
            const sel = arr.includes(opt);
            return (
              <button
                key={opt}
                type="button"
                onClick={() =>
                  onChange(sel ? arr.filter((x) => x !== opt) : [...arr, opt])
                }
                className={cn(
                  "chip cursor-pointer transition-colors",
                  sel ? "bg-primary text-white" : "bg-bg-muted text-ink hover:bg-bg-muted/70",
                )}
              >
                {sel && <Check className="w-3 h-3" />}
                {opt}
              </button>
            );
          })}
        </div>
      )}
      {field.type === "checkbox" && (
        <button
          type="button"
          onClick={() => onChange(!value)}
          className={cn(
            "flex items-center gap-2 px-4 py-3 rounded-2xl border-2 transition-all",
            value ? "border-primary bg-primary-soft" : "border-bg-muted",
          )}
        >
          <div
            className={cn(
              "w-5 h-5 rounded-md border-2 flex items-center justify-center",
              value ? "border-primary bg-primary" : "border-bg-muted",
            )}
          >
            {Boolean(value) && <Check className="w-3 h-3 text-white" />}
          </div>
          <span className="text-sm font-medium text-ink">Да</span>
        </button>
      )}
      {field.help && <p className="help">{field.help}</p>}
    </div>
  );
}

// ===== AI STEP =====
function AIStep({
  insight,
  onRun,
  accepted,
  onAccept,
  onUseInProject,
}: {
  insight: AIInsight | null;
  onRun: () => void;
  accepted: string[];
  onAccept: (id: string) => void;
  onUseInProject: (text: string) => void;
}) {
  if (!insight) {
    return (
      <Card className="p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-primary-soft text-primary flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-7 h-7" />
        </div>
        <h3 className="font-semibold text-ink">AI-анализ практики</h3>
        <p className="text-sm text-secondary mt-1 max-w-md mx-auto">
          Я прочитаю ваши ответы и подскажу: что хорошо, что не доказано, главный риск и 1–3 улучшения.
        </p>
        <p className="text-xs text-secondary mt-3 bg-bg-muted/50 rounded-xl p-2.5 inline-block">
          🔒 AI использует данные вашего проекта и работает локально
        </p>
        <div className="mt-5">
          <Button onClick={onRun}>
            <Sparkles className="w-4 h-4" />
            Попросить AI помочь
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <InsightBlock
        icon={<Lightbulb className="w-4 h-4" />}
        tone="success"
        title="Что уже хорошо"
        items={insight.goodPoints}
      />
      <InsightBlock
        icon={<AlertCircle className="w-4 h-4" />}
        tone="warning"
        title="Что не доказано"
        items={insight.unprovenPoints}
      />
      <Card className="p-5 border-danger/20 bg-danger/5">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-danger/10 text-danger flex items-center justify-center shrink-0">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-danger">
              Главный риск
            </p>
            <p className="text-sm text-ink mt-1 font-medium">{insight.mainRisk}</p>
          </div>
        </div>
      </Card>
      <Card className="p-5 border-primary/20 bg-primary-soft/40">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center shrink-0">
            <ArrowRight className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              Следующий шаг
            </p>
            <p className="text-sm text-ink mt-1">{insight.nextStep}</p>
          </div>
        </div>
      </Card>

      {insight.suggestions && insight.suggestions.length > 0 && (
        <Card className="p-5">
          <h3 className="section-title mb-3">Улучшения от AI</h3>
          <div className="space-y-3">
            {insight.suggestions.map((s) => {
              const isAccepted = accepted.includes(s.id);
              return (
                <div
                  key={s.id}
                  className={cn(
                    "rounded-2xl border-2 p-4 transition-all",
                    isAccepted ? "border-success bg-success/5" : "border-bg-muted",
                  )}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <p className="font-semibold text-ink text-sm">{s.label}</p>
                    {isAccepted && (
                      <Badge tone="success">
                        <Check className="w-3 h-3" /> Принято
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-secondary whitespace-pre-line">{s.text}</p>
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      variant={isAccepted ? "secondary" : "primary"}
                      onClick={() => onAccept(s.id)}
                    >
                      {isAccepted ? (
                        <>
                          <Check className="w-4 h-4" /> Принято
                        </>
                      ) : (
                        "Принять рекомендацию"
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onUseInProject(s.text)}
                    >
                      Использовать в проекте
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}

function InsightBlock({
  icon,
  tone,
  title,
  items,
}: {
  icon: React.ReactNode;
  tone: "success" | "warning";
  title: string;
  items: string[];
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-3">
        <div
          className={cn(
            "w-8 h-8 rounded-xl flex items-center justify-center",
            tone === "success" ? "bg-success/10 text-success" : "bg-warning/15 text-warning",
          )}
        >
          {icon}
        </div>
        <h3 className="font-semibold text-ink">{title}</h3>
      </div>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="text-sm text-ink flex items-start gap-2">
            <span className={cn("mt-1.5 w-1.5 h-1.5 rounded-full shrink-0", tone === "success" ? "bg-success" : "bg-warning")} />
            {item}
          </li>
        ))}
      </ul>
    </Card>
  );
}

// ===== RESULT =====
function ResultStep({
  module,
  answers,
  insight,
  saved,
  completed,
  onSave,
  onComplete,
}: {
  module: NonNullable<ReturnType<typeof getModuleById>>;
  answers: Record<string, unknown>;
  insight: AIInsight | null;
  saved: boolean;
  completed: boolean;
  onSave: () => void;
  onComplete: () => void;
}) {
  const artifact = buildArtifact(module, answers, insight);
  return (
    <div className="space-y-4">
      <Card className="p-5 bg-gradient-to-br from-primary-soft/50 to-bg-surface border-primary/20">
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="w-5 h-5 text-primary" />
          <h3 className="section-title">Ваш результат</h3>
        </div>
        <p className="text-sm text-ink whitespace-pre-line leading-relaxed">{artifact}</p>
      </Card>

      <Card className="p-5">
        <h3 className="font-semibold text-ink mb-3">Критерии завершения</h3>
        <ul className="space-y-2">
          {module.completionCriteria.map((c, i) => (
            <li key={i} className="text-sm text-secondary flex items-start gap-2">
              <Check className="w-4 h-4 text-success mt-0.5 shrink-0" />
              {c}
            </li>
          ))}
        </ul>
      </Card>

      {module.milestone && (
        <Card className="p-5 text-center bg-ink text-white">
          <p className="text-4xl">{module.milestone.emoji}</p>
          <p className="text-xs text-white/60 mt-2 uppercase tracking-wide">Milestone</p>
          <p className="font-semibold text-lg mt-1">{module.milestone.label}</p>
        </Card>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <Button variant="secondary" fullWidth onClick={onSave} disabled={saved}>
          {saved ? (
            <>
              <Check className="w-4 h-4" /> Сохранено
            </>
          ) : (
            <>
              <Save className="w-4 h-4" /> Сохранить результат
            </>
          )}
        </Button>
        <Button fullWidth onClick={onComplete} disabled={completed}>
          {completed ? (
            <>
              <CheckCircle2 className="w-4 h-4" /> Завершено
            </>
          ) : (
            <>
              <Trophy className="w-4 h-4" /> Завершить блок
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

function buildArtifact(
  module: NonNullable<ReturnType<typeof getModuleById>>,
  answers: Record<string, unknown>,
  insight: AIInsight | null,
): string {
  const lines: string[] = [];
  lines.push(`Блок «${module.title}» — артефакт.`);
  lines.push("");
  const meaningful = Object.entries(answers).filter(([, v]) => {
    if (Array.isArray(v)) return v.length > 0;
    if (typeof v === "string") return v.trim().length > 0;
    return v !== undefined && v !== null && v !== "";
  });
  if (meaningful.length === 0) {
    lines.push("Заполните практику, чтобы здесь появился результат.");
  } else {
    for (const [k, v] of meaningful.slice(0, 8)) {
      const label = module.practice.fields.find((f) => f.name === k)?.label ?? k;
      const valStr = Array.isArray(v) ? v.join(", ") : String(v);
      lines.push(`• ${label}: ${valStr}`);
    }
  }
  if (insight) {
    lines.push("");
    lines.push(`Главный риск: ${insight.mainRisk}`);
    lines.push(`Следующий шаг: ${insight.nextStep}`);
  }
  return lines.join("\n");
}

function formatMinutes(min: number): string {
  if (min < 60) return `${min} мин`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} ч ${m} мин` : `${h} ч`;
}
