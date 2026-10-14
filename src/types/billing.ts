export interface PlanFeature {
  name: string;
  included: boolean;
  limit?: string;
}

export interface SubscriptionPlan {
  id: "starter" | "growth" | "enterprise";
  name: string;
  tagline: string;
  priceMonthly: number;
  priceAnnual: number;
  popular?: boolean;
  limits: {
    employees: number;
    branches: number;
    storageGb: number;
    devices: number;
  };
  features: PlanFeature[];
}

export interface UsageMetric {
  key: string;
  label: string;
  used: number;
  limit: number;
  unit: string;
}

export interface Invoice {
  id: string;
  number: string;
  date: string;
  amount: number;
  currency: string;
  status: "paid" | "pending" | "failed";
  planName: string;
  downloadUrl: string;
}
