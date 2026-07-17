import type { AIInsight, ChatMessage, Module, UserProfile, ProjectInfo } from "@/types";
import { uid } from "@/lib/utils";

// ===== Mock AI-движок: без внешних запросов =====

interface AnalyzeParams {
  module: Module;
  answers: Record<string, unknown>;
  profile?: UserProfile | null;
  project?: ProjectInfo | null;
}

/**
 * Анализирует ответы практики и возвращает insight.
 * Локальная эвристика по наличию и качеству ответов.
 */
export function analyzeModule(p: AnalyzeParams): AIInsight {
  const { module, answers } = p;
  const goodPoints: string[] = [];
  const unprovenPoints: string[] = [];
  let mainRisk = "Не указан.";
  const suggestions: AIInsight["suggestions"] = [];

  const filled = Object.entries(answers).filter(([, v]) => {
    if (Array.isArray(v)) return v.length > 0;
    if (typeof v === "string") return v.trim().length > 0;
    return v !== undefined && v !== null && v !== "";
  });

  const has = (key: string) =>
    answers[key] !== undefined &&
    answers[key] !== "" &&
    answers[key] !== null &&
    !(Array.isArray(answers[key]) && (answers[key] as unknown[]).length === 0);

  const getStr = (key: string) =>
    has(key) ? String(answers[key]) : "";

  // Блок-специфичная логика
  switch (module.id) {
    case "m1": {
      if (has("problem")) goodPoints.push("Чётко сформулирована проблема.");
      if (has("client")) goodPoints.push("Понятно, кто клиент.");
      if (has("budget")) goodPoints.push("Реалистично оценен бюджет.");
      if (!has("price")) unprovenPoints.push("Не задана цена — нет проверки готовности платить.");
      if (!has("problem")) unprovenPoints.push("Проблема описана размыто.");
      mainRisk = has("budget")
        ? "Бюджета может не хватить на устойчивый запуск — проверьте минимальный старт."
        : "Не оценены ресурсы — есть риск выгореть до результата.";
      suggestions.push({
        id: "offer",
        label: "Усилить формулировку продукта",
        text: `${getStr("product") || "Ваш продукт"} — для ${getStr("client") || "целевой аудитории"}, решает ${getStr("problem") || "конкретную проблему"}. Старт от ${answers.price ?? 250}₽.`,
      });
      break;
    }
    case "m2": {
      const count = Number(answers.interviewCount ?? 0);
      if (count >= 5) goodPoints.push(`Проведено ${count} интервью — достаточно для вывода.`);
      else unprovenPoints.push(`Интервью мало (${count}). Нужно минимум 5–10.`);
      if (has("quote")) goodPoints.push("Есть яркая цитата — сильный сигнал.");
      if (!has("willingnessToPay") || answers.willingnessToPay === "Не готовы")
        unprovenPoints.push("Не подтверждена готовность платить.");
      mainRisk = count < 5 ? "Малая выборка — выводы могут быть случайными." : "Готовность платить заявлена, но не проверена реальным платежом.";
      suggestions.push({
        id: "next_q",
        label: "Вопросы для следующих интервью",
        text: "1) Когда в последний раз покупали кофе? 2) Сколько тратите в неделю? 3) Что бесит в текущих вариантах? 4) Готовы ли оплатить бронь?",
      });
      break;
    }
    case "m3": {
      if (has("positioning")) goodPoints.push("Позиционирование сформулировано.");
      if (!has("differentiation")) unprovenPoints.push("Не описано отличие от конкурентов.");
      mainRisk = "Без ясного отличия клиенты выберут по цене, а не по ценности.";
      suggestions.push({
        id: "pos",
        label: "Карта позиционирования",
        text: "Оси: цена × скорость. Ваше место — низкая/средняя цена + максимальная скорость. Это пустая ниша рядом с кампусом.",
      });
      break;
    }
    case "m4": {
      if (has("result")) goodPoints.push("Описан конкретный результат клиента.");
      if (has("proof")) goodPoints.push("Есть доказательство — это повышает доверие.");
      const low = Number(answers.priceLow ?? 0);
      const mid = Number(answers.priceMid ?? 0);
      const high = Number(answers.priceHigh ?? 0);
      if (!mid) unprovenPoints.push("Не задана базовая цена.");
      if (mid && low && low >= mid) unprovenPoints.push("Низкая цена не ниже базовой — пересмотрите.");
      mainRisk = "Цена без проверки спроса может быть завышена или занижена.";
      suggestions.push({
        id: "offer_text",
        label: "Готовый текст оффера",
        text: `Для ${getStr("forWhom") || "вашей аудитории"}, которые сталкиваются с «${getStr("problem") || "проблемой"}». Результат: ${getStr("result") || "ценность"} за ${getStr("mechanism") ? getStr("mechanism") : "несколько шагов"}. Цена: ${mid || 250}₽. ${getStr("cta") || "Оформить сейчас"}.`,
      });
      break;
    }
    case "m5": {
      const payments = Number(answers.payments ?? 0);
      const leads = Number(answers.leads ?? 0);
      if (payments > 0) goodPoints.push(`Получено ${payments} оплат — спрос подтверждён.`);
      else unprovenPoints.push("Нет ни одной оплаты — спрос не доказан.");
      if (leads && payments) {
        const conv = ((payments / leads) * 100).toFixed(1);
        goodPoints.push(`Конверсия в оплату: ${conv}%.`);
      }
      mainRisk = payments === 0 ? "Без реального платежа все выводы о спросе — гипотезы." : "Малая выборка оплат — нужна серия для устойчивости.";
      suggestions.push({
        id: "next_step",
        label: "Рекомендация по тесту",
        text:
          payments >= 5
            ? "Продолжайте: спрос есть. Увеличьте бюджет и отследите CAC."
            : leads > 10
              ? "Измените оффер: добавьте срочность или снизьте шаг бронирования."
              : "Остановите и пересмотрите канал — мало переходов.",
      });
      break;
    }
    case "m6": {
      const price = Number(answers.price ?? 0);
      const varCost = Number(answers.variableCost ?? 0);
      if (price > varCost) goodPoints.push("Маржа с продажи положительная.");
      else unprovenPoints.push("Цена ниже переменных затрат — продажа в минус.");
      mainRisk = "Постоянные расходы могут не окупиться при низкой конверсии.";
      suggestions.push({
        id: "scenario",
        label: "Сценарии экономики",
        text: `Пессимистичный: конверсия −30%. Базовый: текущие цифры. Оптимистичный: конверсия +30%. Проверьте точку безубыточности в /finance.`,
      });
      break;
    }
    case "m7": {
      if (has("form")) goodPoints.push("Выбрана форма бизнеса.");
      const checklist = (answers.checklist as string[]) ?? [];
      if (checklist.length >= 3) goodPoints.push(`Готово ${checklist.length} пунктов чек-листа.`);
      else unprovenPoints.push(`Готово только ${checklist.length} пунктов чек-листа.`);
      mainRisk = "Онлайн-продажи без фискализации грозят штрафом.";
      suggestions.push({
        id: "checklist",
        label: "Персональный чек-лист",
        text: `Форма: ${answers.form ?? "—" }. Следующие шаги: 1) Регистрация; 2) Счёт ИП/самозанятого; 3) Облачная касса для онлайн; 4) Договор-оферта на сайте. Disclaimer: сверяйтесь со специалистом.`,
      });
      break;
    }
    default: {
      if (filled.length >= 3) goodPoints.push("Большинство полей заполнено.");
      else unprovenPoints.push("Заполнено мало полей — добавьте деталей.");
      mainRisk = "Без конкретики выводы останутся общими.";
    }
  }

  if (goodPoints.length === 0)
    goodPoints.push("Вы начали заполнять практику — это уже шаг вперёд.");
  if (unprovenPoints.length === 0)
    unprovenPoints.push("Все ключевые поля заполнены — структура есть.");
  if (suggestions.length === 0)
    suggestions.push({
      id: "generic",
      label: "Следующий шаг",
      text: `Опишите детали по практике блока «${module.title}», и я предложу конкретные улучшения.`,
    });

  return {
    goodPoints: goodPoints.slice(0, 4),
    unprovenPoints: unprovenPoints.slice(0, 3),
    mainRisk,
    nextStep: suggestions[0]?.text ?? "Заполните больше деталей.",
    suggestions,
  };
}

