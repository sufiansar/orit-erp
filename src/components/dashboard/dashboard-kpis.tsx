"use client";

import * as React from "react";
import { StatCard } from "@/components/shared/stat-card";
import { Users, UserCheck, CalendarOff, Activity } from "lucide-react";
import { useMockStore } from "@/lib/mock-api/store";

export function DashboardKpis() {
  const employees = useMockStore((s) => s.employees);
  const attendance = useMockStore((s) => s.attendance);
  const leaveRequests = useMockStore((s) => s.leaveRequests);

  const totalEmployees = employees.length;
  const presentToday = attendance.filter(
    (a) => a.status === "present" || a.status === "late" || a.status === "early_exit"
  ).length;
  const pendingLeaves = leaveRequests.filter((r) => r.status === "pending").length;
  const attendanceRate = totalEmployees > 0 ? (presentToday / totalEmployees) * 100 : 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Workforce"
        value={totalEmployees}
        icon={Users}
        change="+4.2%"
        trend="up"
        subtitle="vs. previous month"
      />
      <StatCard
        title="Present Today"
        value={presentToday}
        icon={UserCheck}
        change={`${totalEmployees - presentToday} off / absent`}
        trend="neutral"
        subtitle="across all branches"
      />
      <StatCard
        title="Pending Leave"
        value={pendingLeaves}
        icon={CalendarOff}
        change={pendingLeaves > 0 ? "Requires action" : "All cleared"}
        trend={pendingLeaves > 0 ? "down" : "up"}
        subtitle="awaiting approvals"
      />
      <StatCard
        title="Attendance Rate"
        value={`${attendanceRate.toFixed(1)}%`}
        icon={Activity}
        change="+2.8%"
        trend="up"
        subtitle="within 15m grace window"
      />
    </div>
  );
}
