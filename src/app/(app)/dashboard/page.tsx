"use client";

import * as React from "react";
import { PageContainer } from "@/components/shared/page-container";
import { useMockStore } from "@/lib/mock-api/store";
import { EmployeeDashboard } from "@/components/dashboard/employee-dashboard";
import { HrDashboard } from "@/components/dashboard/hr-dashboard";
import { ManagerDashboard } from "@/components/dashboard/manager-dashboard";
import { OrgAdminDashboard } from "@/components/dashboard/org-admin-dashboard";
import { PlatformAdminDashboard } from "@/components/dashboard/platform-admin-dashboard";

export default function DashboardPage() {
  const currentUser = useMockStore((s) => s.currentUser);

  return (
    <PageContainer maxWidth="full" className="py-6 space-y-6">
      {currentUser.roleType === "employee" && <EmployeeDashboard />}
      {currentUser.roleType === "hr_admin" && <HrDashboard />}
      {currentUser.roleType === "manager" && <ManagerDashboard />}
      {currentUser.roleType === "org_admin" && <OrgAdminDashboard />}
      {currentUser.roleType === "platform_admin" && <PlatformAdminDashboard />}
      {!currentUser.roleType && <EmployeeDashboard />}
    </PageContainer>
  );
}
