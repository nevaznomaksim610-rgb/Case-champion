"use client";

import { type InputHTMLAttributes, type TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
  unit?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, invalid, unit, ...props },
  ref,
) {
  return (
    <div className="relative">
      <input
        ref={ref}
        className={cn("input", invalid && "border-danger focus:border-danger focus:ring-danger/10", unit && "pr-12", className)}
        {...props}
      />
      {unit && (
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-secondary pointer-events-none">
          {unit}
        </span>
      )}
    </div>
  );
});

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, invalid, rows = 3, ...props },
  ref,
) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={cn("input resize-none", invalid && "border-danger", className)}
      {...props}
    />
  );
});

interface SelectProps extends InputHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, invalid, children, ...props },
  ref,
) {
  return (
    <select
      ref={ref}
      className={cn("input appearance-none bg-bg-surface pr-10", invalid && "border-danger", className)}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%236B6B73' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 14px center",
      }}
      {...props}
    >
      {children}
    </select>
  );
});

export function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="label">
      {children}
      {required && <span className="text-primary ml-0.5">*</span>}
    </label>
  );
}
