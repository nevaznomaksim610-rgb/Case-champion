import type { Module } from "@/types";

// ===== ОБЩАЯ ЧАСТЬ: блоки 1–8 =====
export const COMMON_MODULES: Module[] = [
  {
    id: "m1",
    number: "1",
    title: "Выбор бизнес-идеи",
    shortTitle: "Идея",
    description:
      "Найдите идею, которая решает реальную проблему и подходит вашим ресурсам.",
    track: "common",
    estimatedMinutes: 18,
    milestone: { id: "idea_set", label: "Идея сформулирована", emoji: "💡" },
    learn: [
      {
        title: "Проблема — это и есть бизнес",
        thesis:
          "Бизнес начинается с боли клиента, а не с продукта. Если проблему можно оплатить — это уже потенциал.",
        examples: [
          "Людям некогда варить кофе утром → мобильная кофейня у метро.",
          "Студенты не понимают, как запустить проект → курс-кофаундер.",
        ],
        checklist: [
          "Проблема повторяется часто",
          "Человек уже пытается её решить",
          "Есть готовность платить",
        ],
      },
      {
        title: "Идея vs навыки vs бюджет",
        thesis:
          "Хорошая идея та, что лежит на пересечении ваших сильных сторон, реального времени и доступных денег.",
        examples: [
          "Мало денег → услуга с минимальным оборудованием.",
          "Много времени, мало денег → контент-продукт или сервис.",
        ],
      },
      {
        title: "Стартап или обычный бизнес",
        thesis:
          "Стартап — это проверка гипотез и поиск модели. Обычный бизнес — повторяемые продажи понятного продукта.",
        checklist: [
          "Знаю, кому продаю — обычный бизнес",
          "Пока ищу, кому и как — стартап",
        ],
      },
    ],
    quiz: [
      {
        question: "С чего начинается жизнеспособный бизнес?",
        options: [
          "С красивого названия",
          "С проблемы клиента, которую он готов оплачивать",
          "С офиса и логотипа",
        ],
        correctIndex: 1,
        explanation: "Бизнес рождается из оплачиваемой проблемы.",
      },
      {
        question: "Когда идея «подходит» вам?",
        options: [
          "Когда она модная",
          "Когда совпадает с навыками, временем и бюджетом",
          "Когда о ней пишут в медиа",
        ],
        correctIndex: 1,
        explanation: "Ресурсы определяют, какую идею реально запустить.",
      },
    ],
    practice: {
      intro:
        "Опишите продукт одной строкой. Чем конкретнее — тем понятнее клиентам.",
      fields: [
        { name: "name", label: "Название проекта", type: "text", placeholder: "Campus Coffee", required: true },
        { name: "product", label: "Что будете продавать", type: "text", placeholder: "Свежий кофе у кампуса", required: true },
        { name: "client", label: "Кто клиент", type: "text", placeholder: "Студенты 18–24", required: true },
        { name: "problem", label: "Какую проблему решаете", type: "textarea", placeholder: "Некогда варить кофе перед парами", required: true },
        { name: "price", label: "Цена за единицу", type: "number", unit: "₽", placeholder: "250" },
        { name: "budget", label: "Бюджет на старт", type: "number", unit: "₽", placeholder: "80000" },
        { name: "time", label: "Часов в неделю", type: "number", placeholder: "20" },
        {
          name: "goal",
          label: "Цель на 30 дней",
          type: "select",
          options: [
            "Сформулировать идею",
            "Получить первые заявки",
            "Получить первый платёж",
            "Улучшить продажи",
            "Настроить экономику",
            "Масштабироваться",
          ],
        },
      ],
    },
    aiRole:
      "Анализирует ваши ограничения (бюджет, время, навыки) и предлагает 2–3 сценария идеи с указанием рисков.",
    resultDescription: "Сформулированная идея и формат бизнеса.",
    completionCriteria: [
      "Заполнены ключевые поля практики",
      "Получен анализ AI-кофаундера",
      "Сохранён результат",
    ],
  },
  {
    id: "m2",
    number: "2",
    title: "Клиент и проблема",
    shortTitle: "Проблема",
    description:
      "Подтвердите проблему через 5–10 интервью с реальными людьми.",
    track: "common",
    estimatedMinutes: 25,
    milestone: { id: "problem_validated", label: "Проблема подтверждена", emoji: "🎯" },
    learn: [
      {
        title: "Сегментация",
        thesis:
          "Сегмент — это конкретная группа со схожими потребностями и каналом доступа.",
        examples: ["Студенты-первокурсники", "Фрилансеры с доходом 80–150к"],
      },
      {
        title: "Интерес ≠ готовность платить",
        thesis:
          "«Круто» не равно «куплю». Проверяйте прошлые попытки решения и реальные траты.",
        checklist: [
          "Спрашивайте про прошлые траты",
          "Не предлагайте свой продукт на интервью",
          "Ищите эмоции в голосе",
        ],
      },
      {
        title: "Хорошие вопросы",
        thesis:
          "Открытые вопросы о прошлом поведении говорят правду лучше, чем фантазии о будущем.",
        examples: [
          "Когда вы в последний раз сталкивались с этим?",
          "Как пытались решить?",
          "Сколько на это потратили?",
        ],
      },
    ],
    quiz: [
      {
        question: "Что важнее услышать на интервью?",
        options: [
          "«Купил бы ваш продукт»",
          "Сколько человек уже тратил на решение проблемы",
          "«Мне нравится идея»",
        ],
        correctIndex: 1,
        explanation: "Реальные прошлые траты — главный сигнал.",
      },
    ],
    practice: {
      intro:
        "Опишите сегмент и результаты интервью. Чем больше цитат — тем точнее вывод.",
      fields: [
        { name: "segment", label: "Сегмент клиента", type: "text", placeholder: "Студенты вечерних вузов", required: true },
        { name: "criteria", label: "Критерии сегмента", type: "text", placeholder: "18–24, живут в общежитии" },
        { name: "interviewCount", label: "Сколько интервью провели", type: "number", placeholder: "8" },
        { name: "quote", label: "Яркая цитата", type: "textarea", placeholder: "«Я трачу 400₽ в день на кофе»" },
        { name: "alternative", label: "Чем решают сейчас", type: "text", placeholder: "Растворимый дома" },
        { name: "frequency", label: "Как часто сталкиваются", type: "text", placeholder: "Ежедневно" },
        {
          name: "willingnessToPay",
          label: "Готовность платить",
          type: "select",
          options: ["Не готовы", "До 200₽", "200–500₽", "500–2000₽", "Более 2000₽"],
        },
        { name: "conclusion", label: "Вывод по проблеме", type: "textarea", placeholder: "Проблема подтверждена: 7 из 8 готовы платить 200–300₽" },
      ],
    },
    aiRole:
      "Готовит вопросы для интервью, группирует цитаты, выявляет повторяющиеся боли и формирует портрет клиента.",
    resultDescription: "Подтверждённая проблема с цитатами и готовностью платить.",
    completionCriteria: [
      "Указано количество интервью",
      "Есть цитата и вывод",
      "AI проанализировал ответы",
    ],
  },
  {
    id: "m3",
    number: "3",
    title: "Рынок и конкуренты",
    shortTitle: "Конкуренты",
    description: "Сравните 5–7 конкурентов и найдите своё позиционирование.",
    track: "common",
    estimatedMinutes: 22,
    milestone: { id: "positioning", label: "Позиционирование найдено", emoji: "🗺️" },
    variant: "default",
    learn: [
      {
        title: "Прямые и косвенные",
        thesis:
          "Прямые делают то же самое. Косвенные решают ту же проблему иначе. Учитывайте и тех, и других.",
        examples: ["Прямой: соседняя кофейня. Косвенный: домашняя турка."],
      },
      {
        title: "Карта позиционирования",
        thesis:
          "Отложите конкурентов по двум осям (например, цена и скорость). Ваше место — там, где пусто.",
      },
    ],
    quiz: [
      {
        question: "Кто косвенный конкурент мобильной кофейни?",
        options: ["Другая кофейня", "Растворимый кофе дома", "Сайт с кофе"],
        correctIndex: 1,
        explanation: "Косвенный — решает ту же потребность иначе.",
      },
    ],
    practice: {
      intro: "Соберите сравнительную таблицу конкурентов в разделе «Мой бизнес → Конкуренты».",
      fields: [
        { name: "positioning", label: "Ваше позиционирование", type: "textarea", placeholder: "Самый быстрый кофе по пути в универ" },
        {
          name: "differentiation",
          label: "В чём ваше отличие",
          type: "text",
          placeholder: "QR-оплата через СБП, без очереди",
        },
      ],
    },
    aiRole:
      "Строит карту конкурентов, находит свободные ниши и формулирует позиционирование.",
    resultDescription: "Понятное позиционирование и отличие от конкурентов.",
    completionCriteria: [
      "Заполнена таблица конкурентов (минимум 3)",
      "Сформулировано позиционирование",
    ],
  },
  {
    id: "m4",
    number: "4",
    title: "Продукт, оффер и цена",
    shortTitle: "Оффер",
    description: "Соберите оффер, который понятно, зачем покупать.",
    track: "common",
    estimatedMinutes: 20,
    milestone: { id: "first_offer", label: "Первый оффер готов", emoji: "✨" },
    learn: [
      {
        title: "Оффер = ценность за деньги",
        thesis:
          "Хороший оффер отвечает: для кого, какая проблема, какой результат, за какой срок и почему вы.",
        checklist: ["Для кого", "Проблема", "Результат", "Срок", "Доказательство"],
      },
      {
        title: "Три цены",
        thesis:
          "Всегда держите в голове три цены: себестоимость, цена рынка, цена «на грани». Тестируйте среднюю.",
      },
    ],
    quiz: [
      {
        question: "Что входит в сильный оффер?",
        options: [
          "Только цена",
          "Для кого, проблема, результат, срок, доказательство",
          "Красивый логотип",
        ],
        correctIndex: 1,
        explanation: "Оффер — это обещание конкретного результата конкретному человеку.",
      },
    ],
    practice: {
      intro: "Опишите оффер и три ценовых уровня.",
      fields: [
        { name: "forWhom", label: "Для кого", type: "text", placeholder: "Студентов у кампуса", required: true },
        { name: "problem", label: "Проблема", type: "text", placeholder: "Нет времени на утренний кофе" },
        { name: "result", label: "Результат", type: "text", placeholder: "Кофе за 60 секунд" },
        { name: "mechanism", label: "Как это работает", type: "text", placeholder: "Заказ через QR, оплата СБП" },
        { name: "proof", label: "Доказательство", type: "text", placeholder: "12 интервью, 8 готовы платить" },
        { name: "priceLow", label: "Цена низкая", type: "number", unit: "₽" },
        { name: "priceMid", label: "Цена базовая", type: "number", unit: "₽" },
        { name: "priceHigh", label: "Цена премиум", type: "number", unit: "₽" },
        { name: "cta", label: "Призыв к действию", type: "text", placeholder: "Забронировать кофе на утро" },
      ],
    },
    aiRole:
      "Предлагает варианты оффера, проверяет ясность, советует по цене и рекламному тексту.",
    resultDescription: "Готовый оффер с тремя ценами и понятным CTA.",
    completionCriteria: [
      "Заполнены для кого, проблема, результат",
      "Указаны три цены",
      "AI проверил ясность",
    ],
  },
  {
    id: "m5",
    number: "5",
    title: "Проверка спроса реальным платежом",
    shortTitle: "Первый платёж",
    description: "Получите первую оплату ещё до полного запуска продукта.",
    track: "common",
    estimatedMinutes: 30,
    milestone: { id: "first_payment", label: "Первый платёж", emoji: "💰" },
    variant: "experiments",
    paymentProducts: [
      { productId: "sbp", reason: "Самый быстрый способ принять первый платёж: QR или ссылка." },
      { productId: "payment_link", reason: "Подходит для раннего теста в соцсетях и мессенджерах." },
      {
        productId: "internet_acquiring",
        reason: "Только если есть сайт или приложение для дистанционной оплаты.",
      },
    ],
    learn: [
      {
        title: "Предзаказ, бронь, депозит",
        thesis:
          "Не нужно делать продукт целиком. Примите предоплату или бронь — это и есть проверка спроса.",
        examples: ["Бронь кофе на утро за 50%", "Депозит за первое занятие"],
      },
      {
        title: "Заявка vs оплата",
        thesis:
          "Заявка ничего не стоит. Оплата — единственный честный сигнал спроса.",
      },
    ],
    quiz: [
      {
        question: "Что сильнее подтверждает спрос?",
        options: ["100 лайков", "50 заявок", "3 оплаченных предзаказа"],
        correctIndex: 2,
        explanation: "Деньги — единственный честный сигнал.",
      },
    ],
    practice: {
      intro:
        "Опишите тест спроса и зафиксируйте результат. Платежи можно подобрать в мастере.",
      fields: [
        { name: "hypothesis", label: "Гипотеза", type: "textarea", placeholder: "10 студентов оплатят бронь кофе за 150₽" },
        { name: "channel", label: "Канал привлечения", type: "text", placeholder: "Telegram-чат факультета" },
        { name: "budget", label: "Бюджет на тест", type: "number", unit: "₽" },
        { name: "url", label: "Тестовая страница (URL)", type: "text", placeholder: "t.me/+campuscoffee" },
        { name: "visits", label: "Переходы", type: "number" },
        { name: "leads", label: "Заявки", type: "number" },
        { name: "payments", label: "Оплаты", type: "number" },
        { name: "revenue", label: "Выручка", type: "number", unit: "₽" },
        { name: "criteria", label: "Критерий успеха", type: "text", placeholder: "≥5 оплат за 7 дней" },
      ],
    },
    aiRole:
      "Помогает с материалами, оценкой трафика и конверсии, рекомендацией: продолжать, менять или остановиться.",
    resultDescription: "Реальный первый платёж и вывод о спросе.",
    completionCriteria: [
      "Указана гипотеза и канал",
      "Зафиксированы оплаты",
      "AI дал рекомендацию",
    ],
  },
  {
    id: "m6",
    number: "6",
    title: "Экономика бизнеса",
    shortTitle: "Экономика",
    description: "Посчитайте, при каких условиях бизнес сходится в плюс.",
    track: "common",
    estimatedMinutes: 28,
    milestone: { id: "economics_done", label: "Экономика посчитана", emoji: "📊" },
    variant: "finance_calc",
    learn: [
      {
        title: "Выручка, маржа, прибыль",
        thesis:
          "Выручка — это оборот. Маржа — доля прибыли в цене. Прибыль — то, что остаётся после всех расходов.",
      },
      {
        title: "CAC и LTV",
        thesis:
          "CAC — во сколько вам обходится клиент. LTV — сколько он приносит за всю жизнь. LTV/CAC ≥ 3 — здорово.",
      },
      {
        title: "Точка безубыточности",
        thesis:
          "Сколько клиентов нужно, чтобы покрыть расходы. Ниже — работаете в минус.",
      },
    ],
    quiz: [
      {
        question: "Какой LTV/CAC считается здоровым?",
        options: ["0.5", "1", "3 и выше"],
        correctIndex: 2,
        explanation: "Клиент приносит минимум в 3 раза больше, чем привлечение.",
      },
    ],
    practice: {
      intro:
        "Откройте финансовый калькулятор и введите свои цифры. Результат сохранится здесь.",
      fields: [
        { name: "price", label: "Цена", type: "number", unit: "₽", required: true },
        { name: "variableCost", label: "Переменные затраты на единицу", type: "number", unit: "₽" },
        { name: "fixedCost", label: "Постоянные расходы в месяц", type: "number", unit: "₽" },
        { name: "adBudget", label: "Рекламный бюджет в месяц", type: "number", unit: "₽" },
        { name: "leads", label: "Лиды в месяц", type: "number" },
        { name: "customers", label: "Клиенты в месяц", type: "number" },
      ],
    },
    aiRole:
      "Прогоняет три сценария и указывает критические допущения: цена, конверсия, повторные продажи.",
    resultDescription: "Посчитанная экономика с тремя сценариями.",
    completionCriteria: [
      "Заполнен финансовый калькулятор",
      "LTV/CAC > 1 либо зафиксирован риск",
    ],
  },
  {
    id: "m7",
    number: "7",
    title: "Юридический запуск",
    shortTitle: "Юр. запуск",
    description: "Выберите форму бизнеса и разберитесь с налогами и чеками.",
    track: "common",
    estimatedMinutes: 20,
    milestone: { id: "legal_set", label: "Юридическая схема выбранна", emoji: "📄" },
    learn: [
      {
        title: "Самозанятость, ИП, ООО",
        thesis:
          "Самозанятость — быстрый старт и 4–6% налог. ИП — масштаб. ООО — партнёры и инвестиции.",
        checklist: [
          "Самозанятость: до 2,4 млн ₽/год",
          "ИП: нанимаете сотрудников",
          "ООО: несколько учредителей",
        ],
      },
      {
        title: "Чеки, возвраты, данные",
        thesis:
          "Онлайн-продажи требуют фискализации. Разделяйте личные и бизнес-деньги с первого дня.",
      },
    ],
    quiz: [
      {
        question: "Что нужно для онлайн-продаж?",
        options: [
          "Только счёт",
          "Фискализация и онлайн-чек",
          "Ничего",
        ],
        correctIndex: 1,
        explanation: "Онлайн-продажи требуют облачной кассы и электронного чека.",
      },
    ],
    practice: {
      intro: "Выберите форму и отметьте готовность по чек-листу.",
      fields: [
        {
          name: "form",
          label: "Форма бизнеса",
          type: "select",
          options: ["Самозанятость", "ИП", "ООО", "Пока не выбрал"],
        },
        {
          name: "b2b2c",
          label: "Кому продаёте",
          type: "select",
          options: ["B2C", "B2B", "Смешанно"],
        },
        {
          name: "channel",
          label: "Канал продаж",
          type: "select",
          options: ["Онлайн", "Офлайн", "Онлайн + офлайн"],
        },
        {
          name: "cash",
          label: "Наличные",
          type: "checkbox",
        },
        {
          name: "checklist",
          label: "Что готово",
          type: "multiselect",
          options: [
            "Регистрация",
            "Банковский счёт",
            "Онлайн-касса",
            "Договор-оферта",
            "Политика данных",
            "Возвраты",
          ],
        },
      ],
    },
    aiRole:
      "Собирает персональный чек-лист простым языком. Disclaimer: сверяйтесь со специалистом.",
    resultDescription: "Выбранная юридическая форма и чек-лист готовности.",
    completionCriteria: ["Выбрана форма бизнеса", "Отмечен чек-лист"],
  },
  {
    id: "m8",
    number: "8",
    title: "Платёжная инфраструктура",
    shortTitle: "Платежи",
    description: "Соберите комплект платежей под ваш сценарий.",
    track: "common",
    estimatedMinutes: 22,
    milestone: { id: "payments_set", label: "Платежи настроены", emoji: "🏦" },
    variant: "payments_wizard",
    learn: [
      {
        title: "Платежей много — выбирайте под сценарий",
        thesis:
          "СБП для быстрого старта, эквайринг для сайта, терминал для точки. Не смешивайте продукты без нужды.",
      },
      {
        title: "AlfaPOS и mPOS — разные",
        thesis:
          "AlfaPOS — Android-смартфон для бесконтактной оплаты. mPOS — отдельный мобильный эквайринг для выездов.",
      },
    ],
    quiz: [
      {
        question: "Что подходит для быстрого теста спроса?",
        options: ["СБП или платёжная ссылка", "Торговый эквайринг", "Касса самообслуживания"],
        correctIndex: 0,
        explanation: "СБП и ссылка запускаются за минуты.",
      },
      {
        question: "AlfaPOS и mPOS — это...",
        options: ["Одно и то же", "Разные продукты для разных задач", "Только для офлайна"],
        correctIndex: 1,
        explanation: "AlfaPOS — бесконтактные оплаты, mPOS — выездной эквайринг.",
      },
    ],
    practice: {
      intro: "Пройдите платёжный мастер. Результат появится в «Мой бизнес → Платежи».",
      fields: [],
    },
    aiRole: "Объясняет каждый продукт комплекта и порядок подключения.",
    resultDescription: "Рабочий план приёма платежей.",
    completionCriteria: ["Пройден мастер платежей", "Подключён хотя бы один продукт (mock)"],
  },
];

