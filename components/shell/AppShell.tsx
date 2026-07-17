"use client";

import { type ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Home,
  Briefcase,
  Sparkles,
  CreditCard,
  User,
  Flame,
  Bell,
  Calendar as CalendarIcon,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { cn, relativeDay } from "@/lib/utils";

const NAV = [
  { href: "/home", label: "Главная", icon: Home },
  { href: "/business", label: "Бизнес", icon: Briefcase },
  { href: "/ai", label: "AI", icon: Sparkles, ai: true },
  { href: "/payments", label: "Платежи", icon: CreditCard },
  { href: "/profile", label: "Профиль", icon: User },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const profile = useAppStore((s) => s.profile);
  const streak = useAppStore((s) => s.streakDays);

  // Guard: если не онбординг — отправляем на старт
  useEffect(() => {
    if (!mounted) return;
    const onboarded = useAppStore.getState().onboarded;
    if (!onboarded && pathname !== "/" && !pathname.startsWith("/onboarding")) {
      router.replace("/");
    }
  }, [mounted, pathname, router]);

  if (!mounted) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-primary-soft border-t-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-bg">
      {/* Desktop sidebar */}
      <DesktopSidebar pathname={pathname} />

      {/* Mobile header */}
      <MobileHeader streak={streak} name={profile?.name} />

      {/* Main content */}
      <main
        className={cn(
          "lg:pl-[260px] min-h-[100dvh]",
          "pt-[68px] lg:pt-0",
        )}
      >
        <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8 pb-[120px] lg:pb-10 pt-4 lg:pt-8">
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
        </div>
      </main>

      {/* Floating AI button (mobile) */}
      <FloatingAIButton visible={pathname !== "/ai"} />

      {/* Mobile bottom nav */}
      <MobileBottomNav pathname={pathname} />
    </div>
  );
}

function DesktopSidebar({ pathname }: { pathname: string }) {
  const profile = useAppStore((s) => s.profile);
  const project = useAppStore((s) => s.project);
  const moduleProgress = useAppStore((s) => s.moduleProgress);

  const completed = Object.values(moduleProgress).filter(
    (p) => p.status === "completed" || p.status === "credited_by_diagnostic",
  ).length;
  const total = Object.values(moduleProgress).filter((p) => p.status !== "locked").length || 1;
  const pct = Math.round((completed / Math.max(total, 1)) * 100);

  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-[260px] bg-ink text-white p-5 z-30">
      <Link href="/home" className="flex items-center gap-2.5 mb-8">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center font-bold text-white">
          А
        </div>
        <div className="leading-tight">
          <p className="font-semibold text-sm">Альфа.Будущее</p>
          <p className="text-xs text-white/60">Первый бизнес</p>
        </div>
      </Link>

      <nav className="flex flex-col gap-1 flex-1">
        {NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-colors",
                active ? "bg-primary text-white" : "text-white/70 hover:bg-white/5 hover:text-white",
              )}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 rounded-2xl bg-white/5 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm">
            {profile?.name?.[0] ?? "А"}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{profile?.name ?? "Гость"}</p>
            <p className="text-xs text-white/60 truncate">{project?.name ?? "—"}</p>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-white/60 mb-1.5">
          <span>Прогресс</span>
          <span className="text-white font-medium">{pct}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </aside>
  );
}

function MobileHeader({ streak, name }: { streak: number; name?: string }) {
  const router = useRouter();
  return (
    <header className="lg:hidden fixed top-0 inset-x-0 z-30 bg-bg-surface/85 backdrop-blur-md border-b border-bg-muted">
      <div className="h-[68px] px-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center font-bold text-white shrink-0">
            А
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink truncate">
              Привет, {name ?? "предприниматель"}
            </p>
            <p className="text-xs text-secondary">Альфа.Будущее</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {streak > 0 && (
            <span className="chip bg-warning/15 text-warning">
              <Flame className="w-3.5 h-3.5" /> {streak}
            </span>
          )}
          <button
            aria-label="Календарь"
            className="w-9 h-9 rounded-full hover:bg-bg-muted flex items-center justify-center"
          >
            <CalendarIcon className="w-5 h-5 text-ink" />
          </button>
          <button
            aria-label="Уведомления"
            onClick={() => router.push("/profile")}
            className="w-9 h-9 rounded-full hover:bg-bg-muted flex items-center justify-center relative"
          >
            <Bell className="w-5 h-5 text-ink" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
          </button>
        </div>
      </div>
    </header>
  );
}

function MobileBottomNav({ pathname }: { pathname: string }) {
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-bg-surface/95 backdrop-blur-md border-t border-bg-muted pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-5 h-[68px]">
        {NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          if (item.ai) {
            // central AI slot is occupied by floating button visually; keep slot subtle
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                className="flex flex-col items-center justify-center gap-0.5 text-secondary"
              >
                <Icon className={cn("w-5 h-5", active && "text-primary")} />
                <span className={cn("text-[10px]", active && "text-primary font-medium")}>
                  {item.label}
                </span>
              </Link>
            );
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 transition-colors",
                active ? "text-primary" : "text-secondary",
              )}
            >
              <Icon className="w-5 h-5" />
              <span className={cn("text-[10px]", active && "font-medium")}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function FloatingAIButton({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: "spring", damping: 18, stiffness: 320 }}
          aria-label="Спросить AI-кофаундера"
          onClick={() => {
            window.location.href = "/ai";
          }}
          className="lg:hidden fixed bottom-[84px] right-4 z-40 w-14 h-14 rounded-full bg-primary text-white shadow-glow flex items-center justify-center"
        >
          <Sparkles className="w-6 h-6" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

export function StreakChip({ days }: { days: number }) {
  if (days <= 0) return null;
  return (
    <span className="chip bg-warning/15 text-warning">
      <Flame className="w-3.5 h-3.5" /> 🔥 {days}{" "}
      {days === 1 ? "день" : days < 5 ? "дня" : "дней"}
    </span>
  );
}

export function MobileOnlyNotice({ date }: { date: string | null }) {
  return (
    <span className="text-xs text-secondary">{relativeDay(date)}</span>
  );
}
