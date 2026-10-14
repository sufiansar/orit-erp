import { NavSection } from "./dashboard.section";

export const orgAdminNavItems: NavSection[] = [
  {
    title: "People & Organization",
    items: [
      {
        title: "Employees",
        href: "/employees",
        icon: "Users",
        roles: ["ORG_ADMIN"],
        description: "Company-wide personnel directory, profiles, and departments",
      },
      {
        title: "Branches",
        href: "/branches",
        icon: "Building2",
        roles: ["ORG_ADMIN"],
        description: "Global offices, multi-timezone branches, and facilities",
      },
    ],
  },
  {
    title: "Time & Attendance",
    items: [
      {
        title: "Attendance",
        href: "/attendance",
        icon: "CalendarCheck",
        roles: ["ORG_ADMIN"],
        description: "Organization register, hardware terminals, and compliance",
      },
      {
        title: "Shifts",
        href: "/shifts",
        icon: "Clock",
        roles: ["ORG_ADMIN"],
        description: "Company-wide shift schedules and grace period rules",
      },
      {
        title: "Leave",
        href: "/leave",
        icon: "CalendarOff",
        roles: ["ORG_ADMIN"],
        badge: "Company",
        description: "Time-off policies, multi-stage approvals, and quotas",
      },
    ],
  },
  {
    title: "Workflow & Customization",
    items: [
      {
        title: "Custom Fields",
        href: "/custom-fields",
        icon: "Layers",
        roles: ["ORG_ADMIN"],
        description: "Custom entity field builder and schema definitions",
      },
      {
        title: "Workflows",
        href: "/workflows",
        icon: "GitBranch",
        roles: ["ORG_ADMIN"],
        description: "Visual approval chains and trigger-based automation",
      },
      {
        title: "Modules",
        href: "/modules",
        icon: "Boxes",
        roles: ["ORG_ADMIN"],
        description: "SaaS module activation and workspace feature flags",
      },
    ],
  },
  {
    title: "Governance & Billing",
    items: [
      {
        title: "Roles & Permissions",
        href: "/roles",
        icon: "ShieldAlert",
        roles: ["ORG_ADMIN"],
        description: "Role-based access matrix and branch assignment",
      },
      {
        title: "Billing & Usage",
        href: "/billing",
        icon: "CreditCard",
        roles: ["ORG_ADMIN"],
        description: "Subscription tier, usage meters, and invoice history",
      },
      {
        title: "Settings",
        href: "/settings/general",
        icon: "Settings",
        roles: ["ORG_ADMIN"],
        description: "Organization profile, localization, security, and alerts",
      },
    ],
  },
];
