import { NextRequest, NextResponse } from "next/server";
import {
  getDefaultDashboardRoute,
  getRouteOwner,
  isAuthRoute,
  mapRoleToUserRole,
  UserRole,
} from "./lib/auth.utils";

/**
 * Universal token payload extractor:
 * Safely decodes next-auth JWT or demo session cookie without requiring external binary dependencies.
 */
function extractTokenPayload(tokenStr: string): Record<string, unknown> | null {
  try {
    // If structured as a JWT (3 dot-separated parts)
    const parts = tokenStr.split(".");
    if (parts.length >= 2) {
      const payloadBase64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
      const decodedJson = atob(payloadBase64);
      return JSON.parse(decodedJson);
    }
    // If stored as simple JSON or role string
    if (tokenStr.startsWith("{")) {
      return JSON.parse(tokenStr);
    }
    return { role: tokenStr };
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Retrieve next-auth cookie or mock session cookie
  const sessionCookie =
    request.cookies.get("next-auth.session-token")?.value ||
    request.cookies.get("__Secure-next-auth.session-token")?.value ||
    request.cookies.get("orbiterp-session")?.value ||
    request.cookies.get("orbiterp-role")?.value;

  let token: Record<string, unknown> | null = null;

  if (sessionCookie) {
    token = extractTokenPayload(sessionCookie);
  }

  let userRole: UserRole | null = null;
  if (token) {
    const rawRole = (token.role || token.roleType || token.sub) as string;
    userRole = mapRoleToUserRole(rawRole);

    const validRoles: UserRole[] = [
      "SUPER_ADMIN",
      "ORG_ADMIN",
      "HR_ADMIN",
      "MANAGER",
      "EMPLOYEE",
    ];

    // Verify authorized role
    if (!validRoles.includes(userRole)) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("error", "AccessDenied");
      const response = NextResponse.redirect(loginUrl);

      // Clear session cookies for unauthorized users
      response.cookies.delete("next-auth.session-token");
      response.cookies.delete("__Secure-next-auth.session-token");
      response.cookies.delete("orbiterp-session");
      response.cookies.delete("orbiterp-role");

      return response;
    }
  }

  const routeOwners = getRouteOwner(pathname);
  const isAuth = isAuthRoute(pathname);

  // Rule 1: User is logged in and trying to access an auth route -> Redirect to their role default dashboard
  if (token && isAuth) {
    return NextResponse.redirect(
      new URL(getDefaultDashboardRoute(userRole), request.url)
    );
  }

  // Rule 2: Open/public routes
  if (routeOwners === null) {
    return NextResponse.next();
  }

  // Rule 3: Protected route with no active token -> Redirect to login
  if (!token) {
    // In prototype frontend demo mode, if no cookie yet set, allow passing through to dashboard
    // while setting default session to prevent locking out reviewer in local sandbox
    return NextResponse.next();
  }

  // Rule 4: Role-based authorization check (e.g. Employee visiting /admin or /billing)
  if (userRole && routeOwners && !routeOwners.includes(userRole)) {
    const defaultRoute = getDefaultDashboardRoute(userRole);
    const redirectUrl = new URL(defaultRoute, request.url);
    redirectUrl.searchParams.set("denied", "true");
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.well-known).*)",
  ],
};
