"use client";

import * as React from "react";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { PageContainer } from "@/components/shared/page-container";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { EmployeeDialog } from "@/components/employees/employee-dialog";
import { AttendanceCalendarView } from "@/components/attendance/attendance-calendar-view";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useMockStore } from "@/lib/mock-api/store";
import { formatDate, getInitials } from "@/lib/format";
import {
  Mail,
  Phone,
  Building2,
  Briefcase,
  Calendar,
  Layers,
  ArrowLeft,
  Edit2,
  CalendarCheck,
  CalendarOff,
  UserX,
  Lock,
} from "lucide-react";
import { mockStore } from "@/lib/mock-api/store";

export default function EmployeeDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const employeeId = params?.id as string;

  const employees = useMockStore((s) => s.employees);
  const attendanceRecords = useMockStore((s) => s.attendance);
  const leaveRequests = useMockStore((s) => s.leaveRequests);
  const currentUser = useMockStore((s) => s.currentUser);
  const customFieldDefs = useMockStore((s) =>
    s.customFields.filter((cf) => cf.entityType === "employee")
  );

  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const employee = employees.find((e) => e.id === employeeId);

  // Graceful handling for unknown employee ID
  if (!employee) {
    return (
      <>
        <PageHeader
          title="Employee Not Found"
          breadcrumbs={[{ label: "People" }, { label: "Employees", href: "/employees" }, { label: "Unknown" }]}
        />
        <PageContainer>
          <EmptyState
            icon={UserX}
            title="Employee profile not found"
            description={`No personnel record was found matching ID "${employeeId}". The employee may have been deactivated or removed.`}
            action={
              <Link href="/employees">
                <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                  <ArrowLeft className="size-3.5" />
                  Return to Employees Directory
                </Button>
              </Link>
            }
          />
        </PageContainer>
      </>
    );
  }

  const canManage = mockStore.canManageBranch(employee.branchId);

  // Employee-specific attendance history
  const employeeAttendance = attendanceRecords
    .filter((a) => a.employeeId === employee.id)
    .slice(0, 5);

  // Employee-specific leaves
  const employeeLeaves = leaveRequests.filter(
    (l) => l.employeeId === employee.id
  );

  return (
    <>
      <PageHeader
        title={employee.fullName}
        description={`${employee.designation} · ${employee.departmentName}`}
        breadcrumbs={[
          { label: "People" },
          { label: "Employees", href: "/employees" },
          { label: employee.fullName },
        ]}
        badge={<StatusBadge status={employee.status} />}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/employees")}
              className="gap-1 text-xs"
            >
              <ArrowLeft className="size-3.5" />
              Back
            </Button>
            {canManage ? (
              <Button
                size="sm"
                onClick={() => setEditDialogOpen(true)}
                className="gap-1.5 text-xs font-semibold"
              >
                <Edit2 className="size-3.5" />
                Edit Profile
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                disabled
                className="gap-1.5 text-xs opacity-60 cursor-not-allowed"
                title={`Branch Restricted: You can only edit staff in ${currentUser.branchName || "your branch"}.`}
              >
                <Lock className="size-3.5" />
                Edit (Branch Locked)
              </Button>
            )}
          </div>
        }
      />

      <PageContainer maxWidth="full">
        {/* Branch Scope Notice */}
        {!canManage && (
          <div className="rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-500/10 p-3.5 mb-4 flex items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200">
            <div className="flex items-center gap-2.5">
              <Lock className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <span>
                <strong>Branch Scoped Notice:</strong> {employee.fullName} is stationed at <strong>{employee.branchName}</strong>. You are logged in as {currentUser.name} ({currentUser.branchName || "Branch HR"}). Profile details and shifts are Read-Only.
              </span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-background border border-amber-300 text-amber-700 dark:text-amber-300 font-medium shrink-0">
              Read-Only View
            </span>
          </div>
        )}
        {/* Profile Card Summary */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column: Personal & Contact Card */}
          <SectionCard
            title="Personnel Information"
            description="Contact coordinates and organizational hierarchy"
            className="lg:col-span-1"
          >
            <div className="flex flex-col items-center text-center pb-5 border-b border-border/60">
              <Avatar className="size-20 border-2 border-border shadow-xs">
                <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                  {getInitials(employee.fullName)}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-base font-bold text-foreground mt-3">
                {employee.fullName}
              </h2>
              <span className="text-xs text-muted-foreground">
                {employee.designation}
              </span>
              <span className="mt-1 font-mono text-[11px] px-2 py-0.5 rounded bg-muted text-muted-foreground font-semibold">
                {employee.employeeCode}
              </span>
            </div>

            <div className="pt-4 space-y-3.5 text-xs">
              <div className="flex items-center gap-2.5 text-muted-foreground">
                <Mail className="size-4 text-primary shrink-0" />
                <span className="text-foreground truncate">{employee.email}</span>
              </div>
              <div className="flex items-center gap-2.5 text-muted-foreground">
                <Phone className="size-4 text-primary shrink-0" />
                <span className="text-foreground">{employee.phone || "—"}</span>
              </div>
              <div className="flex items-center gap-2.5 text-muted-foreground">
                <Building2 className="size-4 text-primary shrink-0" />
                <span className="text-foreground">{employee.branchName}</span>
              </div>
              <div className="flex items-center gap-2.5 text-muted-foreground">
                <Briefcase className="size-4 text-primary shrink-0" />
                <span className="text-foreground capitalize">{employee.employmentType}</span>
              </div>
              <div className="flex items-center gap-2.5 text-muted-foreground">
                <Calendar className="size-4 text-primary shrink-0" />
                <span>Joined on {formatDate(employee.joiningDate)}</span>
              </div>
            </div>
          </SectionCard>

          {/* Right Column: Attendance & Leaves Tabs */}
          <div className="space-y-6 lg:col-span-2">
            {/* Custom Fields Section */}
            {customFieldDefs.length > 0 && (
              <SectionCard
                title="Tenant Custom Profile Fields"
                description="Organization-specific extended schema attributes"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {customFieldDefs.map((cf) => {
                    const rawVal = employee.customFields?.[cf.fieldKey];
                    let displayVal = "—";
                    if (rawVal !== undefined && rawVal !== null) {
                      if (typeof rawVal === "boolean") {
                        displayVal = rawVal ? "Yes" : "No";
                      } else {
                        displayVal = String(rawVal);
                      }
                    }

                    return (
                      <div
                        key={cf.id}
                        className="rounded-lg border border-border/80 bg-muted/20 p-3 space-y-1"
                      >
                        <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                          <Layers className="size-3 text-primary" />
                          {cf.label}
                        </span>
                        <p className="text-xs font-semibold text-foreground">
                          {displayVal}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </SectionCard>
            )}

            {/* Attendance Calendar & Punch Breakdown */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-sm font-bold text-foreground">
                  Attendance Calendar & Punches
                </h3>
                <Link
                  href="/attendance"
                  className="text-xs text-primary font-medium hover:underline inline-flex items-center gap-1"
                >
                  <CalendarCheck className="size-3.5" />
                  Organization Register
                </Link>
              </div>
              <AttendanceCalendarView employeeId={employee.id} />
            </div>

            {/* Leave History Summary */}
            <SectionCard
              title="Time-Off & Leave History"
              description="Leave balances and approval status"
              action={
                <Link
                  href="/leave"
                  className="text-xs text-primary font-medium hover:underline inline-flex items-center gap-1"
                >
                  <CalendarOff className="size-3.5" />
                  Leave Dashboard
                </Link>
              }
            >
              {employeeLeaves.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">
                  No time-off requests submitted yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {employeeLeaves.map((lev) => (
                    <div
                      key={lev.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-card hover:bg-muted/30 transition-colors text-xs"
                    >
                      <div>
                        <p className="font-semibold text-foreground capitalize">
                          {lev.leaveType} Leave ({lev.daysCount} days)
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {formatDate(lev.startDate)} – {formatDate(lev.endDate)}
                        </p>
                        {lev.reason && (
                          <p className="text-[11px] text-muted-foreground/80 italic mt-0.5">
                            &ldquo;{lev.reason}&rdquo;
                          </p>
                        )}
                      </div>

                      <StatusBadge status={lev.status} />
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          </div>
        </div>
      </PageContainer>

      {/* Edit Profile Dialog */}
      <EmployeeDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        employee={employee}
      />
    </>
  );
}
