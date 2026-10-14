"use client";

import * as React from "react";
import { DashboardKpis } from "./dashboard-kpis";
import { AttendanceTrendChart } from "./attendance-trend-chart";
import { DepartmentDistributionChart } from "./department-distribution-chart";
import { QuickActionsBar } from "./quick-actions-bar";
import { PendingApprovalsPanel } from "./pending-approvals-panel";
import { RecentActivityList } from "./recent-activity-list";
import { Badge } from "@/components/ui/badge";
import { useMockStore } from "@/lib/mock-api/store";

export function OrgAdminDashboard() {
  const currentOrg = useMockStore((s) => s.getCurrentOrg());
  const currentUser = useMockStore((s) => s.currentUser);

  return (
    <div className="space-y-6">
      {/* Executive Hero Banner */}
      <div className="rounded-2xl border border-indigo-200 dark:border-indigo-900 bg-gradient-to-r from-indigo-500/10 via-card to-card p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
              Executive Organization Admin
            </span>
            <Badge variant="outline" className="text-xs uppercase font-semibold">
              {currentOrg.plan} plan
            </Badge>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            {currentOrg.name} Overview
          </h2>
          <p className="text-xs text-muted-foreground">
            Logged in as <strong>{currentUser.name}</strong> · Full company-wide governance across {currentOrg.branchesCount} international branches.
          </p>
        </div>
      </div>

      {/* High-level KPIs */}
      <DashboardKpis />

      {/* Quick Actions Shortcuts */}
      <div className="space-y-1">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
          Frequent Operations
        </h3>
        <QuickActionsBar />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AttendanceTrendChart />
        <DepartmentDistributionChart />
      </div>

      {/* Action Panels Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <PendingApprovalsPanel />
        <RecentActivityList />
      </div>
    </div>
  );
}
