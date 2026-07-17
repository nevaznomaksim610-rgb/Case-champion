"use client";

import { type ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
  footer?: ReactNode;
}

export function Modal({ open, onClose, title, subtitle, children, size = "md", footer }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (typeof window === "undefined") return null;

  const sizeClass = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
  }[size];

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.98 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className={cn(
              "relative bg-bg-surface w-full rounded-t-4xl sm:rounded-4xl shadow-soft max-h-[92vh] flex flex-col",
              sizeClass,
            )}
          >
            {(title || subtitle) && (
              <div className="px-6 pt-6 pb-4 flex items-start justify-between gap-3 border-b border-bg-muted">
                <div>
                  {title && <h2 className="text-xl font-semibold text-ink">{title}</h2>}
                  {subtitle && <p className="text-sm text-secondary mt-1">{subtitle}</p>}
                </div>
                <button
                  onClick={onClose}
                  aria-label="Закрыть"
                  className="w-9 h-9 rounded-full hover:bg-bg-muted flex items-center justify-center shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
            <div className="overflow-y-auto px-6 py-5 flex-1">{children}</div>
            {footer && <div className="px-6 py-4 border-t border-bg-muted">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
