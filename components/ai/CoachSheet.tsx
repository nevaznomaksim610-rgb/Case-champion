"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { askAi, type ChatTurn } from "@/lib/ai";
import { cn } from "@/lib/utils";

interface CoachSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  system: string;
  greeting: string;
  suggestions?: string[];
  placeholder?: string;
}

// Мини-чат AI-кофаундера, встраиваемый в урок (и куда угодно).
export function CoachSheet({
  open,
  onClose,
  title = "AI-кофаундер",
  subtitle = "Ответит на любой вопрос по уроку и вашему бизнесу",
  system,
  greeting,
  suggestions = [],
  placeholder = "Спросите про этот урок…",
}: CoachSheetProps) {
  const [messages, setMessages] = useState<ChatTurn[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ role: "assistant", content: greeting }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const send = async (text?: string) => {
    const userText = (text ?? input).trim();
    if (!userText || typing) return;
    const next: ChatTurn[] = [...messages, { role: "user", content: userText }];
    setMessages(next);
    setInput("");
    setTyping(true);
    const content = await askAi(next, system);
    setMessages((m) => [...m, { role: "assistant", content }]);
    setTyping(false);
  };

  return (
    <Modal open={open} onClose={onClose} title={title} subtitle={subtitle} size="md">
      <div className="flex flex-col h-[58vh]">
        <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 pr-0.5">
          {messages.map((m, i) => (
            <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[88%] rounded-3xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line",
                  m.role === "user"
                    ? "bg-primary text-white rounded-br-md"
                    : "bg-bg-muted/60 text-ink rounded-bl-md",
                )}
              >
                {m.role === "assistant" && (
                  <div className="flex items-center gap-1.5 mb-1.5 text-primary">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span className="text-xs font-semibold">AI-кофаундер</span>
                  </div>
                )}
                {m.content}
              </div>
            </div>
          ))}
          {typing && (
            <div className="flex justify-start">
              <div className="bg-bg-muted/60 rounded-3xl rounded-bl-md px-4 py-3 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-secondary animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-secondary animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full bg-secondary animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
        </div>

        {suggestions.length > 0 && messages.length <= 1 && (
          <div className="flex flex-wrap gap-2 py-2.5">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="chip bg-bg-surface border border-bg-muted text-ink whitespace-nowrap hover:border-primary hover:text-primary transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void send();
          }}
          className="flex items-end gap-2 pt-2.5 border-t border-bg-muted mt-1"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
            rows={1}
            placeholder={placeholder}
            className="input flex-1 resize-none !min-h-[46px] max-h-28"
          />
          <Button type="submit" disabled={!input.trim() || typing} className="!px-4 shrink-0">
            <Send className="w-5 h-5" />
          </Button>
        </form>
      </div>
    </Modal>
  );
}
