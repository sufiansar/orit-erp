import { UserRole } from "../config/navigation/dashboard.section";

export type { UserRole };

/**
 * Normalizes any string or session role string to UserRole.
 */
export function mapRoleToUserRole(role?: string | null): UserRole {
  if (!role) return "EMPLOYEE";
  const normalized = role.toUpperCase().trim();
  if (normalized === "PLATFORM_ADMIN" || normalized === "SUPER_ADMIN") {
    return "SUPER_ADMIN";
  }
  if (normalized === "ORG_ADMIN" || normalized === "ORGANIZATION_ADMIN") {
    return "ORG_ADMIN";
  }
  if (normalized === "HR_ADMIN" || normalized === "HR") {
    return "HR_ADMIN";
  }
  if (normalized === "MANAGER" || normalized === "TEAM_LEAD") {
    return "MANAGER";
  }
  return "EMPLOYEE";
}

/**
 * Returns the default initial landing route based on role.
 */
export function getDefaultDashboardRoute(role?: UserRole | string | null): string {
  if (!role) return "/dashboard";
  const userRole = typeof role === "string" ? mapRoleToUserRole(role) : role;
  if (userRole === "SUPER_ADMIN") {
    return "/admin/overview";
  }
  return "/dashboard";
}

/**
 * Checks if a given URL pathname is an authentication/onboarding route.
 */
export function isAuthRoute(pathname: string): boolean {
  return (
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password"
  );
}

/**
 * Returns the list of UserRoles permitted to access a given pathname.
 * Returns null if the route is open to the public (or is an auth route).
 */
export function getRouteOwner(pathname: string): UserRole[] | null {
  // Public or auth routes
  if (isAuthRoute(pathname) || pathname === "/" || pathname.startsWith("/api")) {
    return null;
  }

  // Super Admin / Platform Admin exclusive routes
  if (pathname.startsWith("/admin")) {
    return ["SUPER_ADMIN"];
  }

  // Executive Organization Governance (Org Admin & Super Admin)
  if (
    pathname.startsWith("/billing") ||
    pathname.startsWith("/modules") ||
    pathname.startsWith("/workflows") ||
    pathname.startsWith("/roles") ||
    pathname.startsWith("/settings")
  ) {
    return ["SUPER_ADMIN", "ORG_ADMIN"];
  }

  // HR & Branch Operations
  if (pathname.startsWith("/branches") || pathname.startsWith("/custom-fields")) {
    return ["SUPER_ADMIN", "ORG_ADMIN", "HR_ADMIN"];
  }

  // General workforce and staff routes (Employee, Manager, HR, Org Admin, Super Admin)
  if (
    pathname === "/dashboard" ||
    pathname.startsWith("/attendance") ||
    pathname.startsWith("/leave") ||
    pathname.startsWith("/shifts") ||
    pathname.startsWith("/employees")
  ) {
    return ["SUPER_ADMIN", "ORG_ADMIN", "HR_ADMIN", "MANAGER", "EMPLOYEE"];
  }

  // All other dashboard routes default to authenticated members
  return ["SUPER_ADMIN", "ORG_ADMIN", "HR_ADMIN", "MANAGER", "EMPLOYEE"];
}
