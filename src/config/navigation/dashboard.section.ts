export type UserRole =
  | "SUPER_ADMIN"
  | "ORG_ADMIN"
  | "HR_ADMIN"
  | "MANAGER"
  | "EMPLOYEE";

export interface NavItem {
  title: string;
  href: string;
  icon: string;
  roles: UserRole[];
  badge?: string;
  description?: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}