// ===== ТРЕК: ТЕХНОЛОГИЧЕСКИЙ СТАРТАП =====
export const TECH_MODULES: Module[] = [
  {
    id: "t9",
    number: "9С",
    title: "Гипотезы продукта",
    shortTitle: "Гипотезы",
    description: "Соберите карту гипотез и выделите три самых рискованных.",
    track: "tech",
    estimatedMinutes: 22,
    milestone: { id: "risks_prioritized", label: "Риски приоритизированы", emoji: "⚠️" },
    learn: [
      {
        title: "Не все гипотезы одинаково рискованны",
        thesis:
          "Сортируйте по влиянию на модель и стоимости проверки. Начинайте с самого рискованного и дешёвого.",
      },
    ],
    quiz: [
      {
        question: "С какой гипотезы начинать?",
        options: ["С самой дешёвой", "С самой рискованной и проверяемой", "С любой"],
        correctIndex: 1,
        explanation: "Главный риск может убить всю модель — проверяйте его первым.",
      },
    ],
    practice: {
      intro: "Перечислите гипотезы и оцените риск.",
      fields: [
        { name: "h1", label: "Гипотеза 1", type: "text", placeholder: "Студенты готовы платить 199₽/мес" },
        { name: "r1", label: "Риск 1 (1–10)", type: "number" },
        { name: "h2", label: "Гипотеза 2", type: "text" },
        { name: "r2", label: "Риск 2 (1–10)", type: "number" },
        { name: "h3", label: "Гипотеза 3", type: "text" },
        { name: "r3", label: "Риск 3 (1–10)", type: "number" },
        {
          name: "next",
          label: "Какую проверим первой",
          type: "text",
        },
      ],
    },
    aiRole: "Помогает приоритизировать риски по влиянию и стоимости проверки.",
    resultDescription: "Карта гипотез с приоритетом проверки.",
    completionCriteria: ["Заполнены минимум 3 гипотезы", "Указан приоритет"],
  },
  {
    id: "t10",
    number: "10С",
    title: "Прототип и MVP",
    shortTitle: "MVP",
    description: "Соберите минимальную рабочую версию продукта.",
    track: "tech",
    estimatedMinutes: 30,
    milestone: { id: "mvp_ready", label: "MVP готов к тесту", emoji: "🚀" },
    paymentProducts: [
      { productId: "sbp", reason: "Быстрая оплата для ранних пользователей." },
      { productId: "payment_link", reason: "Простая ссылка для первых продаж." },
      { productId: "internet_acquiring", reason: "После подтверждения — для онлайн-чек аута." },
    ],
    learn: [
      {
        title: "MVP — это не половина продукта",
        thesis:
          "MVP решает одну главную проблему конкретного сегмента. Всё остальное — потом.",
        checklist: ["Один сценарий", "Одна метрика", "Минимальный UI"],
      },
    ],
    quiz: [
      {
        question: "Сколько сценариев решает MVP?",
        options: ["Все", "Один главный", "Три"],
        correctIndex: 1,
        explanation: "MVP сфокусирован на одном ключевом сценарии.",
      },
    ],
    practice: {
      intro: "Опишите MVP и основной сценарий.",
      fields: [
        { name: "scenario", label: "Основной сценарий", type: "textarea", placeholder: "Студент открывает ссылку, бронирует кофе, оплачивает СБП" },
        { name: "backlog", label: "Backlog (что отложили)", type: "textarea" },
        { name: "landing", label: "Лендинг (URL)", type: "text" },
      ],
    },
    aiRole: "Сокращает функционал до минимальной версии и предлагает метрику проверки.",
    resultDescription: "Готовый к тесту MVP с метрикой.",
    completionCriteria: ["Описан основной сценарий", "Есть метрика"],
  },
  {
    id: "t11",
    number: "11С",
    title: "Первые пользователи",
    shortTitle: "Пользователи",
    description: "Привлеките 20–50 первых пользователей и получите платежи.",
    track: "tech",
    estimatedMinutes: 25,
    milestone: { id: "first_users", label: "Первые пользователи", emoji: "👥" },
    variant: "experiments",
    learn: [
      {
        title: "Каналы первых пользователей",
        thesis:
          "Сообщества, личные сети, тематические чаты. Не платите за рекламку, пока не настроите активацию.",
      },
    ],
    quiz: [
      {
        question: "Когда подключать платную рекламу?",
        options: ["Сразу", "После настройки активации", "Никогда"],
        correctIndex: 1,
        explanation: "Сначала — удержание и активация, потом — масштаб.",
      },
    ],
    practice: {
      intro: "Зафиксируйте каналы и результаты привлечения.",
      fields: [
        { name: "channel", label: "Канал", type: "text", placeholder: "Чат факультета" },
        { name: "invited", label: "Приглашено", type: "number" },
        { name: "registered", label: "Регистрации", type: "number" },
        { name: "activated", label: "Активации", type: "number" },
        { name: "paid", label: "Оплаты", type: "number" },
        { name: "churn", label: "Причины отказа", type: "textarea" },
        { name: "conclusion", label: "Вывод", type: "textarea" },
      ],
    },
    aiRole: "Анализирует конверсию по воронке и предлагает узкое место для улучшения.",
    resultDescription: "20–50 пользователей и первая конверсия в оплаты.",
    completionCriteria: ["Есть регистрации и оплаты", "Сделан вывод"],
  },
  {
    id: "t12",
    number: "12С",
    title: "Монетизация",
    shortTitle: "Монетизация",
    description: "Протестируйте минимум две модели монетизации.",
    track: "tech",
    estimatedMinutes: 24,
    milestone: { id: "monetization", label: "Монетизация подтверждена", emoji: "💵" },
    paymentProducts: [
      { productId: "internet_acquiring", reason: "Приём онлайн-оплат на сайте." },
      { productId: "alfapay", reason: "Улучшение конверсии checkout." },
      { productId: "sbp", reason: "Быстрая оплата по QR." },
      { productId: "split", reason: "Только при высоком среднем чеке." },
    ],
    learn: [
      {
        title: "Подписка, разово, freemium, комиссия",
        thesis:
          "Каждая модель подходит своему продукту. Подписка — для регулярной ценности, комиссия — для маркетплейса.",
      },
    ],
    quiz: [
      {
        question: "Когда оправдана подписка?",
        options: [
          "Когда ценность разовая",
          "Когда ценность регулярная",
          "Никогда",
        ],
        correctIndex: 1,
        explanation: "Подписка работает там, где ценность возвращается каждый месяц.",
      },
    ],
    practice: {
      intro: "Опишите две модели и результат теста.",
      fields: [
        { name: "model1", label: "Модель 1", type: "text", placeholder: "Подписка 199₽/мес" },
        { name: "result1", label: "Результат 1", type: "textarea" },
        { name: "model2", label: "Модель 2", type: "text", placeholder: "Разовая покупка 990₽" },
        { name: "result2", label: "Результат 2", type: "textarea" },
        { name: "winner", label: "Что выиграло", type: "text" },
      ],
    },
    aiRole: "Сравнивает модели по выручке, удержанию и сложности реализации.",
    resultDescription: "Подтверждённая модель монетизации.",
    completionCriteria: ["Описаны две модели", "Выбрана рабочая"],
  },
  {
    id: "t13",
    number: "13С",
    title: "Платформенный бизнес",
    shortTitle: "Платформа",
    description:
      "Только для маркетплейсов и сервисов исполнителей. Иначе — отметьте «не применимо».",
    track: "tech",
    estimatedMinutes: 20,
    milestone: { id: "payment_flow", label: "Платёжный поток спроектирован", emoji: "🔗" },
    variant: "platform_builder",
    paymentProducts: [
      { productId: "mass_payouts", reason: "Регулярные переводы исполнителям." },
      { productId: "mozen", reason: "Быстрые выплаты исполнителям." },
      { productId: "your_payments", reason: "Сложная многосторонняя инфраструктура." },
      { productId: "internet_acquiring", reason: "API приёма онлайн-платежей." },
    ],
    learn: [
      {
        title: "Платформа — это много сторон",
        thesis:
          "Клиент платит, вы берёте комиссию, исполнитель получает выплату. Каждое звено — отдельный платёжный поток.",
      },
    ],
    quiz: [
      {
        question: "Обязателен ли блок платформы для всех стартапов?",
        options: ["Да", "Нет, только для маркетплейсов", "Только для B2B"],
        correctIndex: 1,
        explanation: "Если у вас нет нескольких сторон — блок «не применимо».",
      },
    ],
    practice: {
      intro: "Соберите платёжный поток или отметьте «не применимо».",
      fields: [
        {
          name: "applicable",
          label: "Применимо ли к вам",
          type: "select",
          options: ["Да", "Не применимо"],
        },
        { name: "client", label: "Кто платит", type: "text" },
        { name: "commission", label: "Комиссия платформы (%)", type: "number" },
        { name: "contractor", label: "Кто получает выплату", type: "text" },
        { name: "reporting", label: "Отчётность", type: "textarea" },
      ],
    },
    aiRole: "Проектирует платёжный поток и подбирает продукты для многосторонних расчётов.",
    resultDescription: "Спроектированный платёжный поток (или отметка «не применимо»).",
    completionCriteria: ["Отмечена применимость", "Если да — описан поток"],
  },
  {
    id: "t14",
    number: "14С",
    title: "Рост и инвестиции",
    shortTitle: "Рост",
    description: "Спланируйте масштабирование и подготовьте pitch.",
    track: "tech",
    estimatedMinutes: 26,
    milestone: { id: "growth_plan", label: "План роста готов", emoji: "📈" },
    learn: [
      {
        title: "Каналы роста",
        thesis:
          "Масштабируйте то, что уже работает. Не ищите новые каналы, пока не выжали текущий.",
      },
    ],
    quiz: [
      {
        question: "Когда масштабировать канал?",
        options: [
          "Когда он приносит убыток",
          "Когда CAC стабильно ниже LTV/3",
          "Сразу",
        ],
        correctIndex: 1,
        explanation: "Масштаб идёт на прибыльном и стабильном канале.",
      },
    ],
    practice: {
      intro: "Опишите план роста и раунд.",
      fields: [
        { name: "channels", label: "Каналы роста", type: "textarea" },
        { name: "team", label: "Команда", type: "textarea" },
        { name: "automation", label: "Автоматизация", type: "textarea" },
        { name: "forecast", label: "Прогноз 6 мес.", type: "textarea" },
        { name: "ask", label: "Запрашиваемые инвестиции", type: "number", unit: "₽" },
        { name: "use", label: "Use of funds", type: "textarea" },
      ],
    },
    aiRole: "Помогает с прогнозом, ask и pitch-текстом для инвестора.",
    resultDescription: "План роста и pitch.",
    completionCriteria: ["Описаны каналы и прогноз", "Сформулирован ask"],
  },
];

