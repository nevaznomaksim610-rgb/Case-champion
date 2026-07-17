import { type LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  delta?: { value: string; up: boolean };
  tone?: "primary" | "dark" | "success" | "warning";
  hint?: string;
}

const toneIconBg: Record<NonNullable<MetricCardProps["tone"]>, string> = {
  primary: "bg-primary-soft text-primary",
  dark: "bg-ink text-white",
  success: "bg-success/10 text-success",
  warning: "bg-warning/15 text-warning",
};

export function MetricCard({ icon: Icon, label, value, delta, tone, hint }: MetricCardProps) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <div
          className={cn(
            "w-9 h-9 rounded-xl flex items-center justify-center",
            tone ? toneIconBg[tone] : "bg-primary-soft text-primary",
          )}
        >
          <Icon className="w-4 h-4" />
        </div>
        {delta && (
          <span
            className={cn(
              "flex items-center gap-0.5 text-xs font-medium",
              delta.up ? "text-success" : "text-danger",
            )}
          >
            {delta.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {delta.value}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-ink leading-none">{value}</p>
      <p className="text-xs text-secondary mt-1.5">{label}</p>
      {hint && <p className="text-[10px] text-secondary/70 mt-1">{hint}</p>}
    </div>
  );
}
