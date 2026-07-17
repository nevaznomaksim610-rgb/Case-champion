import { type HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function Card({ className, ...props }, ref) {
    return <div ref={ref} className={cn("card p-5", className)} {...props} />;
  },
);

export const CardSoft = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function CardSoft({ className, ...props }, ref) {
    return <div ref={ref} className={cn("card-soft p-5", className)} {...props} />;
  },
);

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h3 className={cn("section-title", className)}>{children}</h3>;
}

export function CardHeader({
  title,
  subtitle,
  action,
  icon,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 mb-4">
      <div className="flex items-start gap-3">
        {icon && (
          <div className="w-10 h-10 rounded-2xl bg-primary-soft flex items-center justify-center text-primary shrink-0">
            {icon}
          </div>
        )}
        <div>
          <h3 className="section-title leading-tight">{title}</h3>
          {subtitle && <p className="text-sm text-secondary mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}
