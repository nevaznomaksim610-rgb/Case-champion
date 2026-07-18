"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  User as UserIcon,
  Rocket,
  Layers,
  Wallet,
  Target,
  Check,
  Cpu,
  Store,
  FileText,
  UploadCloud,
  Loader2,
  FileCheck2,
  X,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select, Textarea } from "@/components/ui/Field";
import { cn } from "@/lib/utils";
import type { BusinessFormat, Goal30, Stage, Track } from "@/types";
import { analyzeOnboarding } from "@/lib/onboarding";
import { extractTextFromFile, ACCEPTED_UPLOAD } from "@/lib/parseFile";

interface UploadedFile {
  name: string;
  text: string;
}

type Kind = "startup" | "business";

const STEPS = [
  { id: 0, title: "Имя", icon: UserIcon },
  { id: 1, title: "Тип бизнеса", icon: Rocket },
  { id: 2, title: "Стадия", icon: Layers },
  { id: 3, title: "Сфера", icon: Store },
  { id: 4, title: "Ресурсы", icon: Wallet },
  { id: 5, title: "Цель", icon: Target },
  { id: 6, title: "Материалы", icon: FileText },
  { id: 7, title: "Итог", icon: Sparkles },
];

const STAGE_OPTIONS: { value: Stage; label: string; desc: string; emoji: string }[] = [
  { value: "idea", label: "Только идея", desc: "Есть замысел, но не знаю, как начать", emoji: "💡" },
  { value: "mvp", label: "Есть первые попытки", desc: "Уже что-то запускал(а), но не стабильно", emoji: "🚀" },
  { value: "selling", label: "Уже продаю", desc: "Есть выручка, хочу усилить результат", emoji: "💰" },
];

const FORMAT_OPTIONS: { value: BusinessFormat; label: string; emoji: string }[] = [
  { value: "tech", label: "Технологический продукт", emoji: "💻" },
  { value: "services", label: "Услуги", emoji: "🤝" },
  { value: "beauty", label: "Бьюти", emoji: "💅" },
  { value: "horeca", label: "HoReCa", emoji: "☕" },
  { value: "retail", label: "Розница", emoji: "🛍️" },
  { value: "production", label: "Производство", emoji: "🏭" },
  { value: "other", label: "Другое", emoji: "✨" },
];

