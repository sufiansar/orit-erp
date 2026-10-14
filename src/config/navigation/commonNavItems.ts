import { NavSection, UserRole } from "./dashboard.section";

export const commonNavItems = (role: UserRole): NavSection[] => {
  return [
    {
      title: "Overview",
      items: [
        {
          title: "Dashboard",
          href: "/dashboard",
          icon: "LayoutDashboard",
          roles: ["SUPER_ADMIN", "ORG_ADMIN", "HR_ADMIN", "MANAGER", "EMPLOYEE"],
          description: "Role-specific operational overview and quick actions",
        },
      ],
    },
  ];
};
