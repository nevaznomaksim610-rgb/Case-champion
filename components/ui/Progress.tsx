import { cn } from "@/lib/utils";

export function Progress({
  value,
  max = 100,
  className,
  tone = "primary",
}: {
  value: number;
  max?: number;
  className?: string;
  tone?: "primary" | "success" | "warning";
}) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  const toneClass =
    tone === "success"
      ? "bg-success"
      : tone === "warning"
        ? "bg-warning"
        : "bg-primary";
  return (
    <div className={cn("h-2 rounded-full bg-bg-muted overflow-hidden", className)}>
      <div
        className={cn("h-full rounded-full transition-all duration-500", toneClass)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function CircularProgress({
  value,
  size = 56,
  stroke = 6,
  className,
  label,
}: {
  value: number;
  size?: number;
  stroke?: number;
  className?: string;
  label?: string;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference;
  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E8E8EA"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#EF3124"
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-ink">
        {label ?? `${Math.round(value)}%`}
      </div>
    </div>
  );
}
