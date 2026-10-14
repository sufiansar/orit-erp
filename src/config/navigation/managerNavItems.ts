import { NavSection } from "./dashboard.section";

export const managerNavItems: NavSection[] = [
  {
    title: "Team Supervision",
    items: [
      {
        title: "Direct Reports",
        href: "/employees",
        icon: "Users",
        roles: ["MANAGER"],
        description: "Department team members and direct report directory",
      },
      {
        title: "Team Attendance",
        href: "/attendance",
        icon: "CalendarCheck",
        roles: ["MANAGER"],
        description: "Team punches, shift check-ins, and daily availability",
      },
      {
        title: "Team Shifts",
        href: "/shifts",
        icon: "Clock",
        roles: ["MANAGER"],
        description: "Department shift schedules and weekly coverage planner",
      },
      {
        title: "Team Leave Approvals",
        href: "/leave",
        icon: "CalendarOff",
        roles: ["MANAGER"],
        badge: "Approvals",
        description: "Review and approve leave applications for squad members",
      },
    ],
  },
];
