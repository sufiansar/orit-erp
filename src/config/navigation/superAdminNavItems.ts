import { NavSection } from "./dashboard.section";

export const superAdminNavItems: NavSection[] = [
  {
    title: "SaaS Platform Admin",
    items: [
      {
        title: "Platform Overview",
        href: "/admin/overview",
        icon: "ShieldCheck",
        roles: ["SUPER_ADMIN"],
        description: "Global cloud telemetry, MRR, tenant health, and metrics",
      },
      {
        title: "Organizations",
        href: "/admin/organizations",
        icon: "Globe",
        roles: ["SUPER_ADMIN"],
        description: "Tenant registry, subscription lifecycle, and impersonation",
      },
    ],
  },
  {
    title: "Platform Infrastructure",
    items: [
      {
        title: "Global SaaS Modules",
        href: "/modules",
        icon: "Boxes",
        roles: ["SUPER_ADMIN"],
        description: "Platform-wide module catalog and feature entitlements",
      },
      {
        title: "Platform Settings",
        href: "/settings/general",
        icon: "Settings",
        roles: ["SUPER_ADMIN"],
        description: "Global system defaults, security standards, and telemetry",
      },
    ],
  },
];
