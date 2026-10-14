import { EntityStatus } from "./common";

export interface Branch {
  id: string;
  organizationId: string;
  name: string;
  code: string;
  location: string;
  timezone: string;
  employeeCount: number;
  status: EntityStatus;
  address?: string;
  phone?: string;
  managerName?: string;
}

export interface Department {
  id: string;
  organizationId: string;
  name: string;
  code: string;
  branchId?: string;
  managerId?: string;
  managerName?: string;
  employeeCount: number;
  description?: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  domain: string;
  status: EntityStatus;
  plan: "starter" | "growth" | "enterprise";
  employeeCount: number;
  branchesCount: number;
  currency: string;
  timezone: string;
  locale: string;
  weekStart: "monday" | "sunday" | "saturday";
  dateFormat: string;
  createdAt: string;
  logoUrl?: string;
}
