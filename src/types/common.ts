export type EntityStatus = "active" | "inactive" | "pending" | "suspended" | "archived";

export interface PaginationParams {
  page: number;
  pageSize: number;
  total?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiFilter {
  search?: string;
  status?: string;
  branchId?: string;
  departmentId?: string;
  startDate?: string;
  endDate?: string;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}
