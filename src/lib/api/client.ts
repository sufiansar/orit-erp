/**
 * OrbitERP Backend API Client Abstraction
 *
 * NOTE: This is a placeholder for future backend integration (Express.js + PostgreSQL + Prisma).
 * During this frontend-only phase, components use the typed mock service layer in `@/lib/mock-api`.
 */

export type ApiError = {
  code: string;
  message: string;
  details?: Record<string, string[]>;
};

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api/v1";

export async function apiRequest<T>(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _path: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _init?: RequestInit
): Promise<T> {
  // Frontend phase: mock services are used by pages.
  // Later: implement real fetch, session tokens, error mapping, and tenant header injection here.
  throw new Error(
    "OrbitERP: Real API client is not connected yet. Use the typed mock service layer in @/lib/mock-api."
  );
}
