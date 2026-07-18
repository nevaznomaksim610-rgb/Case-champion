"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, Send, Trash2, Copy, Check, FileText, Database } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell } from "@/components/shell/AppShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useAppStore } from "@/store/useAppStore";
import { QUICK_ACTIONS } from "@/lib/aiEngine";
import { askAi, baseSystemPrompt, buildBusinessContext, type ChatTurn } from "@/lib/ai";
import { uid, cn } from "@/lib/utils";

export default function AIPage() {
  return (
    <AppShell>
      <AIContent />
    </AppShell>
  );
}

function AIContent() {
  const chat = useAppStore((s) => s.chat);
  const addChatMessage = useAppStore((s) => s.addChatMessage);
  const clearChat = useAppStore((s) => s.clearChat);
  const profile = useAppStore((s) => s.profile);
  const project = useAppStore((s) => s.project);
  const metrics = useAppStore((s) => s.metrics);

  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Приветствие, если чат пуст
  useEffect(() => {
    if (chat.length === 0) {
      addChatMessage({
        id: uid("msg_"),
        role: "assistant",
        createdAt: new Date().toISOString(),
        content: `Привет${profile?.name ? `, ${profile.name}` : ""}! Я ваш AI-кофаундер. ${
          project
            ? `Видел проект «${project.name}». `
            : ""
        }Помогу с идеей, оффером, экономикой и платежами. С чего начнём?`,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Автоскролл вниз
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [chat, typing]);

  // Единый вызов реального AI (DeepSeek через серверный маршрут) с контекстом бизнеса.
  const runAssistant = async (displayText: string, modelPrompt: string) => {
    addChatMessage({
      id: uid("msg_"),
      role: "user",
      content: displayText,
      createdAt: new Date().toISOString(),
    });
    setInput("");
    setTyping(true);

    // История берётся из стора уже вместе с только что добавленным сообщением.
    const history: ChatTurn[] = useAppStore
      .getState()
      .chat.filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({ role: m.role, content: m.content }));
    // Если для быстрого действия display и промпт различаются — подменяем последний ход.
    if (modelPrompt !== displayText && history.length > 0) {
      history[history.length - 1] = { role: "user", content: modelPrompt };
    }

    const system = baseSystemPrompt(buildBusinessContext(profile, project, metrics));
    const content = await askAi(history, system);

    addChatMessage({
      id: uid("msg_"),
      role: "assistant",
      content,
      createdAt: new Date().toISOString(),
    });
    setTyping(false);
  };

  const send = (text?: string) => {
    const userText = (text ?? input).trim();
    if (!userText || typing) return;
    void runAssistant(userText, userText);
  };

  const onQuick = (label: string, prompt: string) => {
    if (typing) return;
    void runAssistant(label, prompt);
  };

  const copyText = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-124px)] lg:h-[calc(100dvh-15rem)] max-w-[880px] w-full mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-primary text-white flex items-center justify-center shadow-glow">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-ink leading-tight">Альфа AI-кофаундер</h1>
            <p className="text-xs text-secondary flex items-center gap-1.5">
              <Database className="w-3 h-3" />
              Использует данные вашего проекта
            </p>
          </div>
        </div>
        {chat.length > 1 && (
          <button
            onClick={() => setConfirmClear(true)}
            aria-label="Очистить чат"
            className="w-10 h-10 rounded-full hover:bg-bg-muted flex items-center justify-center text-secondary"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Quick actions */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 -mx-1 px-1">
        {QUICK_ACTIONS.map((qa) => (
          <button
            key={qa.id}
            onClick={() => onQuick(`${qa.icon} ${qa.label}`, qa.label)}
            className="chip bg-bg-surface border border-bg-muted text-ink whitespace-nowrap shrink-0 hover:border-primary hover:text-primary transition-colors"
          >
            <span>{qa.icon}</span>
            {qa.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto mt-3 space-y-3 pb-4"
      >
        <AnimatePresence initial={false}>
          {chat.map((msg) => (
            <motion.div
              key={msg.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[85%] sm:max-w-[75%] rounded-3xl px-4 py-3",
                  msg.role === "user"
                    ? "bg-primary text-white rounded-br-md"
                    : "bg-bg-surface border border-bg-muted text-ink rounded-bl-md",
                )}
              >
                {msg.role === "assistant" && (
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center">
                      <Sparkles className="w-3 h-3" />
                    </div>
                    <span className="text-xs font-semibold text-secondary">AI-кофаундер</span>
                  </div>
                )}
                <p className="text-sm leading-relaxed whitespace-pre-line">{msg.content}</p>

                {/* Meta блоки */}
                {msg.meta && (msg.meta.goodPoints || msg.meta.unprovenPoints) && (
                  <div className="mt-3 space-y-2">
                    {msg.meta.goodPoints && msg.meta.goodPoints.length > 0 && (
                      <MetaBlock
                        title="✅ Что хорошо"
                        items={msg.meta.goodPoints}
                        tone="success"
                      />
                    )}
                    {msg.meta.unprovenPoints && msg.meta.unprovenPoints.length > 0 && (
                      <MetaBlock
                        title="⚠️ Что не доказано"
                        items={msg.meta.unprovenPoints}
                        tone="warning"
                      />
                    )}
                    {msg.meta.mainRisk && (
                      <div className="rounded-2xl bg-danger/5 border border-danger/20 p-2.5">
                        <p className="text-xs font-semibold text-danger">Главный риск</p>
                        <p className="text-xs text-ink mt-0.5">{msg.meta.mainRisk}</p>
                      </div>
                    )}
                    {msg.meta.nextStep && (
                      <div className="rounded-2xl bg-primary-soft/60 p-2.5">
                        <p className="text-xs font-semibold text-primary">Следующий шаг</p>
                        <p className="text-xs text-ink mt-0.5">{msg.meta.nextStep}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Варианты (текст для копирования) */}
                {msg.meta?.variants && msg.meta.variants.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {msg.meta.variants.map((v, vi) => (
                      <div
                        key={vi}
                        className="rounded-2xl bg-bg-muted/60 p-3"
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-xs font-semibold text-secondary uppercase tracking-wide">
                            {v.label}
                          </span>
                          <button
                            onClick={() => copyText(`${msg.id}-${vi}`, v.text)}
                            aria-label="Скопировать"
                            className="w-7 h-7 rounded-full hover:bg-bg-surface flex items-center justify-center text-secondary"
                          >
                            {copiedId === `${msg.id}-${vi}` ? (
                              <Check className="w-3.5 h-3.5 text-success" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-ink whitespace-pre-line leading-relaxed">{v.text}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Загрузка интервью */}
                {msg.role === "assistant" && msg.content.includes("Загрузите текст") && (
                  <button
                    onClick={() => copyText(msg.id, DEMO_INTERVIEW)}
                    className="mt-3 chip bg-bg-muted text-ink"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Вставить демо-интервью
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {typing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-bg-surface border border-bg-muted rounded-3xl rounded-bl-md px-4 py-3 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-secondary animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 rounded-full bg-secondary animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 rounded-full bg-secondary animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </motion.div>
        )}
      </div>

      {/* Input */}
      <div className="pt-3 border-t border-bg-muted">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="flex items-end gap-2"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            rows={1}
            placeholder="Спросите AI-кофаундера…"
            className="input flex-1 resize-none !min-h-[48px] max-h-32"
          />
          <Button type="submit" disabled={!input.trim() || typing} className="!px-4 shrink-0">
            <Send className="w-5 h-5" />
          </Button>
        </form>
      </div>

      <ConfirmDialog
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        onConfirm={() => {
          clearChat();
          addChatMessage({
            id: uid("msg_"),
            role: "assistant",
            createdAt: new Date().toISOString(),
            content: "Чат очищен. Чем могу помочь?",
          });
        }}
        title="Очистить чат?"
        description="Вся история диалога будет удалена без возможности восстановления."
        confirmLabel="Очистить"
        danger
      />
    </div>
  );
}

function MetaBlock({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "success" | "warning";
}) {
  return (
    <div
      className={cn(
        "rounded-2xl p-2.5",
        tone === "success" ? "bg-success/5 border border-success/20" : "bg-warning/5 border border-warning/20",
      )}
    >
      <p className={cn("text-xs font-semibold", tone === "success" ? "text-success" : "text-warning")}>
        {title}
      </p>
      <ul className="mt-1 space-y-0.5">
        {items.map((it, i) => (
          <li key={i} className="text-xs text-ink flex items-start gap-1.5">
            <span className={cn("mt-1 w-1 h-1 rounded-full shrink-0", tone === "success" ? "bg-success" : "bg-warning")} />
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}

const DEMO_INTERVIEW = `Интервью #1, Мария, 19 лет, студентка 2 курса
— Как обычно пьёшь кофе?
— Беру в кофейне у входа, 250₽, очередь минут 5.
— Что бесит?
— Очередь и что опаздываю. Иногда вообще без кофе.
— Сколько в неделю тратишь?
— Около 2000₽.
— Если бы можно было бронировать и забирать без очереди — воспользовались бы?
— Да, точно. И если по QR платить.`;
