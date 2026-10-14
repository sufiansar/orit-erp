import { NavSection } from "./dashboard.section";

export const hrAdminNavItems: NavSection[] = [
  {
    title: "HR Operations",
    items: [
      {
        title: "Staff Directory",
        href: "/employees",
        icon: "Users",
        roles: ["HR_ADMIN"],
        description: "Branch employee profiles, directory, and onboarding",
      },
      {
        title: "Branch Overview",
        href: "/branches",
        icon: "Building2",
        roles: ["HR_ADMIN"],
        description: "Branch facility details, location, and local holiday calendar",
      },
    ],
  },
  {
    title: "Time & Attendance",
    items: [
      {
        title: "Attendance Register",
        href: "/attendance",
        icon: "CalendarCheck",
        roles: ["HR_ADMIN"],
        description: "Biometric punches, manual regularizations, and CSV export",
      },
      {
        title: "Shift Management",
        href: "/shifts",
        icon: "Clock",
        roles: ["HR_ADMIN"],
        description: "Shift assignments, break rules, and grace period settings",
      },
      {
        title: "Leave Approvals",
        href: "/leave",
        icon: "CalendarOff",
        roles: ["HR_ADMIN"],
        badge: "Branch HR",
        description: "Approve or reject leave requests for assigned branch staff",
      },
    ],
  },
  {
    title: "Customization",
    items: [
      {
        title: "Custom Fields",
        href: "/custom-fields",
        icon: "Layers",
        roles: ["HR_ADMIN"],
        description: "Manage custom metadata schema for employee profiles",
      },
    ],
  },
];
