import { NavSection } from "./dashboard.section";

export const employeeNavItems: NavSection[] = [
  {
    title: "My Time & Workplace",
    items: [
      {
        title: "My Attendance",
        href: "/attendance",
        icon: "CalendarCheck",
        roles: ["EMPLOYEE"],
        description: "Clock in/out punches, PeopleDesk calendar, and work hours",
      },
      {
        title: "My Shifts",
        href: "/shifts",
        icon: "Clock",
        roles: ["EMPLOYEE"],
        description: "Assigned working hours, grace periods, and break times",
      },
      {
        title: "Leave & Time-Off",
        href: "/leave",
        icon: "CalendarOff",
        roles: ["EMPLOYEE"],
        description: "Apply for leave, view balances, and track approval status",
      },
    ],
  },
];
