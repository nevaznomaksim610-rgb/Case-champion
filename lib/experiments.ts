import type { Experiment, ExperimentMetrics } from "@/types";

export function calcExperimentMetrics(exp: Experiment): ExperimentMetrics {
  const ctr = exp.impressions > 0 ? (exp.clicks / exp.impressions) * 100 : 0;
  const convToLead = exp.clicks > 0 ? (exp.leads / exp.clicks) * 100 : 0;
  const convToPaid = exp.leads > 0 ? (exp.payments / exp.leads) * 100 : 0;
  const cpl = exp.leads > 0 ? exp.spend / exp.leads : 0;
  const cac = exp.payments > 0 ? exp.spend / exp.payments : 0;
  const roas = exp.spend > 0 ? (exp.revenue / exp.spend) * 100 : 0;
  const avgCheck = exp.payments > 0 ? exp.revenue / exp.payments : 0;

  return {
    ctr,
    convToLead,
    convToPaid,
    cpl,
    cac,
    roas,
    avgCheck,
  };
}

export function experimentRecommendation(
  exp: Experiment,
  metrics: ExperimentMetrics,
): { action: "continue" | "change" | "close"; reason: string } {
  const targetPayments = exp.targetPayments || 1;
  const progress = exp.payments / targetPayments;
  const roas = metrics.roas;

  if (progress >= 0.7 && roas >= 100) {
    return {
      action: "continue",
      reason: `Выполнено ${Math.round(progress * 100)}% цели, ROAS ${roas.toFixed(0)}%. Масштабируйте бюджет.`,
    };
  }
  if (progress < 0.3 || roas < 50) {
    if (metrics.convToLead < 5) {
      return {
        action: "change",
        reason: `Конверсия в заявку ${metrics.convToLead.toFixed(1)}% — слабый оффер или канал. Поменяйте креатив.`,
      };
    }
    if (metrics.convToPaid < 10) {
      return {
        action: "change",
        reason: `Конверсия в оплату ${metrics.convToPaid.toFixed(1)}% — проблема в процессе покупки. Упростите шаги и добавьте СБП.`,
      };
    }
    return {
      action: "close",
      reason: `ROAS ${roas.toFixed(0)}% и мало оплат. Гипотеза не подтверждена — закройте и протестируйте новую.`,
    };
  }
  return {
    action: "continue",
    reason: `Средние показатели (${Math.round(progress * 100)}% цели). Доработайте оффер и продолжайте собирать данные.`,
  };
}

export function funnelStages(exp: Experiment) {
  return [
    { stage: "Показы", value: exp.impressions, color: "#6B6B73" },
    { stage: "Переходы", value: exp.clicks, color: "#F2A100" },
    { stage: "Заявки", value: exp.leads, color: "#1E9E61" },
    { stage: "Оплаты", value: exp.payments, color: "#EF3124" },
  ];
}
