"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Circle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface HealthScoreItem {
  id: string;
  label: string;
  value: number; // 0-100
  hint?: string;
}

export function HealthScore({
  items,
  compact = false,
}: {
  items: HealthScoreItem[];
  compact?: boolean;
}) {
  const avg = items.length
    ? Math.round(items.reduce((sum, i) => sum + i.value, 0) / items.length)
    : 0;

  const status =
    avg >= 70 ? { label: "Здоров", tone: "success" } : avg >= 40 ? { label: "Средне", tone: "warning" } : { label: "Риск", tone: "danger" };

  return (
    <div className={cn("card p-5", compact && "p-4")}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-secondary">Health score</p>
          <div className="flex items-baseline gap-2 mt-0.5">
            <p className="text-3xl font-bold text-ink leading-none">{avg}</p>
            <p className="text-sm text-secondary">/ 100</p>
          </div>
        </div>
        <div
          className={cn(
            "px-3 py-1 rounded-full text-xs font-semibold",
            status.tone === "success" && "bg-success/10 text-success",
            status.tone === "warning" && "bg-warning/15 text-warning",
            status.tone === "danger" && "bg-danger/10 text-danger",
          )}
        >
          {status.label}
        </div>
      </div>
      <div className="space-y-2.5">
        {items.map((item, idx) => (
          <div key={item.id}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-secondary">{item.label}</span>
              <span className="font-medium text-ink">{item.value}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-bg-muted overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${item.value}%` }}
                transition={{ duration: 0.7, delay: idx * 0.05 }}
                className={cn(
                  "h-full rounded-full",
                  item.value >= 70 ? "bg-success" : item.value >= 40 ? "bg-warning" : "bg-danger",
                )}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RiskIndicator({ risk }: { risk: string }) {
  return (
    <div className="card p-4 flex items-start gap-3 bg-warning/5 border-warning/20">
      <div className="w-9 h-9 rounded-xl bg-warning/15 text-warning flex items-center justify-center shrink-0">
        <AlertTriangle className="w-4 h-4" />
      </div>
      <div>
        <p className="text-xs text-secondary">Ближайший риск</p>
        <p className="text-sm font-medium text-ink mt-0.5">{risk}</p>
      </div>
    </div>
  );
}

export function IndicatorGrid({
  items,
}: {
  items: { id: string; label: string; tone: "ok" | "warn" | "off" }[];
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {items.map((i) => (
        <div key={i.id} className="card p-3 text-center">
          {i.tone === "ok" ? (
            <CheckCircle2 className="w-5 h-5 text-success mx-auto mb-1" />
          ) : i.tone === "warn" ? (
            <AlertTriangle className="w-5 h-5 text-warning mx-auto mb-1" />
          ) : (
            <Circle className="w-5 h-5 text-bg-muted mx-auto mb-1" />
          )}
          <p className="text-[11px] font-medium text-ink">{i.label}</p>
        </div>
      ))}
    </div>
  );
}
