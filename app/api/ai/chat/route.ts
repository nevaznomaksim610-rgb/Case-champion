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

export async function POST(req: Request) {
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
