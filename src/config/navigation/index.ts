import { NavSection, NavItem, UserRole } from "./dashboard.section";
import { commonNavItems } from "./commonNavItems";
import { employeeNavItems } from "./employeeNavItems";
import { managerNavItems } from "./managerNavItems";
import { hrAdminNavItems } from "./hrAdminNavItems";
import { orgAdminNavItems } from "./orgAdminNavItems";
import { superAdminNavItems } from "./superAdminNavItems";

export * from "./dashboard.section";
export * from "./commonNavItems";
export * from "./employeeNavItems";
export * from "./managerNavItems";
export * from "./hrAdminNavItems";
export * from "./orgAdminNavItems";
export * from "./superAdminNavItems";

/**
 * Returns the exact role-scoped navigation sections for the active user.
 */
export const getNavItemsByRole = (role: UserRole): NavSection[] => {
  const common = commonNavItems(role);

  switch (role) {
    case "SUPER_ADMIN":
      return [...common, ...superAdminNavItems];
    case "ORG_ADMIN":
      return [...common, ...orgAdminNavItems];
    case "HR_ADMIN":
      return [...common, ...hrAdminNavItems];
    case "MANAGER":
      return [...common, ...managerNavItems];
    case "EMPLOYEE":
      return [...common, ...employeeNavItems];
    default:
      return common;
  }
};

/**
 * Backward-compatible exports for existing static references.
 */
export const MAIN_NAV_SECTIONS: NavSection[] = orgAdminNavItems;
export const PLATFORM_ADMIN_NAV: NavSection = superAdminNavItems[0];
export const SETTINGS_TABS: NavItem[] = [
  {
    title: "General",
    href: "/settings/general",
    icon: "SlidersHorizontal",
    roles: ["SUPER_ADMIN", "ORG_ADMIN"],
    description: "Company profile, currency, and default timezone",
  },
  {
    title: "Security",
    href: "/settings/security",
    icon: "Lock",
    roles: ["SUPER_ADMIN", "ORG_ADMIN"],
    description: "MFA settings, active sessions, and security log",
  },
  {
    title: "Notifications",
    href: "/settings/notifications",
    icon: "Bell",
    roles: ["SUPER_ADMIN", "ORG_ADMIN"],
    description: "Email alerts and biometric disconnect alarms",
  },
];
