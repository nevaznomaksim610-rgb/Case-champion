import { NextResponse } from "next/server";

// Серверный маршрут: только тут используется секретный ключ DeepSeek.
// Ключ не попадает в браузер и в репозиторий.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";

interface Msg {
  role: "user" | "assistant" | "system";
  content: string;
}

// ===== Лимиты: чтобы нельзя было «задудосить» и сжечь все токены =====
const DAILY_LIMIT = 67; // сообщений в день на один IP
const BURST_LIMIT = 20; // сообщений в минуту на один IP (защита от флуда)
const dailyHits = new Map<string, { day: string; count: number }>();
const burstHits = new Map<string, number[]>();

function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

// День по Москве (+3), чтобы лимит сбрасывался в предсказуемое время.
function todayKey(): string {
  return new Date(Date.now() + 3 * 3600_000).toISOString().slice(0, 10);
}

type LimitResult = { limited: false } | { limited: true; reason: "burst" | "daily" };

function checkRateLimit(ip: string): LimitResult {
  const now = Date.now();

  // 1) Анти-флуд: не более BURST_LIMIT запросов за 60 секунд.
  const recent = (burstHits.get(ip) ?? []).filter((t) => now - t < 60_000);
  if (recent.length >= BURST_LIMIT) {
    burstHits.set(ip, recent);
    return { limited: true, reason: "burst" };
  }
  recent.push(now);
  burstHits.set(ip, recent);

  // 2) Дневной лимит.
  const day = todayKey();
  const rec = dailyHits.get(ip);
  if (!rec || rec.day !== day) {
    dailyHits.set(ip, { day, count: 1 });
  } else if (rec.count >= DAILY_LIMIT) {
    return { limited: true, reason: "daily" };
  } else {
    rec.count += 1;
  }

  // Лёгкая уборка, чтобы карты не росли бесконечно.
  if (dailyHits.size > 5000) {
    for (const [k, v] of dailyHits) if (v.day !== day) dailyHits.delete(k);
  }
  if (burstHits.size > 5000) {
    for (const [k, v] of burstHits) if (v.every((t) => now - t >= 60_000)) burstHits.delete(k);
  }

  return { limited: false };
}

export async function POST(req: Request) {
  // Ограничение частоты: защита от флуда и переизрасходования токенов.
  const rate = checkRateLimit(clientIp(req));
  if (rate.limited) {
    return NextResponse.json(
      {
        content:
          rate.reason === "burst"
            ? "Слишком много сообщений подряд. Подождите минуту — и продолжим 🦁"
            : "На сегодня лимит исчерпан: 67 сообщений в день. Возвращайтесь завтра, я буду на связи 🦁",
        error: rate.reason === "burst" ? "rate_burst" : "rate_daily",
      },
      { status: 429 },
    );
  }

  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) {
    return NextResponse.json(
      {
        content:
          "AI-кофаундер пока не подключён: на сервере не задан ключ DEEPSEEK_API_KEY. Добавьте его в .env.local (локально) и в переменные окружения на Vercel.",
        error: "no_key",
      },
      { status: 200 },
    );
  }

  let body: { messages?: Msg[]; system?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ content: "Некорректный запрос.", error: "bad_request" }, { status: 400 });
  }

  // Большой лимит — чтобы в системный промпт помещались материалы проекта.
  const system = typeof body.system === "string" ? body.system.slice(0, 24000) : "";
  const history: Msg[] = (Array.isArray(body.messages) ? body.messages : [])
    .filter(
      (m): m is Msg =>
        !!m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim().length > 0,
    )
    .slice(-16)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }));

  if (history.length === 0) {
    return NextResponse.json({ content: "Задайте вопрос — и я помогу.", error: "empty" }, { status: 200 });
  }

  const messages: Msg[] = [];
  if (system) messages.push({ role: "system", content: system });
  messages.push(...history);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45000);
    const res = await fetch(DEEPSEEK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages,
        temperature: 0.6,
        max_tokens: 1000,
        stream: false,
      }),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      return NextResponse.json(
        {
          content: "AI временно недоступен, попробуйте ещё раз через минуту.",
          error: `upstream_${res.status}`,
          detail: detail.slice(0, 300),
        },
        { status: 200 },
      );
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data?.choices?.[0]?.message?.content?.trim() || "Не удалось получить ответ. Попробуйте переформулировать вопрос.";
    return NextResponse.json({ content });
  } catch {
    return NextResponse.json(
      { content: "Не удалось связаться с AI. Проверьте соединение и попробуйте снова.", error: "network" },
      { status: 200 },
    );
  }
}
