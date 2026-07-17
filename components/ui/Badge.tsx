import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "primary" | "dark" | "success" | "warning" | "danger" | "neutral" | "soft";

const toneClass: Record<Tone, string> = {
  primary: "bg-primary-soft text-primary",
  dark: "bg-ink text-white",
  success: "bg-success/10 text-success",
  warning: "bg-warning/15 text-warning",
  danger: "bg-danger/10 text-danger",
  neutral: "bg-bg-muted text-secondary",
  soft: "bg-bg-muted text-ink",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return <span className={cn("chip", toneClass[tone], className)}>{children}</span>;
}
