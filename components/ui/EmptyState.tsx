import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center px-6 py-10 rounded-3xl border border-dashed border-bg-muted bg-bg-surface/50",
        className,
      )}
    >
      {icon && (
        <div className="w-14 h-14 rounded-2xl bg-primary-soft flex items-center justify-center text-primary mb-3">
          {icon}
        </div>
      )}
      <h3 className="font-semibold text-ink">{title}</h3>
      {description && <p className="text-sm text-secondary mt-1 max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