// ===== ТРЕК: ОБЫЧНЫЙ БИЗНЕС =====
export const REGULAR_MODULES: Module[] = [
  {
    id: "r9",
    number: "9Б",
    title: "Ассортимент и цены",
    shortTitle: "Ассортимент",
    description: "Соберите прайс и найдите позиции с низкой маржой.",
    track: "regular",
    estimatedMinutes: 20,
    milestone: { id: "price_list", label: "Прайс сформирован", emoji: "🧾" },
    variant: "table_assortment",
    learn: [
      {
        title: "Маржа решает",
        thesis:
          "Высокая выручка при низкой марже — путь в минус. Следите за долей прибыли в каждой позиции.",
      },
    ],
    quiz: [
      {
        question: "Что важнее: выручка или маржа?",
        options: ["Выручка", "Маржа", "Одинаково"],
        correctIndex: 1,
        explanation: "Без маржи выручка не спасёт бизнес.",
      },
    ],
    practice: {
      intro: "Заполните ассортимент в разделе «Мой бизнес → Ассортимент».",
      fields: [
        { name: "note", label: "Заметка по прайсу", type: "textarea", placeholder: "Кофе — основа, десерты — допродажа" },
      ],
    },
    aiRole: "Выявляет позиции с низкой маржой и предлагает комплекты допродаж.",
    resultDescription: "Готовый прайс с подсчётом прибыли.",
    completionCriteria: ["Заполнено минимум 3 позиции ассортимента"],
  },
  {
    id: "r10",
    number: "10Б",
    title: "Организация продаж",
    shortTitle: "Продажи",
    description: "Опишите процесс продаж и подберите платежи.",
    track: "regular",
    estimatedMinutes: 22,
    milestone: { id: "sales_organized", label: "Продажи организованы", emoji: "🛒" },
    variant: "payments_wizard",
    paymentProducts: [
      { productId: "trade_acquiring", reason: "Для стационарной точки продаж." },
      { productId: "alfa_cash", reason: "Точка с кассой + эквайрингом." },
      { productId: "sbp", reason: "Быстрая оплата по QR." },
      { productId: "alfapos", reason: "Для выездной бесконтактной оплаты." },
      { productId: "mpos", reason: "Отдельный выездной эквайринг." },
      { productId: "internet_acquiring", reason: "Для онлайн-продаж." },
    ],
    learn: [
      {
        title: "Цепочка продаж",
        thesis:
          "От закупки до учёта — каждый шаг влияет на деньги. Разрыв на любом этапе теряет прибыль.",
        checklist: ["Закупка", "Хранение", "Продажа", "Оплата", "Чек", "Возврат", "Учёт"],
      },
    ],
    quiz: [
      {
        question: "Что нужно для выездных продаж?",
        options: [
          "Стационарный терминал",
          "AlfaPOS + AlfaCASH или mPOS, СБП",
          "Только касса",
        ],
        correctIndex: 1,
        explanation: "Для выездов — мобильные решения и СБП.",
      },
    ],
    practice: {
      intro: "Пройдите платёжный мастер для вашего сценария.",
      fields: [],
    },
    aiRole: "Подбирает платежи под точку, выезд и онлайн.",
    resultDescription: "Описанный процесс продаж с платежами.",
    completionCriteria: ["Пройден мастер платежей"],
  },
  {
    id: "r11",
    number: "11Б",
    title: "Первые клиенты",
    shortTitle: "Клиенты",
    description: "Запустите кампанию и получите 10–20 первых продаж.",
    track: "regular",
    estimatedMinutes: 24,
    milestone: { id: "first_sales", label: "Первые продажи", emoji: "🤝" },
    variant: "experiments",
    learn: [
      {
        title: "Локальный канал",
        thesis:
          "Для офлайна работают гео, соседи, локальные чаты и ярмарки. Не забрасывайте широкую рекламу.",
      },
    ],
    quiz: [
      {
        question: "Что работает для локального бизнеса?",
        options: [
          "ТВ-реклама",
          "Гео, соседи, локальные чаты",
          "Контекст на весь город",
        ],
        correctIndex: 1,
        explanation: "Локальный фокус дешевле и точнее.",
      },
    ],
    practice: {
      intro: "Создайте эксперимент в разделе «Эксперименты».",
      fields: [
        { name: "campaign", label: "Название кампании", type: "text" },
        { name: "sales", label: "Целевые продажи", type: "number" },
      ],
    },
    aiRole: "Анализирует воронку эксперимента и рекомендует продолжить или изменить.",
    resultDescription: "10–20 первых продаж и выводы по каналу.",
    completionCriteria: ["Создан эксперимент", "Есть продажи"],
  },
  {
    id: "r12",
    number: "12Б",
    title: "Управление финансами",
    shortTitle: "Финансы",
    description: "Календарь платежей и контроль денежного потока.",
    track: "regular",
    estimatedMinutes: 22,
    milestone: { id: "cashflow_control", label: "Денежный поток под контролем", emoji: "📅" },
    variant: "finance_calc",
    learn: [
      {
        title: "Cashflow важнее прибыли",
        thesis:
          "Можно быть прибыльным на бумаге и уйти в кассовый разрыв. Следите за сроками оплат.",
      },
    ],
    quiz: [
      {
        question: "Что убивает малый бизнес чаще всего?",
        options: ["Налоги", "Кассовый разрыв", "Конкуренты"],
        correctIndex: 1,
        explanation: "Деньги могут закончиться даже при прибыли.",
      },
    ],
    practice: {
      intro: "Заполните финансы и проверьте cashflow на разрыв.",
      fields: [
        { name: "income", label: "Доходы в месяц", type: "number", unit: "₽" },
        { name: "expenses", label: "Расходы в месяц", type: "number", unit: "₽" },
        { name: "reserve", label: "Запас денег", type: "number", unit: "₽" },
      ],
    },
    aiRole: "Предупреждает о кассовом разрыве и предлагает резерв.",
    resultDescription: "Прогноз денежного потока и резерв.",
    completionCriteria: ["Заполнены доходы и расходы", "Проверен cashflow"],
  },
  {
    id: "r13",
    number: "13Б",
    title: "Сотрудники и исполнители",
    shortTitle: "Команда",
    description: "Настройте выплаты сотрудникам и подрядчикам.",
    track: "regular",
    estimatedMinutes: 20,
    milestone: { id: "payouts_set", label: "Выплаты настроены", emoji: "👷" },
    variant: "team_table",
    paymentProducts: [
      { productId: "mass_payouts", reason: "Регулярные переводы многим получателям." },
      { productId: "mozen", reason: "Быстрые выплаты исполнителям." },
    ],
    learn: [
      {
        title: "Типы выплат",
        thesis:
          "Оклад, сдельная, гонорар. Под каждый — свой инструмент массовых выплат или быстрых переводов.",
      },
    ],
    quiz: [
      {
        question: "Что подходит для выплат многим исполнителям?",
        options: ["СБП вручную", "Массовые выплаты", "Только наличные"],
        correctIndex: 1,
        explanation: "Массовые выплаты автоматизируют переводы.",
      },
    ],
    practice: {
      intro: "Заполните таблицу команды в «Мой бизнес → Команда».",
      fields: [
        { name: "note", label: "Заметка по выплатам", type: "textarea" },
      ],
    },
    aiRole: "Подбирает продукт выплат под регулярность и количество получателей.",
    resultDescription: "Настроенные выплаты сотрудникам.",
    completionCriteria: ["Добавлен минимум 1 человек в команду"],
  },
  {
    id: "r14",
    number: "14Б",
    title: "Удержание клиентов",
    shortTitle: "Удержание",
    description: "CRM-lite и повторные продажи.",
    track: "regular",
    estimatedMinutes: 22,
    milestone: { id: "repeat_sales", label: "Повторные продажи запущены", emoji: "🔁" },
    variant: "crm_lite",
    paymentProducts: [
      { productId: "no_coins", reason: "Для HoReCa/сервисов: чаевые, отзывы." },
      { productId: "split", reason: "Для высокого среднего чека." },
    ],
    learn: [
      {
        title: "Удержание дешевле привлечения",
        thesis:
          "Вернуть клиента в 5–7 раз дешевле, чем найти нового. Настраивайте повторные касания.",
      },
    ],
    quiz: [
      {
        question: "Во сколько раз дешевле удержать, чем привлечь?",
        options: ["Одинаково", "В 5–7 раз дешевле", "Дороже"],
        correctIndex: 1,
        explanation: "Удержание существенно дешевле привлечения.",
      },
    ],
    practice: {
      intro: "Добавьте клиентов в CRM в «Мой бизнес → Клиенты».",
      fields: [
        { name: "note", label: "Стратегия удержания", type: "textarea" },
      ],
    },
    aiRole: "Сегментирует клиентов и предлагает оффер для возврата.",
    resultDescription: "Запущенные повторные продажи.",
    completionCriteria: ["Добавлен минимум 1 клиент в CRM"],
  },
  {
    id: "r15",
    number: "15Б",
    title: "Масштабирование",
    shortTitle: "Масштаб",
    description: "План на 6 месяцев: точки, оборудование, команда.",
    track: "regular",
    estimatedMinutes: 24,
    milestone: { id: "scale_plan", label: "План масштабирования готов", emoji: "🌆" },
    variant: "scale_plan",
    paymentProducts: [
      { productId: "trade_acquiring", reason: "Дополнительные терминалы на новых точках." },
      { productId: "alfa_cash", reason: "Кассы на новых точках." },
      { productId: "self_checkout", reason: "При устойчивом потоке клиентов." },
      { productId: "internet_acquiring", reason: "Онлайн-направление." },
      { productId: "mass_payouts", reason: "Выплаты растущей команде." },
    ],
    learn: [
      {
        title: "Масштаб = повторяемая модель",
        thesis:
          "Открывайте новые точки только когда первая работает в плюс и процесс описан.",
      },
    ],
    quiz: [
      {
        question: "Когда открывать вторую точку?",
        options: [
          "Когда первая стабильно в плюсе и процесс описан",
          "Как можно раньше",
          "Только при инвестициях",
        ],
        correctIndex: 0,
        explanation: "Масштабируйте то, что повторяемо и прибыльно.",
      },
    ],
    practice: {
      intro: "Опишите план масштабирования на 6 месяцев.",
      fields: [
        { name: "investments", label: "Инвестиции", type: "number", unit: "₽" },
        { name: "equipment", label: "Оборудование", type: "textarea" },
        { name: "team", label: "Новые сотрудники", type: "textarea" },
        { name: "forecast", label: "Прогноз выручки", type: "textarea" },
        { name: "payments", label: "Дополнительные платежи", type: "textarea" },
      ],
    },
    aiRole: "Помогает с приоритетом инвестиций и подбором платежей для роста.",
    resultDescription: "Готовый план масштабирования.",
    completionCriteria: ["Описаны инвестиции и прогноз"],
  },
];

