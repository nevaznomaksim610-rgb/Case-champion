import type { BusinessFormat } from "@/types";

// Профиль сферы: примеры для плейсхолдеров, чтобы уроки не «ровнялись по кофейне»,
// а подстраивались под то, что человек выбрал в онбординге.
export interface IndustryProfile {
  label: string;
  project: string;
  product: string;
  client: string;
  problem: string;
  result: string;
  mechanism: string;
  cta: string;
  channel: string;
  positioning: string;
  alternative: string;
  note: string;
  price: number;
}

export const INDUSTRY_PROFILES: Record<BusinessFormat, IndustryProfile> = {
  tech: {
    label: "Технологический продукт",
    project: "TaskFlow",
    product: "SaaS для управления задачами команды",
    client: "Небольшие IT-команды 5–20 человек",
    problem: "Задачи теряются в чатах, нет прозрачности по срокам",
    result: "Команда видит статус всех задач в одном окне",
    mechanism: "Веб-приложение с досками, оплата подписки картой",
    cta: "Начать бесплатный период 14 дней",
    channel: "Telegram-сообщества продактов",
    positioning: "Проще Jira, дешевле в 3 раза",
    alternative: "Таблицы и мессенджеры",
    note: "Подписка — основа, командные тарифы — допродажа",
    price: 990,
  },
  services: {
    label: "Услуги",
    project: "Мастер на час",
    product: "Выездной ремонт и мелкие работы по дому",
    client: "Занятые жители спальных районов 30–45 лет",
    problem: "Нет времени и навыков чинить самому, страшно нарваться на халтурщика",
    result: "Проверенный мастер приедет в удобное время",
    mechanism: "Заявка через сайт, оплата после работы по QR/СБП",
    cta: "Оставить заявку на сегодня",
    channel: "Локальные чаты района и Авито",
    positioning: "Приедем за 2 часа, фикс-цена без сюрпризов",
    alternative: "Искать мастера по объявлениям",
    note: "Базовый выезд — вход, доп. работы — рост чека",
    price: 2500,
  },
  beauty: {
    label: "Бьюти",
    project: "Studio Glow",
    product: "Маникюр и уход за руками",
    client: "Девушки 20–35 лет, ценят время и эстетику",
    problem: "Долго искать мастера, неудобно записываться, боятся качества",
    result: "Аккуратный маникюр за 60 минут с онлайн-записью",
    mechanism: "Онлайн-запись, предоплата брони по СБП",
    cta: "Записаться на удобное время",
    channel: "Instagram* и локальные бьюти-чаты",
    positioning: "Стерильно, по времени, с гарантией на 2 недели",
    alternative: "Салоны у дома без записи",
    note: "Маникюр — основа, уход и дизайн — допродажа",
    price: 1800,
  },
  horeca: {
    label: "HoReCa",
    project: "Campus Coffee",
    product: "Свежий кофе навынос у кампуса",
    client: "Студенты 18–24, спешат на пары",
    problem: "Некогда варить кофе перед парами, в кофейнях очереди",
    result: "Кофе за 60 секунд без очереди",
    mechanism: "Заказ через QR, оплата СБП, самовывоз",
    cta: "Забронировать кофе на утро",
    channel: "Чаты факультетов в Telegram",
    positioning: "Самый быстрый кофе по пути в универ",
    alternative: "Растворимый дома или очередь в сетевой кофейне",
    note: "Кофе — основа, десерты — допродажа",
    price: 200,
  },
  retail: {
    label: "Розница",
    project: "EcoBox",
    product: "Магазин эко-товаров для дома",
    client: "Семьи 28–45 лет, следят за экологичностью",
    problem: "Сложно найти безопасную бытовую химию и товары без пластика",
    result: "Проверенные эко-товары в одном месте с доставкой",
    mechanism: "Витрина + оплата картой/СБП, доставка или самовывоз",
    cta: "Собрать первый эко-набор",
    channel: "Маркетплейсы и локальный Instagram*",
    positioning: "Только проверенные бренды, честный состав",
    alternative: "Искать по разным магазинам и маркетплейсам",
    note: "Ходовые товары — трафик, наборы — маржа",
    price: 1200,
  },
  production: {
    label: "Производство",
    project: "CraftWood",
    product: "Мебель из массива на заказ",
    client: "Владельцы квартир и кафе, ценят натуральное",
    problem: "Готовая мебель не подходит по размеру и качеству",
    result: "Мебель точно под размер и стиль клиента",
    mechanism: "Замер → предоплата 50% по счёту → изготовление → монтаж",
    cta: "Рассчитать стоимость по вашим размерам",
    channel: "Дизайнеры интерьеров и профильные выставки",
    positioning: "Массив, а не ЛДСП, сроки от 2 недель",
    alternative: "Сетевые мебельные магазины",
    note: "Типовые изделия — поток, кастом — маржа",
    price: 45000,
  },
  other: {
    label: "Ваш бизнес",
    project: "Мой проект",
    product: "Ваш продукт или услуга",
    client: "Ваш основной сегмент клиентов",
    problem: "Проблема, которую вы решаете",
    result: "Результат, который получает клиент",
    mechanism: "Как клиент заказывает и оплачивает",
    cta: "Ваш призыв к действию",
    channel: "Ваш основной канал привлечения",
    positioning: "Чем вы лучше альтернатив",
    alternative: "Чем клиенты решают проблему сейчас",
    note: "Что основа, а что — допродажа",
    price: 1000,
  },
};

export function getIndustryProfile(format: BusinessFormat | null | undefined): IndustryProfile {
  if (!format) return INDUSTRY_PROFILES.other;
  return INDUSTRY_PROFILES[format] ?? INDUSTRY_PROFILES.other;
}

// Какое поле практики каким примером сферы заполнять.
const FIELD_TO_PROFILE: Record<string, keyof IndustryProfile> = {
  name: "project",
  product: "product",
  client: "client",
  segment: "client",
  forWhom: "client",
  problem: "problem",
  result: "result",
  mechanism: "mechanism",
  scenario: "mechanism",
  cta: "cta",
  channel: "channel",
  positioning: "positioning",
  alternative: "alternative",
  note: "note",
  price: "price",
};

// Персональный плейсхолдер под сферу пользователя (иначе — исходный).
export function personalizedPlaceholder(
  fieldName: string,
  original: string | undefined,
  format: BusinessFormat | null | undefined,
): string | undefined {
  const key = FIELD_TO_PROFILE[fieldName];
  if (!key) return original;
  const profile = getIndustryProfile(format);
  const value = profile[key];
  if (value === undefined || value === null || value === "") return original;
  return String(value);
}