const GOAL_OPTIONS: { value: Goal30; label: string; desc: string; emoji: string }[] = [
  { value: "choose_idea", label: "Выбрать идею", desc: "Понять, что именно запускать", emoji: "💡" },
  { value: "get_leads", label: "Получить заявки", desc: "Найти первых заинтересованных клиентов", emoji: "📨" },
  { value: "first_payment", label: "Получить первый платёж", desc: "Подтвердить спрос деньгами", emoji: "💰" },
  { value: "improve_sales", label: "Улучшить продажи", desc: "Стабилизировать поток клиентов", emoji: "📈" },
  { value: "unit_economics", label: "Настроить экономику", desc: "Сделать бизнес прибыльным", emoji: "📊" },
  { value: "scale", label: "Масштабироваться", desc: "Открыть новые точки/каналы", emoji: "🌆" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const setProfile = useAppStore((s) => s.setProfile);
  const setProject = useAppStore((s) => s.setProject);
  const setProjectBrief = useAppStore((s) => s.setProjectBrief);
  const addProjectFile = useAppStore((s) => s.addProjectFile);
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);

  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    name: "",
    age: "" as string | number,
    kind: null as Kind | null,
    stage: null as Stage | null,
    format: null as BusinessFormat | null,
    budget: "" as string | number,
    hoursPerWeek: "" as string | number,
    teamSize: "" as string | number,
    skills: [] as string[],
    goal: null as Goal30 | null,
    brief: "",
    files: [] as UploadedFile[],
  });

  const setField = <K extends keyof typeof data>(key: K, value: (typeof data)[K]) =>
    setData((d) => ({ ...d, [key]: value }));

  const toggleSkill = (skill: string) =>
    setData((d) => ({
      ...d,
      skills: d.skills.includes(skill)
        ? d.skills.filter((s) => s !== skill)
        : [...d.skills, skill],
    }));

  const canProceed = (() => {
    switch (step) {
      case 0:
        return data.name.trim().length > 0;
      case 1:
        return data.kind !== null;
      case 2:
        return data.stage !== null;
      case 3:
        return data.format !== null;
      case 4:
        return true;
      case 5:
        return data.goal !== null;
      default:
        return true;
    }
  })();

  const handleFinish = () => {
    const track: Track = data.kind === "startup" ? "tech" : "regular";
    const rec = analyzeOnboarding({
      track,
      stage: data.stage,
      format: data.format,
      goal: data.goal,
      budget: Number(data.budget) || 0,
      hours: Number(data.hoursPerWeek) || 0,
      teamSize: Number(data.teamSize) || 1,
    });

    setProfile({
      name: data.name.trim(),
      age: data.age ? Number(data.age) : null,
      stage: data.stage,
      format: data.format,
      budget: data.budget ? Number(data.budget) : null,
      hoursPerWeek: data.hoursPerWeek ? Number(data.hoursPerWeek) : null,
      teamSize: data.teamSize ? Number(data.teamSize) : null,
      skills: data.skills,
      goal: data.goal,
      track: rec.track,
      hasDiagnostic: false,
      industry: FORMAT_OPTIONS.find((f) => f.value === data.format)?.label ?? "Другое",
    });

    setProject({
      name: data.name.trim() ? `${data.name.trim()}, ваш проект` : "Мой проект",
      description: "",
      stage: data.stage,
      track: rec.track,
      industry: FORMAT_OPTIONS.find((f) => f.value === data.format)?.label ?? "Другое",
      goal: GOAL_OPTIONS.find((g) => g.value === data.goal)?.label ?? "",
    });

    // Материалы проекта → в контекст AI-кофаундера.
    setProjectBrief(data.brief.trim());
    data.files.forEach((f) => addProjectFile(f));

    // Старт с чистого листа — ничего в траектории не пройдено.
    completeOnboarding();
    router.push("/home");
  };

  return (
    <div className="min-h-[100dvh] bg-bg flex justify-center">
      <div className="relative w-full max-w-[480px] min-h-[100dvh] bg-bg shadow-soft flex flex-col">
        <div className="flex-1 px-5 pt-6 pb-28">
          {/* Progress dots */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => (step === 0 ? router.push("/") : setStep((s) => s - 1))}
              aria-label="Назад"
              className="w-10 h-10 rounded-full hover:bg-bg-muted flex items-center justify-center text-ink"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex gap-1.5">
              {STEPS.map((s) => (
                <div
                  key={s.id}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    s.id === step ? "w-6 bg-primary" : s.id < step ? "w-1.5 bg-primary" : "w-1.5 bg-bg-muted",
                  )}
                />
              ))}
            </div>
            <div className="w-10 text-right text-xs font-medium text-secondary">
              {step + 1}/{STEPS.length}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.25 }}
            >
              {step === 0 && (
                <StepShell
                  icon={<UserIcon className="w-6 h-6" />}
                  title="Как вас зовут?"
                  subtitle="Так к вам будет обращаться AI-кофаундер"
                >
                  <Label required>Имя</Label>
                  <Input
                    autoFocus
                    placeholder="Алексей"
                    value={data.name}
                    onChange={(e) => setField("name", e.target.value)}
                    maxLength={30}
                  />
                  <div className="mt-4">
                    <Label>Возраст</Label>
                    <Input
                      type="number"
                      inputMode="numeric"
                      placeholder="21"
                      value={data.age}
                      onChange={(e) => setField("age", e.target.value)}
                      min={14}
                      max={99}
                    />
                  </div>
                </StepShell>
              )}

              {step === 1 && (
                <StepShell
                  icon={<Rocket className="w-6 h-6" />}
                  title="Стартап или реальный бизнес?"
                  subtitle="Это главный вопрос — от него зависит вся траектория"
                >
                  <div className="space-y-3">
                    <KindCard
                      selected={data.kind === "startup"}
                      onClick={() => setField("kind", "startup")}
                      icon={<Cpu className="w-6 h-6" />}
                      title="Технологический стартап"
                      desc="Ищу масштабируемую модель: цифровой продукт или платформа, гипотезы, MVP, рост и инвестиции."
                      points={["Карта гипотез", "Прототип и MVP", "Модели монетизации", "Привлечение инвестиций"]}
                    />
                    <KindCard
                      selected={data.kind === "business"}
                      onClick={() => setField("kind", "business")}
                      icon={<Store className="w-6 h-6" />}
                      title="Реальный бизнес"
                      desc="Понятный продукт или услуга: локальные клиенты, повторяемые продажи и операционка."
                      points={["Ассортимент и цены", "Организация продаж", "Управление финансами", "Удержание клиентов"]}
                    />
                  </div>
                  <p className="text-xs text-secondary mt-4 bg-bg-muted/60 rounded-2xl p-3">
                    Не переживайте — трек можно сменить позже. Сейчас важно задать верное направление.
                  </p>
                </StepShell>
              )}

              {step === 2 && (
                <StepShell
                  icon={<Layers className="w-6 h-6" />}
                  title="На какой вы стадии?"
                  subtitle="Подстроим тон и акценты — но пройдём путь целиком, с нуля"
                >
                  <div className="space-y-2.5">
                    {STAGE_OPTIONS.map((opt) => (
                      <OptionCard
                        key={opt.value}
                        selected={data.stage === opt.value}
                        onClick={() => setField("stage", opt.value)}
                        emoji={opt.emoji}
                        title={opt.label}
                        desc={opt.desc}
                      />
                    ))}
                  </div>
                </StepShell>
              )}

              {step === 3 && (
                <StepShell
                  icon={<Store className="w-6 h-6" />}
                  title="Какая у вас сфера?"
                  subtitle="Выберите ближайший вариант"
                >
                  <div className="grid grid-cols-2 gap-2.5">
                    {FORMAT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setField("format", opt.value)}
                        className={cn(
                          "rounded-2xl p-4 text-left border-2 transition-all",
                          data.format === opt.value
                            ? "border-primary bg-primary-soft"
                            : "border-bg-muted bg-bg-surface hover:border-primary/40",
                        )}
                      >
                        <p className="text-2xl">{opt.emoji}</p>
                        <p className="text-sm font-medium mt-2 text-ink">{opt.label}</p>
                      </button>
                    ))}
                  </div>
                </StepShell>
              )}

              {step === 4 && (
                <StepShell
                  icon={<Wallet className="w-6 h-6" />}
                  title="Какие у вас ресурсы?"
                  subtitle="Будем честны — это влияет на старт (можно пропустить)"
                >
                  <Label>Бюджет на старт, ₽</Label>
                  <Input
                    type="number"
                    inputMode="numeric"
                    placeholder="80000"
                    value={data.budget}
                    onChange={(e) => setField("budget", e.target.value)}
                    unit="₽"
                  />
                  <div className="mt-4">
                    <Label>Часов в неделю</Label>
                    <Input
                      type="number"
                      inputMode="numeric"
                      placeholder="20"
                      value={data.hoursPerWeek}
                      onChange={(e) => setField("hoursPerWeek", e.target.value)}
                      unit="ч"
                    />
                  </div>
                  <div className="mt-4">
                    <Label>Размер команды</Label>
                    <Select
                      value={data.teamSize as string | number}
                      onChange={(e) => setField("teamSize", e.target.value)}
                    >
                      <option value="">Выберите…</option>
                      <option value="1">Один (я)</option>
                      <option value="2">2 человека</option>
                      <option value="3">3 человека</option>
                      <option value="5">4–5 человек</option>
                      <option value="10">Больше 5</option>
                    </Select>
                  </div>
                  <div className="mt-4">
                    <Label>Навыки</Label>
                    <div className="flex flex-wrap gap-2">
                      {["Продажи", "Маркетинг", "Разработка", "Дизайн", "Финансы", "Производство", "Кулинария", "Логистика"].map(
                        (s) => (
                          <button
                            key={s}
                            onClick={() => toggleSkill(s)}
                            className={cn(
                              "chip cursor-pointer transition-colors",
                              data.skills.includes(s)
                                ? "bg-primary text-white"
                                : "bg-bg-muted text-ink hover:bg-bg-muted/70",
                            )}
                          >
                            {data.skills.includes(s) && <Check className="w-3 h-3" />}
                            {s}
                          </button>
                        ),
                      )}
                    </div>
                  </div>
                </StepShell>
              )}

              {step === 5 && (
                <StepShell
                  icon={<Target className="w-6 h-6" />}
                  title="Ваша цель на 30 дней?"
                  subtitle="К этому будем вести"
                >
                  <div className="space-y-2.5">
                    {GOAL_OPTIONS.map((opt) => (
                      <OptionCard
                        key={opt.value}
                        selected={data.goal === opt.value}
                        onClick={() => setField("goal", opt.value)}
                        emoji={opt.emoji}
                        title={opt.label}
                        desc={opt.desc}
                      />
                    ))}
                  </div>
                </StepShell>
              )}

              {step === 6 && (
                <MaterialsStep
                  brief={data.brief}
                  onBrief={(v) => setField("brief", v)}
                  files={data.files}
                  onAddFile={(f) => setData((d) => ({ ...d, files: [...d.files.filter((x) => x.name !== f.name), f] }))}
                  onRemoveFile={(name) => setData((d) => ({ ...d, files: d.files.filter((x) => x.name !== name) }))}
                />
              )}

              {step === 7 && <SummaryStep data={data} />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Sticky footer */}
        <div className="sticky bottom-0 inset-x-0 bg-bg-surface/95 backdrop-blur-md border-t border-bg-muted pb-[env(safe-area-inset-bottom)]">
          <div className="px-5 py-4">
            {step < STEPS.length - 1 ? (
              <Button fullWidth size="lg" disabled={!canProceed} onClick={() => setStep((s) => s + 1)}>
                Далее
                <ArrowRight className="w-5 h-5" />
              </Button>
            ) : (
              <Button fullWidth size="lg" onClick={handleFinish}>
                Начать траекторию
                <ArrowRight className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StepShell({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="w-12 h-12 rounded-2xl bg-primary-soft text-primary flex items-center justify-center mb-4">
        {icon}
      </div>
      <h1 className="text-2xl font-bold text-ink leading-tight">{title}</h1>
      <p className="text-secondary mt-1.5 mb-6">{subtitle}</p>
      {children}
    </div>
  );
}

function KindCard({
  selected,
  onClick,
  icon,
  title,
  desc,
  points,
}: {
  selected: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  desc: string;
  points: string[];
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-4 rounded-3xl border-2 transition-all",
        selected ? "border-primary bg-primary-soft" : "border-bg-muted bg-bg-surface hover:border-primary/40",
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
            selected ? "bg-primary text-white" : "bg-primary-soft text-primary",
          )}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold text-ink">{title}</p>
            <div
              className={cn(
                "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                selected ? "border-primary bg-primary" : "border-bg-muted",
              )}
            >
              {selected && <Check className="w-3 h-3 text-white" />}
            </div>
          </div>
          <p className="text-sm text-secondary mt-1">{desc}</p>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {points.map((p) => (
              <span key={p} className="chip bg-bg-muted text-ink text-[11px]">
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </button>
  );
}

function OptionCard({
  selected,
  onClick,
  emoji,
  title,
  desc,
}: {
  selected: boolean;
  onClick: () => void;
  emoji: string;
  title: string;
  desc: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all",
        selected ? "border-primary bg-primary-soft" : "border-bg-muted bg-bg-surface hover:border-primary/40",
      )}
    >
      <span className="text-2xl">{emoji}</span>
      <div className="flex-1">
        <p className="font-semibold text-ink">{title}</p>
        <p className="text-sm text-secondary">{desc}</p>
      </div>
      <div
        className={cn(
          "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
          selected ? "border-primary bg-primary" : "border-bg-muted",
        )}
      >
        {selected && <Check className="w-3 h-3 text-white" />}
      </div>
    </button>
  );
}

function MaterialsStep({
  brief,
  onBrief,
  files,
  onAddFile,
  onRemoveFile,
}: {
  brief: string;
  onBrief: (v: string) => void;
  files: UploadedFile[];
  onAddFile: (f: UploadedFile) => void;
  onRemoveFile: (name: string) => void;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (list: FileList | null) => {
    if (!list) return;
    setError(null);
    for (const file of Array.from(list)) {
      if (file.size > 15 * 1024 * 1024) {
        setError(`«${file.name}» больше 15 МБ — слишком большой.`);
        continue;
      }
      setBusy(file.name);
      try {
        const text = await extractTextFromFile(file);
        if (!text.trim()) setError(`В «${file.name}» не нашлось текста.`);
        else onAddFile({ name: file.name, text });
      } catch (e) {
        setError(e instanceof Error ? e.message : `Не удалось разобрать «${file.name}».`);
      } finally {
        setBusy(null);
      }
    }
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <StepShell
      icon={<FileText className="w-6 h-6" />}
      title="Данные и презентация проекта"
      subtitle="Необязательно, но так AI-кофаундер узнает ваш проект глубже"
    >
      <Label>Расскажите о проекте своими словами</Label>
      <Textarea
        value={brief}
        onChange={(e) => onBrief(e.target.value)}
        placeholder="Что за продукт, для кого, чем отличаетесь, какие цифры уже есть, что сейчас беспокоит…"
        rows={5}
      />

      <div className="mt-5">
        <Label>Презентация или документы</Label>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED_UPLOAD}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy !== null}
          className="w-full flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-bg-muted hover:border-primary/50 bg-bg-surface py-6 px-4 text-center transition-colors disabled:opacity-70"
        >
          {busy ? (
            <>
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
              <span className="text-sm text-secondary">Разбираю «{busy}»…</span>
            </>
          ) : (
            <>
              <span className="w-11 h-11 rounded-2xl bg-primary-soft text-primary flex items-center justify-center">
                <UploadCloud className="w-5 h-5" />
              </span>
              <span className="text-sm font-medium text-ink">Загрузить файлы</span>
              <span className="text-xs text-secondary">PPTX, PDF, DOCX, TXT · до 15 МБ</span>
            </>
          )}
        </button>

        {error && <p className="err mt-2">{error}</p>}

        {files.length > 0 && (
          <div className="space-y-2 mt-3">
            {files.map((f) => (
              <div
                key={f.name}
                className="flex items-center gap-3 rounded-2xl border border-bg-muted bg-bg-surface p-3"
              >
                <FileCheck2 className="w-5 h-5 text-success shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink truncate">{f.name}</p>
                  <p className="text-xs text-secondary">
                    {f.text.length.toLocaleString("ru-RU")} символов извлечено
                  </p>
                </div>
                <button
                  onClick={() => onRemoveFile(f.name)}
                  aria-label="Убрать"
                  className="w-8 h-8 rounded-full hover:bg-bg-muted flex items-center justify-center text-secondary shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-secondary mt-4 bg-bg-muted/60 rounded-2xl p-3">
        Данные хранятся на вашем устройстве. При вопросе к AI мы передаём их вместе с запросом, чтобы
        ответы были точными под ваш проект.
      </p>
    </StepShell>
  );
}

function SummaryStep({ data }: { data: Record<string, unknown> }) {
  const track: Track = data.kind === "startup" ? "tech" : "regular";
  const rec = analyzeOnboarding({
    track,
    stage: data.stage as Stage,
    format: data.format as BusinessFormat,
    goal: data.goal as Goal30,
    budget: Number(data.budget) || 0,
    hours: Number(data.hoursPerWeek) || 0,
    teamSize: Number(data.teamSize) || 1,
  });

  const trackName: Record<Track, string> = {
    tech: "Технологический стартап",
    regular: "Реальный бизнес",
  };

  const materialsCount =
    (Array.isArray(data.files) ? data.files.length : 0) +
    ((data.brief as string)?.trim() ? 1 : 0);

  return (
    <div>
      <div className="w-12 h-12 rounded-2xl bg-primary-soft text-primary flex items-center justify-center mb-4">
        <Sparkles className="w-6 h-6" />
      </div>
      <h1 className="text-2xl font-bold text-ink leading-tight">Ваша траектория готова</h1>
      <p className="text-secondary mt-1.5 mb-6">AI-кофаундер собрал персональный маршрут</p>

      <div className="card p-5 mb-4 bg-gradient-to-br from-primary-soft to-bg-surface">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-primary" />
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Рекомендация AI</p>
        </div>
        <p className="font-medium text-ink leading-relaxed">{rec.aiText}</p>
      </div>

      <div className="space-y-3 mb-5">
        <SummaryRow label="Трек развития" value={trackName[track]} emoji={track === "tech" ? "💻" : "🛍️"} />
        <SummaryRow label="Стартовая стадия" value={rec.stageTitle} emoji="🎯" />
        <SummaryRow label="Первый блок" value={rec.startModuleLabel} emoji="🚀" />
        {materialsCount > 0 && (
          <SummaryRow
            label="Материалы для AI"
            value={`Загружено: ${materialsCount} — кофаундер учтёт`}
            emoji="📎"
          />
        )}
      </div>

      <p className="text-xs font-semibold uppercase tracking-wide text-secondary mb-2">Первые шаги</p>
      <div className="space-y-2">
        {rec.firstSteps.map((s, i) => (
          <div key={s.number} className="flex items-center gap-3 p-3 rounded-2xl bg-bg-surface border border-bg-muted">
            <span className="w-7 h-7 rounded-xl bg-primary-soft text-primary flex items-center justify-center text-xs font-bold shrink-0">
              {i + 1}
            </span>
            <p className="text-sm font-medium text-ink">{s.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SummaryRow({ label, value, emoji }: { label: string; value: string; emoji: string }) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-2xl bg-bg-surface border border-bg-muted">
      <span className="text-xl">{emoji}</span>
      <div className="flex-1">
        <p className="text-xs text-secondary">{label}</p>
        <p className="font-semibold text-ink">{value}</p>
      </div>
    </div>
  );
}
