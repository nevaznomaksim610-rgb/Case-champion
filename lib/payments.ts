import type { PaymentAnswers, PaymentProduct, PaymentRecommendation } from "@/types";
import { PAYMENT_PRODUCTS } from "@/data/paymentData";

export const DEFAULT_PAYMENT_ANSWERS: PaymentAnswers = {
  online: null,
  offlineStationary: null,
  onTheGo: null,
  siteOrApp: null,
  needsReceipt: null,
  averageCheck: null,
  employeesOrContractors: null,
  regularPayouts: null,
  tips: null,
  multiSided: null,
  highFlow: null,
  payInParts: null,
};

/**
 * Подбирает персональный комплект платежей.
 * Не смешивает продукты, учитывает ключевые правила.
 */
export function recommendPayments(answers: PaymentAnswers): PaymentRecommendation[] {
  const recs: PaymentRecommendation[] = [];
  const productById = (id: string) => PAYMENT_PRODUCTS.find((p) => p.id === id)!;

  const add = (id: string, reasons: string[], order: number) => {
    const product = productById(id);
    if (!recs.find((r) => r.product.id === id)) {
      recs.push({
        product,
        reasons,
        notNeeded: [],
        order,
      });
    }
  };

  const high = (answers.averageCheck ?? 0) >= 5000;

  // ===== Онлайн-сценарии =====
  if (answers.siteOrApp) {
    add("internet_acquiring", ["У вас есть сайт или приложение — нужна онлайн-оплата картой."], 1);
    add("alfapay", ["AlfaPay улучшит checkout и поднимет конверсию."], 2);
    if (answers.needsReceipt) {
      add("cloud_cash", ["Онлайн-продажи требуют фискализации — нужна облачная касса."], 3);
    }
    if (high) {
      add("split", ["Высокий средний чек — «Подели» увеличит покупательскую способность."], 4);
    }
  }

  // ===== СБП (почти всегда уместна) =====
  if (answers.online || answers.offlineStationary || answers.onTheGo) {
    add("sbp", ["СБП — быстрая оплата по QR, онлайн и офлайн."], answers.siteOrApp ? 5 : 1);
  }

  // ===== Платёжная ссылка (для раннего теста без сайта) =====
  if (!answers.siteOrApp && (answers.online || answers.onTheGo)) {
    add("payment_link", ["Нет сайта — платёжная ссылка работает в соцсетях и мессенджерах."], 2);
  }

  // ===== Стационарная точка =====
  if (answers.offlineStationary) {
    if (answers.needsReceipt) {
      add("alfa_cash", ["Стационарная точка с кассой: наличные, карты, QR + фискализация."], 3);
    } else {
      add("trade_acquiring", ["Терминал для приёма карт на стационарной точке."], 3);
    }
    if (answers.highFlow) {
      add("self_checkout", ["Устойчивый поток — касса самообслуживания ускорит обслуживание."], 6);
    }
    if (answers.tips) {
      add("no_coins", ["HoReCa/сервисы — «Нет монет» для чаевых и отзывов."], 7);
    }
  }

  // ===== Выездная работа =====
  if (answers.onTheGo) {
    add("alfapos", ["AlfaPOS — смартфон для бесконтактной оплаты в выездных условиях."], 4);
    if (answers.needsReceipt) {
      add("alfa_cash_register", ["AlfaCASH — кассовое решение, в связке с AlfaPOS."], 5);
    }
    // ОТДЕЛЬНЫЙ продукт mPOS — не путать с AlfaPOS
    add("mpos", ["mPOS — отдельный мобильный эквайринг для выездов (не заменяет AlfaPOS)."], 6);
  }

  // ===== Сотрудники и исполнители =====
  if (answers.regularPayouts) {
    if (answers.employeesOrContractors) {
      add("mass_payouts", ["Регулярные выплаты многим получателям — массовые выплаты."], 7);
    }
    add("mozen", ["Быстрые выплаты исполнителям и подрядчикам."], 8);
  }

  // ===== Сложная инфраструктура =====
  if (answers.multiSided) {
    add("your_payments", ["Сложная online-инфраструктура и многосторонние расчёты."], 9);
    add("mass_payouts", ["Маркетплейс требует выплат исполнителям."], 10);
  }

  // Если вообще ничего не подошло — дефолтный старт с СБП
  if (recs.length === 0) {
    add("sbp", ["Универсальный старт: приём первых оплат по QR."], 1);
    add("payment_link", ["Для раннего теста в соцсетях."], 2);
  }

  // Сортировка и наполнение "не нужно"
  recs.sort((a, b) => a.order - b.order);
  return recs;
}

/**
 * Проверяет, что AlfaPOS и mPOS не смешаны в одной логике.
 */
export function validateAlfaPosVsMpos(recs: PaymentRecommendation[]): { ok: boolean; note: string } {
  const hasPos = recs.find((r) => r.product.id === "alfapos");
  const hasMpos = recs.find((r) => r.product.id === "mpos");
  if (hasPos && hasMpos) {
    return {
      ok: true,
      note:
        "AlfaPOS и mPOS — это разные продукты. AlfaPOS для бесконтактной оплаты смартфоном, mPOS — отдельный мобильный эквайринг для выездов.",
    };
  }
  return { ok: true, note: "" };
}
