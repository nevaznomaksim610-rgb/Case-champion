"use client";

import { type ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { AiAvatar } from "@/components/ai/AiAvatar";
import { cn } from "@/lib/utils";

// Заголовки для «внутренних» экранов (drill-down в рамках одной вкладки).
const TITLES: Record<string, string> = {
  "/business": "Мой бизнес",
  "/payments": "Платежи",
  "/finance": "Экономика",
  "/experiments": "Эксперименты",
  "/demo-day": "Demo Day",
  "/profile": "Профиль",
  "/ai": "AI-кофаундер",
};

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const streak = useAppStore((s) => s.streakDays);

  // Guard: если не онбординг — отправляем на старт
  useEffect(() => {
    if (!mounted) return;
    const onboarded = useAppStore.getState().onboarded;
    if (!onboarded && pathname !== "/" && !pathname.startsWith("/onboarding")) {
      router.replace("/");
    }
  }, [mounted, pathname, router]);

  const isHome = pathname === "/home";
  // Экран курса рисует собственную «шапку» с назад — не дублируем.
  const isCourse = pathname.startsWith("/course");
  const title = TITLES[pathname] ?? "";

  if (!mounted) {
    return (
      <div className="min-h-[100dvh] bg-[#E6E6E9] flex items-center justify-center">
        <div className="w-11 h-11 rounded-full border-4 border-primary-soft border-t-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#E6E6E9] lg:bg-gradient-to-b lg:from-[#ECECEF] lg:to-[#DDDDE2] flex justify-center lg:py-8 lg:px-6">
      {/* Единая вкладка: узкая колонка на мобиле (встраивается в Альфа-Бизнес),
          широкое «окно-приложение» на ПК */}
      <div className="relative w-full max-w-[480px] lg:max-w-[640px] bg-bg min-h-[100dvh] lg:min-h-[calc(100dvh-4rem)] flex flex-col shadow-[0_0_60px_-18px_rgba(11,11,11,0.28)] lg:rounded-[32px] lg:border lg:border-black/[0.05] lg:shadow-[0_40px_100px_-45px_rgba(11,11,11,0.5)]">
        {!isCourse && (
          <header className="sticky top-0 lg:static z-30 bg-bg-surface/90 backdrop-blur-md border-b border-bg-muted lg:rounded-t-[32px]">
            <div className="h-[60px] lg:h-[76px] px-4 lg:px-8 flex items-center justify-between gap-3">
              {isHome ? (
                <>
                  <Link href="/home" className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center font-bold text-white shrink-0">
                      А
                    </div>
                    <div className="leading-tight min-w-0">
                      <p className="text-sm font-semibold text-ink truncate">Альфа.Будущее</p>
                      <p className="text-xs text-secondary truncate">Первый бизнес</p>
                    </div>
                  </Link>
                  <button
                    aria-label="AI-кофаундер"
                    onClick={() => router.push("/ai")}
                    className="rounded-full shrink-0 ring-2 ring-primary/15 hover:ring-primary/40 transition-all"
                  >
                    <AiAvatar size={40} />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => (window.history.length > 1 ? router.back() : router.push("/home"))}
                    aria-label="Назад"
                    className="w-10 h-10 -ml-1 rounded-full hover:bg-bg-muted flex items-center justify-center text-ink shrink-0"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <p className="flex-1 text-base font-semibold text-ink truncate">{title}</p>
                  {streak > 0 && (
                    <span className="chip bg-warning/15 text-warning shrink-0">🔥 {streak}</span>
                  )}
                </>
              )}
            </div>
          </header>
        )}

        <main className="flex-1 w-full px-4 pt-4 pb-10 lg:px-8 lg:pt-7 lg:pb-14">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
