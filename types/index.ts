// ===== Доменные типы «Альфа.Будущее: Первый бизнес» =====

export type Stage = "idea" | "mvp" | "selling";
export type BusinessFormat =
  | "tech"
  | "services"
  | "beauty"
  | "horeca"
  | "retail"
  | "production"
  | "other";

export type Track = "tech" | "regular";

export type Goal30 =
  | "choose_idea"
  | "get_leads"
  | "first_payment"
  | "improve_sales"
  | "unit_economics"
  | "scale";

export interface UserProfile {
  name: string;
  age: number | null;
  stage: Stage | null;
  format: BusinessFormat | null;
  budget: number | null;
  hoursPerWeek: number | null;
  teamSize: number | null;
  skills: string[];
  goal: Goal30 | null;
  track: Track | null;
  hasDiagnostic: boolean;
  industry: string;
}

export interface ProjectInfo {
  name: string;
  description: string;
  stage: Stage | null;
  track: Track | null;
  industry: string;
  goal: string;
}

// ===== Курс =====

export type ModuleStatus =
  | "locked"
  | "available"
  | "in_progress"
  | "completed"
  | "credited_by_diagnostic"
  | "skipped_not_applicable";

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "select"
  | "multiselect"
  | "checkbox";

export interface FormFieldDef {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  help?: string;
  options?: string[];
  required?: boolean;
  unit?: string;
}

export interface LearnCard {
  title: string;
  thesis: string;
  examples?: string[];
  checklist?: string[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Milestone {
  id: string;
  label: string;
  emoji: string;
}

export interface PaymentProductRef {
  productId: string;
  reason: string;
}

export interface Module {
  id: string;
  number: string; // "1", "9С", "10Б"
  title: string;
  shortTitle: string;
  description: string;
  track: "common" | "tech" | "regular";
  estimatedMinutes: number;
  learn: LearnCard[];
  quiz: QuizQuestion[];
  practice: {
    intro: string;
    fields: FormFieldDef[];
  };
  aiRole: string;
  resultDescription: string;
  completionCriteria: string[];
  milestone?: Milestone;
  paymentProducts?: PaymentProductRef[];
  // поля для спец-блоков (ассортимент, платформы и т.д.)
  variant?:
    | "default"
    | "table_assortment"
    | "funnel"
    | "payments_wizard"
    | "finance_calc"
    | "platform_builder"
    | "experiments"
    | "team_table"
    | "crm_lite"
    | "scale_plan";
}

export interface ModuleProgress {
  status: ModuleStatus;
  // сохранённые ответы формы практики
  answers: Record<string, unknown>;
  quizPassed: boolean;
  aiAnalyzed: boolean;
  acceptedAiSuggestions: string[];
  artifactSaved: boolean;
  completedAt: string | null;
  startedAt: string | null;
}

// ===== Метрики =====

export interface DashboardMetrics {
  interviews: number;
  visits: number;
  leads: number;
  payments: number;
  revenue: number;
  averageCheck: number;
  cac: number;
}

// ===== AI чат =====

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  meta?: {
    goodPoints?: string[];
    unprovenPoints?: string[];
    mainRisk?: string;
    nextStep?: string;
    variants?: { label: string; text: string }[];
  };
}

export interface AIInsight {
  goodPoints: string[];
  unprovenPoints: string[];
  mainRisk: string;
  nextStep: string;
  suggestions?: { id: string; label: string; text: string }[];
}

// ===== Платежи =====

export type PaymentProductId =
  | "sbp"
  | "internet_acquiring"
  | "payment_link"
  | "alfapay"
  | "cloud_cash"
  | "trade_acquiring"
  | "alfa_cash"
  | "alfapos"
  | "alfa_cash_register"
  | "mpos"
  | "split"
  | "no_coins"
  | "mass_payouts"
  | "mozen"
  | "your_payments"
  | "self_checkout";

export interface PaymentProduct {
  id: PaymentProductId;
  name: string;
  tagline: string;
  description: string;
  bestFor: string[];
  notFor: string[];
  icon: string;
  accent: string;
}

export interface PaymentAnswers {
  online: boolean | null;
  offlineStationary: boolean | null;
  onTheGo: boolean | null;
  siteOrApp: boolean | null;
  needsReceipt: boolean | null;
  averageCheck: number | null;
  employeesOrContractors: boolean | null;
  regularPayouts: boolean | null;
  tips: boolean | null;
  multiSided: boolean | null;
  highFlow: boolean | null;
  payInParts: boolean | null;
}

export interface PaymentRecommendation {
  product: PaymentProduct;
  reasons: string[];
  notNeeded: string[];
  order: number;
}

export interface ConnectedPayment {
  productId: PaymentProductId;
  connectedAt: string;
  testTransaction?: {
    amount: number;
    status: "success" | "refunded";
    at: string;
  };
}

// ===== Финансы =====

export interface FinanceInput {
  price: number;
  variableCost: number;
  fixedCost: number;
  adBudget: number;
  leads: number;
  customers: number;
  purchasesPerCustomer: number;
  customerLifetimeMonths: number;
  taxRate: number;
  cashReserve: number;
}

export interface FinanceResult {
  revenue: number;
  grossProfit: number;
  margin: number;
  operatingProfit: number;
  cac: number;
  ltv: number;
  ltvCacRatio: number;
  breakEvenCustomers: number;
  breakEvenRevenue: number;
  safetyMargin: number;
  runwayMonths: number;
  maxAllowableCac: number;
}

export type Scenario = "pessimistic" | "base" | "optimistic";

// ===== Эксперименты =====

export interface Experiment {
  id: string;
  name: string;
  hypothesis: string;
  channel: string;
  budget: number;
  expectedTraffic: number;
  targetLeads: number;
  targetPayments: number;
  durationDays: number;
  successCriteria: string;
  // факт
  impressions: number;
  clicks: number;
  leads: number;
  payments: number;
  revenue: number;
  spend: number;
  status: "running" | "done" | "stopped";
}

export interface ExperimentMetrics {
  ctr: number;
  convToLead: number;
  convToPaid: number;
  cpl: number;
  cac: number;
  roas: number;
  avgCheck: number;
}

// ===== Demo Day =====

export interface DemoDayData {
  readiness: number; // 0-100
  checklist: { id: string; label: string; done: boolean }[];
  pitchSlides: { title: string; body: string }[];
}

// ===== Достижения =====

export interface Achievement {
  id: string;
  label: string;
  emoji: string;
  unlocked: boolean;
  unlockedAt: string | null;
}

// ===== Business (Мой бизнес) =====

export interface Competitor {
  id: string;
  name: string;
  product: string;
  price: string;
  customer: string;
  channel: string;
  payment: string;
  pros: string;
  cons: string;
  reviews: string;
  note: string;
}

export interface Interview {
  id: string;
  segment: string;
  quote: string;
  alternative: string;
  frequency: string;
  intensity: string;
  willingnessToPay: string;
  conclusion: string;
}

export interface ClientRow {
  id: string;
  name: string;
  lastPurchase: string;
  purchaseCount: number;
  avgCheck: number;
  status: "active" | "at_risk" | "lost";
  offer: string;
}

export interface AssortmentRow {
  id: string;
  item: string;
  cost: number;
  price: number;
  sales: number;
}

export interface TeamRow {
  id: string;
  person: string;
  role: string;
  payType: string;
  amount: number;
  period: string;
  date: string;
  status: "paid" | "pending";
}

// ===== Toast =====

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "success" | "warning" | "danger";
}
