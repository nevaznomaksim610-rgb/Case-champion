"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Play, Sparkles, TrendingUp, Wallet, Target } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/Button";

export default function LandingPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const onboarded = useAppStore((s) => s.onboarded);

  useEffect(() => setMounted(true), []);

  const features = [
    { icon: Target, title: "От идеи к платежу", text: "Не учитесь ради сертификата — доводим до реальных оплат" },
    { icon: Sparkles, title: "AI-кофаундер", text: "Локальный ИИ анализирует ваши данные и предлагает шаги" },
    { icon: TrendingUp, title: "Реальная экономика", text: "Считаем CAC, LTV, точку безубыточности — с графиками" },
    { icon: Wallet, title: "Свои платежи", text: "Подбираем комплект платежей Альфа-Банка под ваш сценарий" },
  ];

  return (
    <div className="min-h-[100dvh] bg-bg overflow-x-hidden">
      {/* Hero */}
      <div className="relative">
        {/* Background gradient mesh */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -right-20 w-[480px] h-[480px] rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute top-40 -left-32 w-[420px] h-[420px] rounded-full bg-primary/10 blur-3xl" />
        </div>

        <div className="relative max-w-[1280px] mx-auto px-5 sm:px-6 lg:px-8 pt-10 sm:pt-16 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2.5 mb-8 sm:mb-12"
          >
            <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center font-bold text-white shadow-glow">
              А
            </div>
            <div className="leading-tight">
              <p className="font-semibold text-ink">Альфа.Будущее</p>
              <p className="text-xs text-secondary">Экосистема Альфа-Банка</p>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <span className="chip bg-primary-soft text-primary mb-5">
                <Sparkles className="w-3.5 h-3.5" /> Новый раздел
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-ink leading-[1.05]">
                Первый бизнес <br />
                начинается с <span className="text-primary">первого действия</span>
              </h1>
              <p className="text-lg text-secondary mt-5 max-w-md leading-relaxed">
                AI-кофаундер, который ведёт вас от идеи до первых реальных платежей. Без воды — только действия, метрики и результаты.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <Button
                  size="lg"
                  fullWidth
                  onClick={() => router.push("/onboarding")}
                  className="sm:w-auto"
                >
                  Начать
                  <ArrowRight className="w-5 h-5" />
                </Button>
                <Button
                  size="lg"
                  variant="dark"
                  fullWidth
                  onClick={() => {
                    useAppStore.getState().loadDemo();
                    router.push("/home");
                  }}
                  className="sm:w-auto"
                >
                  <Play className="w-5 h-5" />
                  Открыть демо
                </Button>
              </div>

              <p className="text-xs text-secondary mt-4">
                Демо открывается без регистрации. Прогресс сохраняется на устройстве.
              </p>

              {/* Отдельная кнопка «Продолжить» — только для тех, кто уже прошёл онбординг */}
              {mounted && onboarded && (
                <Button
                  size="lg"
                  variant="secondary"
                  fullWidth
                  onClick={() => router.push("/home")}
                  className="mt-4 sm:w-auto"
                >
                  Продолжить путь
                  <ArrowRight className="w-5 h-5" />
                </Button>
              )}
            </motion.div>

            {/* Phone mockup */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, rotate: 4 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.7, delay: 0.2, type: "spring", damping: 22 }}
              className="hidden lg:flex justify-center"
            >
              <PhoneMockup />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-[1280px] mx-auto px-5 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="card p-5"
            >
              <div className="w-11 h-11 rounded-2xl bg-primary-soft text-primary flex items-center justify-center mb-4">
                <f.icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-ink mb-1">{f.title}</h3>
              <p className="text-sm text-secondary leading-relaxed">{f.text}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-[1280px] mx-auto px-5 sm:px-6 lg:px-8 pb-16">
        <div className="relative overflow-hidden rounded-4xl bg-ink text-white p-8 sm:p-12">
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-primary/30 blur-3xl" />
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight max-w-xl text-white">
              Не лендинг. Не курс. <span className="text-primary">Рабочий продукт.</span>
            </h2>
            <p className="text-white/70 mt-4 max-w-lg">
              Кликабельные сценарии, формы с валидацией, расчёты, графиками и сохранением прогресса. Один клик — и вы внутри.
            </p>
            <div className="mt-6">
              <Button
                size="lg"
                onClick={() => {
                  useAppStore.getState().loadDemo();
                  router.push("/home");
                }}
              >
                Открыть демо
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <footer className="border-t border-bg-muted py-8">
        <div className="max-w-[1280px] mx-auto px-5 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-secondary">
          <p>© 2026 Альфа.Будущее — демонстрационный MVP</p>
          <p>Сделано как case study. Не является публичной офертой.</p>
        </div>
      </footer>
    </div>
  );
}

function PhoneMockup() {
  return (
    <div className="relative w-[300px] h-[620px] rounded-[48px] bg-ink p-3 shadow-soft">
      <div className="absolute top-3 left-1/2 -translate-x-1/2 w-32 h-6 bg-ink rounded-b-2xl z-10" />
      <div className="w-full h-full rounded-[40px] bg-bg overflow-hidden relative">
        <div className="px-5 pt-12 pb-5">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs text-secondary">Привет, Алексей</p>
              <p className="font-semibold text-ink">Campus Coffee</p>
            </div>
            <span className="chip bg-warning/15 text-warning text-[10px]">🔥 4</span>
          </div>

          <div className="rounded-3xl bg-ink text-white p-5 mb-4 relative overflow-hidden">
            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-primary/40 blur-xl" />
            <p className="text-xs text-white/60 relative">Прогресс</p>
            <p className="text-3xl font-bold mt-1 relative">42%</p>
            <div className="h-1.5 rounded-full bg-white/15 overflow-hidden mt-3 relative">
              <div className="h-full bg-primary rounded-full" style={{ width: "42%" }} />
            </div>
            <p className="text-xs text-white/60 mt-3 relative">Следующий шаг: Ассортимент</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              { e: "✅", n: "Идея", s: "done" },
              { e: "✅", n: "Проблема", s: "done" },
              { e: "🔴", n: "Оффер", s: "active" },
              { e: "🔒", n: "Платёж", s: "locked" },
            ].map((x) => (
              <div
                key={x.n}
                className={`rounded-2xl p-3 ${
                  x.s === "done"
                    ? "bg-success/10"
                    : x.s === "active"
                      ? "bg-primary-soft border-2 border-primary"
                      : "bg-bg-muted/50"
                }`}
              >
                <p className="text-lg">{x.e}</p>
                <p className="text-[11px] font-medium text-ink mt-1">{x.n}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
