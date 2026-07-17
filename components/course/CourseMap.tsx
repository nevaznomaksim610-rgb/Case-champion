"use client";

import { forwardRef, useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Lock, Star, Zap, Trophy, Sparkles } from "lucide-react";
import type { Module, ModuleProgress, ModuleStatus } from "@/types";
import { cn } from "@/lib/utils";

interface CourseMapProps {
  modules: Module[];
  progress: Record<string, ModuleProgress>;
  milestones?: { id: string; label: string; emoji: string; moduleId: string }[];
}

const STATUS_LABELS: Record<ModuleStatus, string> = {
  locked: "Закрыто",
  available: "Доступно",
  in_progress: "В работе",
  completed: "Завершено",
  credited_by_diagnostic: "Зачтено диагностикой",
  skipped_not_applicable: "Не применимо",
};

export function CourseMap({ modules, progress, milestones = [] }: CourseMapProps) {
  const activeRef = useRef<HTMLAnchorElement>(null);

  // Найти активный узел
  const activeId = modules.find((m) => {
    const s = progress[m.id]?.status;
    return s === "in_progress" || s === "available";
  })?.id;

  // Плавный скролл к активному узлу
  useEffect(() => {
    if (activeRef.current) {
      const t = setTimeout(() => {
        activeRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 300);
      return () => clearTimeout(t);
    }
  }, [activeId]);

  return (
    <div className="relative">
      {/* Извилистая вертикальная линия — фоновая */}
      <svg
        className="absolute left-[34px] top-4 bottom-4 w-[24px] pointer-events-none"
        preserveAspectRatio="none"
        viewBox="0 0 24 1000"
        fill="none"
        aria-hidden
      >
        <path
          d="M12 0 Q 22 80, 12 160 Q 2 240, 12 320 Q 22 400, 12 480 Q 2 560, 12 640 Q 22 720, 12 800 Q 2 880, 12 1000"
          stroke="#E8E8EA"
          strokeWidth="3"
          strokeDasharray="6 8"
          strokeLinecap="round"
        />
      </svg>

      <div className="space-y-5">
        {modules.map((module, idx) => {
          const status = progress[module.id]?.status ?? "locked";
          const milestone = milestones.find((m) => m.moduleId === module.id);
          const isActive = module.id === activeId;
          const align = idx % 2 === 0 ? "left" : "right";

          return (
            <div key={module.id}>
              <CourseNode
                ref={isActive ? activeRef : undefined}
                module={module}
                status={status}
                align={align}
                index={idx + 1}
              />
              {milestone && <MilestoneNode milestone={milestone} />}
            </div>
          );
        })}

        {/* Финальный узел Demo Day */}
        <FinalNode />
      </div>
    </div>
  );
}

interface CourseNodeProps {
  module: Module;
  status: ModuleStatus;
  align: "left" | "right";
  index: number;
}

const CourseNode = forwardRef<HTMLAnchorElement, CourseNodeProps>(function CourseNodeImpl(
  { module, status, index },
  ref,
) {
  const locked = status === "locked";
  const completed = status === "completed" || status === "credited_by_diagnostic";
  const active = status === "in_progress" || status === "available";

  const nodeBg = locked
    ? "bg-bg-muted text-secondary"
    : completed
      ? "bg-success text-white"
      : "bg-primary text-white";

  const cardBg = locked
    ? "bg-bg-surface/60 border-bg-muted"
    : completed
      ? "bg-bg-surface border-success/20"
      : active
        ? "bg-bg-surface border-primary shadow-glow"
        : "bg-bg-surface border-bg-muted";

  const content = (
    <>
      <div className="flex items-start gap-4">
        {/* Узел-кружок */}
        <motion.div
          whileTap={locked ? undefined : { scale: 0.92 }}
          className={cn(
            "relative w-[68px] h-[68px] rounded-full flex flex-col items-center justify-center shrink-0 shadow-card border-4 border-bg z-10",
            nodeBg,
          )}
        >
          {locked ? (
            <Lock className="w-6 h-6" />
          ) : completed ? (
            <Check className="w-7 h-7" strokeWidth={3} />
          ) : (
            <>
              <span className="text-xs font-bold opacity-80 leading-none">
                {module.number}
              </span>
              <span className="text-lg font-bold leading-none mt-0.5">{index}</span>
            </>
          )}
          {active && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-warning border-2 border-bg flex items-center justify-center">
              <Zap className="w-2.5 h-2.5 text-white" fill="white" />
            </span>
          )}
        </motion.div>

        {/* Карточка */}
        <div className={cn("flex-1 min-w-0 card border-2 p-4 transition-all", cardBg)}>
          <div className="flex items-center gap-2 mb-1">
            <span
              className={cn(
                "chip text-[10px]",
                locked
                  ? "bg-bg-muted text-secondary"
                  : status === "credited_by_diagnostic"
                    ? "bg-warning/15 text-warning"
                    : completed
                      ? "bg-success/10 text-success"
                      : "bg-primary-soft text-primary",
              )}
            >
              {module.track === "tech" && "💻 "}
              {module.track === "regular" && "🛍️ "}
              {module.number}
              {module.track !== "common" && (module.track === "tech" ? "С" : "Б")}
            </span>
            {status === "credited_by_diagnostic" && (
              <span className="chip text-[10px] bg-warning/15 text-warning">
                <Star className="w-3 h-3" /> Диагностика
              </span>
            )}
          </div>
          <h3 className={cn("font-semibold leading-tight", locked ? "text-secondary" : "text-ink")}>
            {module.title}
          </h3>
          <p className={cn("text-sm mt-1 line-clamp-2", locked ? "text-secondary/70" : "text-secondary")}>
            {module.description}
          </p>
          <div className="flex items-center gap-3 mt-3 text-xs">
            <span className={cn("flex items-center gap-1", locked ? "text-secondary/60" : "text-secondary")}>
              ⏱ {module.estimatedMinutes} мин
            </span>
            {module.milestone && (
              <span
                className={cn(
                  "flex items-center gap-1 font-medium",
                  locked ? "text-secondary/60" : "text-primary",
                )}
              >
                {module.milestone.emoji} {module.milestone.label}
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  );

  if (locked) {
    return (
      <div ref={ref as never} className="block">
        {content}
      </div>
    );
  }

  return (
    <Link href={`/course/${module.id}`} ref={ref} className="block">
      {content}
    </Link>
  );
});
export { CourseNode };

function MilestoneNode({ milestone }: { milestone: { emoji: string; label: string } }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="flex items-center justify-center my-2"
    >
      <div className="flex items-center gap-2 bg-ink text-white rounded-full pl-2 pr-4 py-1.5 shadow-soft">
        <span className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-sm">
          {milestone.emoji}
        </span>
        <span className="text-xs font-semibold">{milestone.label}</span>
        <Trophy className="w-3.5 h-3.5 text-warning" />
      </div>
    </motion.div>
  );
}

function FinalNode() {
  return (
    <Link href="/demo-day" className="flex items-center gap-4 group">
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="w-[68px] h-[68px] rounded-full bg-gradient-to-br from-primary to-primary-hover text-white flex items-center justify-center shrink-0 shadow-glow border-4 border-bg z-10"
      >
        <Trophy className="w-7 h-7" />
      </motion.div>
      <div className="flex-1 card border-2 border-primary p-4 bg-gradient-to-br from-primary-soft to-bg-surface">
        <div className="flex items-center gap-2 mb-1">
          <span className="chip text-[10px] bg-primary text-white">
            <Sparkles className="w-3 h-3" /> Финал
          </span>
        </div>
        <h3 className="font-semibold text-ink leading-tight">Demo Day</h3>
        <p className="text-sm text-secondary mt-1">
          Соберите метрики, сформируйте pitch и презентуйте проект
        </p>
      </div>
    </Link>
  );
}
