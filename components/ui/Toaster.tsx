"use client";

import { useEffect } from "react";
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";
import { useAppStore } from "@/store/useAppStore";
import type { Toast } from "@/types";

const iconByVariant: Record<NonNullable<Toast["variant"]>, React.ReactNode> = {
  default: <Info className="w-5 h-5 text-ink" />,
  success: <CheckCircle2 className="w-5 h-5 text-success" />,
  warning: <AlertTriangle className="w-5 h-5 text-warning" />,
  danger: <XCircle className="w-5 h-5 text-danger" />,
};

export function Toaster() {
  const toasts = useAppStore((s) => s.toasts);
  const dismiss = useAppStore((s) => s.dismissToast);

  useEffect(() => {
    if (toasts.length === 0) return;
    const timers = toasts.map((t) =>
      setTimeout(() => dismiss(t.id), t.variant === "danger" ? 6000 : 4000),
    );
    return () => timers.forEach(clearTimeout);
  }, [toasts, dismiss]);

  if (typeof window === "undefined") return null;

  return createPortal(
    <div className="fixed top-4 inset-x-0 z-[100] flex flex-col items-center gap-2 px-4 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="pointer-events-auto bg-bg-surface shadow-soft rounded-2xl border border-bg-muted px-4 py-3 flex items-start gap-3 max-w-md w-full"
          >
            <div className="shrink-0 mt-0.5">{iconByVariant[t.variant ?? "default"]}</div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-ink text-sm leading-tight">{t.title}</p>
              {t.description && (
                <p className="text-xs text-secondary mt-0.5">{t.description}</p>
              )}
            </div>
            <button
              onClick={() => dismiss(t.id)}
              aria-label="Закрыть уведомление"
              className="w-7 h-7 rounded-full hover:bg-bg-muted flex items-center justify-center shrink-0"
            >
              <X className="w-4 h-4 text-secondary" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>,
    document.body,
  );
}