// ===== Чат AI-кофаундера =====

export const QUICK_ACTIONS = [
  { id: "clarify_idea", label: "Уточнить идею", icon: "💡" },
  { id: "make_questions", label: "Составить вопросы", icon: "❓" },
  { id: "analyze_interview", label: "Разобрать интервью", icon: "🎤" },
  { id: "compare_competitors", label: "Сравнить конкурентов", icon: "🗺️" },
  { id: "boost_offer", label: "Усилить оффер", icon: "✨" },
  { id: "calc_economics", label: "Посчитать экономику", icon: "📊" },
  { id: "pick_payments", label: "Подобрать платежи", icon: "🏦" },
  { id: "week_plan", label: "План на неделю", icon: "📅" },
  { id: "prepare_pitch", label: "Подготовить питч", icon: "🎯" },
] as const;

export type QuickActionId = (typeof QUICK_ACTIONS)[number]["id"];

export function chatReply(
  actionId: string | null,
  userText: string,
  ctx: { project?: ProjectInfo | null; profile?: UserProfile | null },
): ChatMessage {
  const projectName = ctx.project?.name ?? "ваш проект";
  const industry = ctx.project?.industry ?? "ваша сфера";
  const baseTime = new Date().toISOString();
  const id = uid("msg_");

  if (actionId) {
    switch (actionId as QuickActionId) {
      case "clarify_idea":
        return {
          id,
          role: "assistant",
          createdAt: baseTime,
          content: `По «${projectName}» идея звучит перспективно в сфере «${industry}». Что бы я уточнил:`,
          meta: {
            goodPoints: [
              "Конкретная аудитория — это уже половина успеха",
              "Понятная проблема, которую можно оплатить",
            ],
            unprovenPoints: [
              "Не проверена готовность платить реальными деньгами",
              "Нет оценки重复 покупок",
            ],
            mainRisk: "Идея может оказаться «нравится», а не «нужно».",
            nextStep: "Проведите 5 интервью и спросите про прошлые траты.",
            variants: [
              { label: "Коротко", text: `${projectName}: решение реальной боли для конкретной аудитории.` },
              { label: "Для лендинга", text: `${projectName} — это ${industry.toLowerCase()} для тех, кому важно время и качество. Без воды, с проверенным результатом.` },
            ],
          },
        };
      case "make_questions":
        return {
          id,
          role: "assistant",
          createdAt: baseTime,
          content: "Вот набор вопросов для интервью. Открытые, про прошлое поведение:",
          meta: {
            variants: [
              { label: "Стартовые", text: "1) Когда в последний раз сталкивались с этой проблемой?\n2) Как пытались решить?\n3) Сколько тратили на решение?\n4) Что бесило больше всего?\n5) Если бы решение появилось — готовы ли оплатить прямо сейчас?" },
              { label: "Глубинные", text: "1) Расскажите про типичный день.\n2) Что вы пробовали и почему бросили?\n3) Сколько готовы платить в месяц?\n4) Кому ещё порекомендуете?\n5) Что должно случиться, чтобы вы перестали пользоваться?" },
            ],
          },
        };
      case "analyze_interview":
        return {
          id,
          role: "assistant",
          createdAt: baseTime,
          content: "Загрузите текст интервью (можно вставить в чат). Я выделю боли, частоту и готовность платить.",
          meta: {
            goodPoints: ["Ищу повторяющиеся слова и фразы", "Сравниваю с прошлыми тратами"],
            mainRisk: "Малая выборка даёт случайные выводы — нужно 5–10 интервью.",
            nextStep: "Вставьте 2–3 цитаты — я покажу паттерн.",
          },
        };
      case "compare_competitors":
        return {
          id,
          role: "assistant",
          createdAt: baseTime,
          content: "Сравните 5–7 конкурентов по осям цена × скорость. Свободная ниша — ваше место.",
          meta: {
            variants: [
              { label: "Карта", text: "Оси: цена (по горизонтали) × скорость/удобство (по вертикали). Нанесите конкурентов. Пустые зоны — возможности." },
              { label: "Таблица", text: "Колонки: название | цена | клиент | канал | способ оплаты | плюсы | минусы. Заполните в «Мой бизнес → Конкуренты»." },
            ],
          },
        };
      case "boost_offer":
        return {
          id,
          role: "assistant",
          createdAt: baseTime,
          content: "Усиленный оффер по формуле: для кого + проблема + результат + срок + доказательство.",
          meta: {
            goodPoints: ["Добавьте конкретное число в результат", "Доказательство удваивает доверие"],
            variants: [
              { label: "Срочность", text: "Для студентов у кампуса: кофе за 60 секунд через QR. Первым 50 — бронь за полцены. Готовы? Оплатите сейчас." },
              { label: "Гарантия", text: "Свежий кофе у кампуса. Не понравится — вернём деньги. Без очередей, оплата СБП за 10 секунд." },
            ],
          },
        };
      case "calc_economics":
        return {
          id,
          role: "assistant",
          createdAt: baseTime,
          content: "Откройте «Финансы» и введите цену, переменные и постоянные затраты. Я считаю CAC, LTV, точку безубыточности и runway.",
          meta: {
            goodPoints: ["Все формулы реальные", "Три сценария: пессимистичный, базовый, оптимистичный"],
            mainRisk: "LTV/CAC < 3 — привлечение съедает прибыль.",
            nextStep: "Перейдите в /finance и заполните форму.",
          },
        };
      case "pick_payments":
        return {
          id,
          role: "assistant",
          createdAt: baseTime,
          content: "Пройдите платёжный мастер в «Платежи». Я подберу комплект под ваш сценарий: точка, выезд или онлайн.",
          meta: {
            goodPoints: ["СБП и ссылка — для раннего старта", "Терминал и касса — для точки"],
            mainRisk: "AlfaPOS и mPOS — разные продукты, не путайте.",
            nextStep: "Откройте /payments и пройдите 12 вопросов.",
          },
        };
      case "week_plan":
        return {
          id,
          role: "assistant",
          createdAt: baseTime,
          content: "План на неделю для «${projectName}»:",
          meta: {
            variants: [
              {
                label: "7 дней",
                text: "Пн: 2 интервью.\nВт: 2 интервью + собрать цитаты.\nСр: оформить оффер и тестовую страницу.\nЧт: запустить рекламу в чат.\nПт: ответить на заявки.\nСб: принять первые оплаты.\nВс: разобрать метрики и решить — продолжать/менять.",
              },
            ],
          },
        };
      case "prepare_pitch":
        return {
          id,
          role: "assistant",
          createdAt: baseTime,
          content: "Структура pitch на 90 секунд: проблема → решение → метрики → ask.",
          meta: {
            variants: [
              {
                label: "Pitch 90 сек",
                text: `«Студенты тратят по 400₽ в день и стоят в очередях. ${projectName} — это свежий кофе за 60 секунд через QR. Мы провели 12 интервью, получили 9 оплат за 7 дней, выручка 1350₽. Ищем ${ctx.profile?.budget ?? 80000}₽ на вторую точку и масштабирование.»`,
              },
            ],
          },
        };
    }
  }

  // Свободный ввод
  const text = userText.trim();
  return {
    id,
    role: "assistant",
    createdAt: baseTime,
    content: text.length
      ? `Принял: «${text.slice(0, 120)}». По проекту «${projectName}» рекомендую сфокусироваться на одном следующем действии — это даёт самый быстрый результат.`
      : "Я ваш AI-кофаундер. Знаю данные вашего проекта и помогу с идеей, оффером, экономикой и платежами. Выберите быстрое действие или напишите вопрос.",
    meta: {
      goodPoints: ["Данные проекта учтены", "Фокус на проверяемом результате"],
      mainRisk: "Распыление на несколько каналов сразу.",
      nextStep: "Выберите одно быстрое действие сверху.",
    },
  };
}
