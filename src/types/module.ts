export type ModuleTier = "core" | "standard" | "add_on" | "coming_soon";

export interface SaasModule {
  key: string;
  name: string;
  description: string;
  icon: string;
  tier: ModuleTier;
  isEnabled: boolean;
  isCore: boolean; // cannot be disabled if true
  planRequirement: "starter" | "growth" | "enterprise";
  monthlyPriceAddon?: number;
  routeHref?: string;
  features: string[];
}
