import type { FinanceInput, FinanceResult, Scenario } from "@/types";

export function calculateFinance(input: FinanceInput): FinanceResult {
  const {
    price = 0,
    variableCost = 0,
    fixedCost = 0,
    adBudget = 0,
    leads = 0,
    customers = 0,
    purchasesPerCustomer = 1,
    customerLifetimeMonths = 1,
    taxRate = 0,
    cashReserve = 0,
  } = input;

  const revenue = price * customers * purchasesPerCustomer;
  const cogs = variableCost * customers * purchasesPerCustomer;
  const grossProfit = revenue - cogs;
  const margin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;

  const cac = customers > 0 ? (adBudget || 0) / customers : 0;
  const ltv =
    (price - variableCost) * purchasesPerCustomer * customerLifetimeMonths * (1 - taxRate / 100);

  const ltvCacRatio = cac > 0 ? ltv / cac : 0;

  const contributionMargin = price - variableCost;
  const breakEvenCustomers =
    contributionMargin > 0 ? Math.ceil(fixedCost / contributionMargin) : Infinity;
  const breakEvenRevenue = isFinite(breakEvenCustomers)
    ? breakEvenCustomers * price
    : Infinity;

  const operatingProfit = grossProfit - fixedCost - adBudget;
  const safetyMargin =
    breakEvenRevenue > 0 && revenue > 0
      ? ((revenue - breakEvenRevenue) / revenue) * 100
      : 0;

  const monthlyBurn = fixedCost + adBudget;
  const netBurn = monthlyBurn - operatingProfit;
  const runwayMonths =
    operatingProfit >= 0 ? Infinity : cashReserve > 0 && netBurn > 0 ? cashReserve / netBurn : 0;

  // Допустимый CAC при LTV/CAC = 3
  const maxAllowableCac = ltv > 0 ? ltv / 3 : 0;

  return {
    revenue,
    grossProfit,
    margin,
    operatingProfit,
    cac,
    ltv,
    ltvCacRatio,
    breakEvenCustomers,
    breakEvenRevenue,
    safetyMargin,
    runwayMonths,
    maxAllowableCac,
  };
}

export function applyScenario(input: FinanceInput, scenario: Scenario): FinanceInput {
  const factors: Record<Scenario, { customers: number; price: number; leads: number }> = {
    pessimistic: { customers: 0.6, price: 0.9, leads: 0.7 },
    base: { customers: 1, price: 1, leads: 1 },
    optimistic: { customers: 1.4, price: 1.1, leads: 1.3 },
  };
  const f = factors[scenario];
  return {
    ...input,
    customers: Math.round(input.customers * f.customers),
    price: Math.round(input.price * f.price),
    leads: Math.round(input.leads * f.leads),
  };
}

export function financeVerdict(result: FinanceResult): {
  status: "ok" | "warning" | "danger";
  title: string;
  text: string;
} {
  if (result.margin < 0) {
    return {
      status: "danger",
      title: "Экономика не сходится",
      text: "Маржа отрицательная — каждая продажа в минус. Поднимите цену или снизьте переменные затраты.",
    };
  }
  if (result.ltvCacRatio > 0 && result.ltvCacRatio < 1) {
    return {
      status: "danger",
      title: "CAC слишком высокий",
      text: `Привлечение обходится дороже, чем приносит клиент (LTV/CAC = ${result.ltvCacRatio.toFixed(2)}). Снижайте CAC или растите LTV.`,
    };
  }
  if (result.operatingProfit < 0) {
    return {
      status: "warning",
      title: "Операционный минус",
      text: "На расстоянии единицы маржа есть, но постоянные расходы тянут вниз. Нужен больше объём или ниже фиксы.",
    };
  }
  if (result.ltvCacRatio > 0 && result.ltvCacRatio < 3) {
    return {
      status: "warning",
      title: "LTV/CAC ниже нормы",
      text: `Отношение ${result.ltvCacRatio.toFixed(2)} — стремитесь к 3+. Проверьте повторные продажи.`,
    };
  }
  return {
    status: "ok",
    title: "Экономика сходится",
    text: "Маржа положительная, LTV/CAC здоровый. Можно масштабировать — но следите за качеством привлечения.",
  };
}

export const FINANCE_TOOLTIPS: Record<string, string> = {
  revenue: "Цена × Клиенты × Покупок на клиента",
  grossProfit: "Выручка − Переменные затраты",
  margin: "Валовая прибыль / Выручка × 100%",
  operatingProfit: "Валовая прибыль − Постоянные − Реклама",
  cac: "Рекламный бюджет / Клиенты",
  ltv: "(Цена − Переменные) × Покупок × Срок жизни × (1 − Налог)",
  ltvCacRatio: "LTV / CAC. Здорово — 3 и выше.",
  breakEvenCustomers: "Постоянные / (Цена − Переменные)",
  breakEvenRevenue: "Точка безубыточности × Цена",
  safetyMargin: "(Выручка − Безубыточность) / Выручка × 100%",
  runwayMonths: "Запас / Чистый расход в месяц",
  maxAllowableCac: "LTV / 3 — потолок стоимости привлечения",
};