export const ALL_MODULES: Module[] = [
  ...COMMON_MODULES,
  ...TECH_MODULES,
  ...REGULAR_MODULES,
];

export function getModuleById(id: string): Module | undefined {
  return ALL_MODULES.find((m) => m.id === id);
}

export function getModulesForTrack(
  track: "common" | "tech" | "regular" | null,
): Module[] {
  const common = COMMON_MODULES;
  if (!track || track === "common") return common;
  if (track === "tech") return [...common, ...TECH_MODULES];
  return [...common, ...REGULAR_MODULES];
}

export const TRACK_SELECT_MODULE: Module = {
  id: "track_select",
  number: "★",
  title: "Выбор трека",
  shortTitle: "Трек",
  description:
    "После общей части выберите трек развития: технологический стартап или обычный бизнес.",
  track: "common",
  estimatedMinutes: 5,
  learn: [
    {
      title: "Два пути",
      thesis:
        "Технологический стартап — поиск модели и гипотез. Обычный бизнес — повторяемые продажи понятного продукта.",
    },
  ],
  quiz: [],
  practice: { intro: "Выберите трек на следующем экране.", fields: [] },
  aiRole: "Помогает определить подходящий трек по вашим ответам.",
  resultDescription: "Выбранный трек развития.",
  completionCriteria: ["Выбран трек"],
  milestone: { id: "track_chosen", label: "Трек выбран", emoji: "🧭" },
  variant: "default",
};
