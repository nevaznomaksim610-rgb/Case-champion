"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Flame,
  Trophy,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Pencil,
  LogOut,
  Target,
  CalendarDays,
  Award,
  BadgeCheck,
} from "lucide-react";
import { AppShell } from "@/components/shell/AppShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input, Label, Select } from "@/components/ui/Field";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useAppStore } from "@/store/useAppStore";
import { getModulesForTrack } from "@/data/courseData";
import { relativeDay } from "@/lib/utils";
import type { Stage } from "@/types";

const STAGE_LABEL: Record<string, string> = {
  idea: "Только идея",
  mvp: "Есть MVP",
  selling: "Уже продаю",
};

const GOAL_LABEL: Record<string, string> = {
  choose_idea: "Выбрать идею",
  get_leads: "Получить заявки",
  first_payment: "Первый платёж",
  improve_sales: "Улучшить продажи",
  unit_economics: "Настроить экономику",
  scale: "Масштабироваться",
};

export default function ProfilePage() {
  return (
    <AppShell>
      <ProfileContent />
    </AppShell>
  );
}

function ProfileContent() {
  const router = useRouter();
  const profile = useAppStore((s) => s.profile);
  const project = useAppStore((s) => s.project);
  const streak = useAppStore((s) => s.streakDays);
  const startDate = useAppStore((s) => s.startDate);
  const achievements = useAppStore((s) => s.achievements);
  const moduleProgress = useAppStore((s) => s.moduleProgress);
  const setProfile = useAppStore((s) => s.setProfile);
  const loadDemo = useAppStore((s) => s.loadDemo);
  const resetAll = useAppStore((s) => s.resetAll);
  const pushToast = useAppStore((s) => s.pushToast);

  const [editOpen, setEditOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);

  const modules = useMemo(() => getModulesForTrack(profile?.track ?? null), [profile?.track]);
  const completedCount = modules.filter((m) => {
    const st = moduleProgress[m.id]?.status;
    return st === "completed" || st === "credited_by_diagnostic";
  }).length;

  const unlockedAch = achievements.filter((a) => a.unlocked);

  const feed = useMemo(() => {
    return [...achievements]
      .filter((a) => a.unlocked && a.unlockedAt)
      .sort((a, b) => (b.unlockedAt! > a.unlockedAt! ? 1 : -1))
      .slice(0, 6);
  }, [achievements]);

  return (
    <div className="grid lg:grid-cols-[1fr_340px] gap-6">
      <div className="space-y-5">
        {/* Profile hero */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-4xl bg-ink text-white p-6 lg:p-8"
        >
          <div className="absolute -top-24 -right-16 w-72 h-72 rounded-full bg-primary/30 blur-3xl" />
          <div className="relative flex items-start gap-4">
            <div className="w-16 h-16 rounded-3xl bg-primary flex items-center justify-center text-2xl font-bold shrink-0">
              {profile?.name?.[0]?.toUpperCase() ?? "Г"}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold tracking-tight truncate">
                {profile?.name ?? "Гость"}
              </h1>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                {profile?.age ? (
                  <span className="text-sm text-white/70">{profile.age} лет</span>
                ) : null}
                {profile?.stage && (
                  <Badge tone="primary">{STAGE_LABEL[profile.stage] ?? profile.stage}</Badge>
                )}
                {project?.name && (
                  <span className="text-sm text-white/70">· {project.name}</span>
                )}
              </div>
            </div>
            <button
              onClick={() => setEditOpen(true)}
              aria-label="Редактировать профиль"
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center shrink-0"
            >
              <Pencil className="w-4 h-4" />
            </button>
          </div>

          <div className="relative grid grid-cols-3 gap-3 mt-6">
            <StatBox icon={<Flame className="w-4 h-4" />} value={String(streak)} label="Streak" />
            <StatBox
              icon={<CheckCircle2 className="w-4 h-4" />}
              value={String(completedCount)}
              label="Блоков"
            />
            <StatBox
              icon={<Trophy className="w-4 h-4" />}
              value={String(unlockedAch.length)}
              label="Наград"
            />
          </div>

          {startDate && (
            <p className="relative text-xs text-white/50 mt-4 flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5" /> В пути с {relativeDay(startDate)}
            </p>
          )}
        </motion.div>

        {/* Achievements */}
        <section>
          <SectionHeader
            title="Достижения"
            subtitle={`Открыто ${unlockedAch.length} из ${achievements.length}`}
          />
          <Card>
            <div className="grid grid-cols-4 sm:grid-cols-4 gap-3">
              {achievements.map((a) => (
                <motion.div
                  key={a.id}
                  whileHover={{ y: -3 }}
                  className={`rounded-2xl p-3 flex flex-col items-center text-center gap-1.5 transition-all ${
                    a.unlocked
                      ? "bg-primary-soft"
                      : "bg-bg-muted/60 grayscale opacity-50"
                  }`}
                  title={a.label}
                >
                  <span className="text-2xl">{a.unlocked ? a.emoji : "🔒"}</span>
                  <span className="text-[10px] font-medium text-ink leading-tight">
                    {a.label}
                  </span>
                </motion.div>
              ))}
            </div>
          </Card>
        </section>

        {/* Activity feed */}
        <section>
          <SectionHeader title="Лента событий" subtitle="Последние milestone и награды" />
          <Card>
            {feed.length === 0 ? (
              <div className="flex items-center gap-3 py-2">
                <div className="w-9 h-9 rounded-xl bg-bg-muted flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-secondary" />
                </div>
                <p className="text-sm text-secondary">
                  Пока нет событий. Завершите первый блок, чтобы открыть награду.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {feed.map((a) => (
                  <div key={a.id} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary-soft flex items-center justify-center text-lg shrink-0">
                      {a.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink">{a.label}</p>
                      <p className="text-xs text-secondary">{relativeDay(a.unlockedAt)}</p>
                    </div>
                    <BadgeCheck className="w-4 h-4 text-success shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </section>
      </div>

      {/* Right / bottom panel */}
      <aside className="space-y-4">
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-5 h-5 text-primary" />
            <h3 className="section-title">Демо и данные</h3>
          </div>
          <p className="text-sm text-secondary mb-4">
            Загрузите готовый кейс «Campus Coffee» или очистите прогресс, чтобы начать с чистого
            листа.
          </p>
          <div className="space-y-2.5">
            <Button variant="secondary" fullWidth onClick={() => setDemoOpen(true)}>
              <Sparkles className="w-4 h-4" />
              Загрузить демо
            </Button>
            <Button variant="danger" fullWidth onClick={() => setResetOpen(true)}>
              <RotateCcw className="w-4 h-4" />
              Сбросить прогресс
            </Button>
          </div>
        </Card>

        {profile?.goal && (
          <Card className="bg-primary-soft/40 border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-primary" />
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                Цель на 30 дней
              </p>
            </div>
            <p className="font-medium text-ink">{GOAL_LABEL[profile.goal] ?? profile.goal}</p>
          </Card>
        )}

        <Card>
          <button
            onClick={() => {
              resetAll();
              pushToast({ title: "Вы вышли из демо-сессии", variant: "default" });
              router.push("/");
            }}
            className="flex items-center gap-2 text-sm text-secondary hover:text-danger transition-colors w-full"
          >
            <LogOut className="w-4 h-4" />
            Выйти на стартовый экран
          </button>
        </Card>
      </aside>

      {/* Edit modal */}
      <EditProfileModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        initialName={profile?.name ?? ""}
        initialAge={profile?.age ?? null}
        initialStage={profile?.stage ?? null}
        onSave={(name, age, stage) => {
          setProfile({ name, age, stage });
          pushToast({ title: "Профиль обновлён", variant: "success" });
        }}
      />

      <ConfirmDialog
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        onConfirm={() => {
          resetAll();
          pushToast({ title: "Прогресс сброшен", variant: "success" });
          router.push("/");
        }}
        title="Сбросить весь прогресс?"
        description="Профиль, метрики, курс и достижения вернутся к нулю. Это действие необратимо."
        confirmLabel="Сбросить"
        danger
      />

      <ConfirmDialog
        open={demoOpen}
        onClose={() => setDemoOpen(false)}
        onConfirm={() => {
          loadDemo();
          pushToast({
            title: "Демо загружено",
            description: "Кейс «Campus Coffee» готов к просмотру.",
            variant: "success",
          });
          router.push("/home");
        }}
        title="Загрузить демо-кейс?"
        description="Текущий прогресс будет заменён данными проекта «Campus Coffee»."
        confirmLabel="Загрузить демо"
      />
    </div>
  );
}

function StatBox({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-2xl bg-white/5 p-3 text-center">
      <div className="w-8 h-8 rounded-xl bg-primary/20 text-primary flex items-center justify-center mx-auto mb-1.5">
        {icon}
      </div>
      <p className="text-xl font-bold leading-none">{value}</p>
      <p className="text-[11px] text-white/60 mt-1">{label}</p>
    </div>
  );
}

function EditProfileModal({
  open,
  onClose,
  initialName,
  initialAge,
  initialStage,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  initialName: string;
  initialAge: number | null;
  initialStage: Stage | null;
  onSave: (name: string, age: number | null, stage: Stage | null) => void;
}) {
  const [name, setName] = useState(initialName);
  const [age, setAge] = useState<string>(initialAge ? String(initialAge) : "");
  const [stage, setStage] = useState<string>(initialStage ?? "");

  return (
    <Modal open={open} onClose={onClose} title="Редактировать профиль" size="sm">
      <div className="space-y-4">
        <div>
          <Label required>Имя</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ваше имя" />
        </div>
        <div>
          <Label>Возраст</Label>
          <Input
            type="number"
            inputMode="numeric"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="21"
            unit="лет"
          />
        </div>
        <div>
          <Label>Стадия</Label>
          <Select value={stage} onChange={(e) => setStage(e.target.value)}>
            <option value="">Не выбрано</option>
            <option value="idea">Только идея</option>
            <option value="mvp">Есть MVP</option>
            <option value="selling">Уже продаю</option>
          </Select>
        </div>
        <Button
          fullWidth
          disabled={!name.trim()}
          onClick={() => {
            onSave(
              name.trim(),
              age ? Number(age) : null,
              (stage || null) as Stage | null,
            );
            onClose();
          }}
        >
          Сохранить
        </Button>
      </div>
    </Modal>
  );
}
