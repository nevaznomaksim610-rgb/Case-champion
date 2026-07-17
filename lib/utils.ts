import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMoney(value: number, withSymbol = true): string {
  const rounded = Math.round(value);
  const formatted = new Intl.NumberFormat("ru-RU").format(rounded);
  return withSymbol ? `${formatted} ₽` : formatted;
}

export function formatNumber(value: number, digits = 0): string {
  return new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number, digits = 1): string {
  if (!isFinite(value)) return "—";
  return `${value.toFixed(digits)}%`;
}

export function uid(prefix = ""): string {
  return `${prefix}${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

export function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export function pluralize(n: number, forms: [string, string, string]): string {
  const n10 = n % 10;
  const n100 = n % 100;
  if (n10 === 1 && n100 !== 11) return forms[0];
  if (n10 >= 2 && n10 <= 4 && (n100 < 10 || n100 >= 20)) return forms[1];
  return forms[2];
}

export function daysBetween(from: string, to: string): number {
  const diff = new Date(to).getTime() - new Date(from).getTime();
  return Math.max(0, Math.round(diff / 86400000));
}

export function todayISO(): string {
  return new Date().toISOString();
}

export function relativeDay(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}
