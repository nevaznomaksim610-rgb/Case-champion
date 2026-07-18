"use client";

import { forwardRef, useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Lock, Zap, Trophy, Sparkles } from "lucide-react";
import type { Module, ModuleProgress, ModuleStatus } from "@/types";
import { COURSE_STAGES, moduleStageIndex, type CourseStageIndex } from "@/data/courseData";
import { cn } from "@/lib/utils";

interface CourseMapProps {
  modules: Module[];
  progress: Record<string, ModuleProgress>;
  milestones?: { id: string; label: string; emoji: string; moduleId: string }[];
}

function isDone(s?: ModuleStatus): boolean {
  return s === "completed" || s === "credited_by_diagnostic";
}

export function CourseMap({ modules, progress }: CourseMapProps) {
  const activeRef = useRef<HTMLAnchorElement>(null);

  const activeId = modules.find((m) => {
    const s = progress[m.id]?.status;
    return s === "in_progress" || s === "available";
  })?.id;

  useEffect(() => {
    if (activeRef.current) {
      const t = setTimeout(() => {
        activeRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 300);
      return () => clearTimeout(t);
    }
  }, [activeId]);

  const activeStage = activeId !== undefined ? moduleStageIndex(activeId) : null;

  return (
    <div className="space-y-6">
      {COURSE_STAGES.map((stage) => {
        const stageModules = modules.filter((m) => moduleStageIndex(m.id) === stage.index);
        if (stageModules.length === 0) return null;

        const allSkipped = stageModules.every(
          (m) => progress[m.id]?.status === "skipped_not_applicable",
        );
        const doneCount = stageModules.filter((m) => isDone(progress[m.id]?.status)).length;
        const isCurrent = activeStage === stage.index;

        return (
          <section key={stage.index}>
            <StageHeader
              index={stage.index}
              title={stage.title}
              subtitle={stage.subtitle}
              done={doneCount}
              total={stageModules.length}
              allSkipped={allSkipped}
              isCurrent={isCurrent}
            />

            {/* Узлы стадии с пунктирной линией-таймлайном */}
            <div className="relative mt-4">
              {stageModules.length > 1 && (
                <span
                  aria-hidden
                  className="absolute left-[27px] top-8 bottom-8 border-l-2 border-dashed border-bg-muted"
                />
              )}
              <div className="space-y-4">
                {stageModules.map((module) => {
                  const status = progress[module.id]?.status ?? "locked";
                  const isActive = module.id === activeId;
                  return (
                    <CourseNode
                      key={module.id}
                      ref={isActive ? activeRef : undefined}
                      module={module}
                      status={status}
                    />
                  );
                })}
              </div>
            </div>
          </section>
        );
      })}

      <FinalNode />
    </div>
  );
}

function StageHeader({
  index,
  title,
  subtitle,
  done,
  total,
  allSkipped,
  isCurrent,
}: {
  index: CourseStageIndex;
  title: string;
  subtitle: string;
  done: number;
  total: number;
  allSkipped: boolean;
  isCurrent: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl p-3.5 border",
        isCurrent
          ? "border-primary/30 bg-gradient-to-r from-primary-soft to-bg-surface"
          : allSkipped
            ? "border-bg-muted bg-bg-muted/30"
            : "border-bg-muted bg-bg-surface",
      )}
    >
      <div
        className={cn(
          "w-10 h-10 rounded-2xl flex items-center justify-center font-bold shrink-0",
          allSkipped ? "bg-bg-muted text-secondary" : "bg-ink text-white",
        )}
      >
        {index + 1}
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-bold leading-tight", allSkipped ? "text-secondary" : "text-ink")}>
          {title}
        </p>
        <p className="text-xs text-secondary truncate">{subtitle}</p>
      </div>
      {allSkipped ? (
        <span className="chip bg-bg-muted text-secondary text-[10px] shrink-0">не требуется</span>
      ) : (
        <span
          className={cn(
            "chip text-[10px] shrink-0 font-semibold",
            isCurrent ? "bg-primary text-white" : done === total ? "bg-success/10 text-success" : "bg-bg-muted text-secondary",
          )}
        >
          {done}/{total}
        </span>
      )}
    </div>
  );
}

interface CourseNodeProps {
  module: Module;
  status: ModuleStatus;
}

const CourseNode = forwardRef<HTMLAnchorElement, CourseNodeProps>(function CourseNodeImpl(
  { module, status },
  ref,
) {
  const locked = status === "locked";
  const skipped = status === "skipped_not_applicable";
  const completed = status === "completed" || status === "credited_by_diagnostic";
  const active = status === "in_progress" || status === "available";

  const nodeBg = completed
    ? "bg-success text-white"
    : active
      ? "bg-primary text-white"
      : "bg-bg-muted text-secondary";

  const cardBg = active
    ? "bg-bg-surface border-primary shadow-glow"
    : completed
      ? "bg-bg-surface border-success/30"
      : "bg-bg-surface border-bg-muted";

  const content = (
    <div className="relative flex items-start gap-4">
      {/* Узел-кружок */}
      <motion.div
        whileTap={locked ? undefined : { scale: 0.92 }}
        className={cn(
          "relative w-14 h-14 rounded-full flex items-center justify-center shrink-0 shadow-card border-4 border-bg-surface z-10 font-bold",
          nodeBg,
          skipped && "opacity-70",
        )}
      >
        {locked ? (
          <Lock className="w-5 h-5" />
        ) : completed ? (
          <Check className="w-6 h-6" strokeWidth={3} />
        ) : (
          <span className="text-base">{module.number}</span>
        )}
        {active && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-warning border-2 border-bg-surface flex items-center justify-center">
            <Zap className="w-2.5 h-2.5 text-white" fill="white" />
          </span>
        )}
      </motion.div>

      {/* Карточка */}
      <div
        className={cn(
          "flex-1 min-w-0 rounded-2xl border-2 p-4 transition-all",
          cardBg,
          (locked || skipped) && "opacity-75",
        )}
      >
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          {skipped && (
            <span className="chip text-[10px] bg-bg-muted text-secondary">не требуется на вашей стадии</span>
          )}
          {active && <span className="chip text-[10px] bg-primary-soft text-primary">сейчас</span>}
          {completed && (
            <span className="chip text-[10px] bg-success/10 text-success">
              <Check className="w-3 h-3" /> готово
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
          <span className="text-secondary">⏱ {module.estimatedMinutes} мин</span>
          {module.milestone && !locked && !skipped && (
            <span className="text-primary font-medium">
              {module.milestone.emoji} {module.milestone.label}
            </span>
          )}
        </div>
      </div>
    </div>
  );

  // Заблокированные — не кликабельны; пройденные/активные/пропущенные (для обзора) — открываются.
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

function FinalNode() {
  return (
    <Link href="/demo-day" className="relative flex items-start gap-4 group">
      <motion.div
        whileHover={{ scale: 1.04 }}
        className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary-hover text-white flex items-center justify-center shrink-0 shadow-glow border-4 border-bg-surface z-10"
      >
        <Trophy className="w-6 h-6" />
      </motion.div>
      <div className="flex-1 rounded-2xl border-2 border-primary p-4 bg-gradient-to-br from-primary-soft to-bg-surface">
        <span className="chip text-[10px] bg-primary text-white mb-1">
          <Sparkles className="w-3 h-3" /> Финал
        </span>
        <h3 className="font-semibold text-ink leading-tight">Demo Day</h3>
        <p className="text-sm text-secondary mt-1">Соберите метрики, сформируйте pitch и презентуйте проект</p>
      </div>
    </Link>
  );
}
