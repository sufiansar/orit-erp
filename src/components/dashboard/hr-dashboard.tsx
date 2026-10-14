"use client";

import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { useMockStore, mockStore } from "@/lib/mock-api/store";
import { formatDate } from "@/lib/format";
import { toast } from "sonner";
import {
  Users,
  Clock,
  UserCheck,
  CalendarOff,
  Fingerprint,
  ShieldAlert,
  ArrowRight,
  CheckCircle,
  XCircle,
  UserPlus,
  Edit3,
  Building,
  Check,
} from "lucide-react";
import { EmployeeDialog } from "@/components/employees/employee-dialog";
import { AttendanceRegularizeDialog } from "@/components/attendance/attendance-regularize-dialog";

export function HrDashboard() {
  const currentUser = useMockStore((s) => s.currentUser);
  const employees = useMockStore((s) => s.employees);
  const attendance = useMockStore((s) => s.attendance);
  const leaveRequests = useMockStore((s) => s.leaveRequests);
  const devices = useMockStore((s) => s.devices);

  const [onboardOpen, setOnboardOpen] = useState(false);
  const [regularizeOpen, setRegularizeOpen] = useState(false);
  const [selectedEmpToRegularize, setSelectedEmpToRegularize] = useState(
    employees[0] || null
  );

  // Filter dataset strictly to HR's branch (Singapore HQ)
  const branchId = currentUser.branchId || "branch-sg-hq";
  const branchEmployees = employees.filter((e) => e.branchId === branchId);
  const branchAttendance = attendance.filter((a) => a.branchId === branchId);
  const branchLeaves = leaveRequests.filter((l) => l.branchId === branchId);

  const presentCount = branchAttendance.filter((a) => a.status === "present").length;
  const lateCount = branchAttendance.filter((a) => a.status === "late").length;
  const pendingLeaves = branchLeaves.filter((l) => l.status === "pending");

  const handleQuickReview = (leaveId: string, status: "approved" | "rejected") => {
    try {
      mockStore.updateLeaveStatus(
        leaveId,
        status,
        currentUser.name,
        status === "approved" ? "Quick approved by HR" : "Declined by HR"
      );
      toast.success(
        `Leave request ${status.toUpperCase()} successfully!`,
        { description: `Notification dispatched to employee.` }
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Action failed";
      toast.error("Operation Denied", { description: msg });
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Branch HR Scope Banner */}
      <div className="rounded-2xl border border-amber-300 dark:border-amber-800 bg-gradient-to-r from-amber-500/10 via-card to-card p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
              Branch HR Operations
            </span>
            <Badge variant="outline" className="text-xs">
              Singapore Tech Hub (HQ)
            </Badge>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            HR Management Dashboard
          </h2>
          <p className="text-xs text-muted-foreground">
            Active as <strong>{currentUser.name}</strong> · Responsible for {branchEmployees.length} stationed personnel and 3 edge biometric terminals.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={() => setOnboardOpen(true)}
            size="sm"
            className="gap-1.5 text-xs font-semibold"
          >
            <UserPlus className="size-3.5" />
            Onboard Employee
          </Button>
          <Link href="/attendance">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <Clock className="size-3.5" />
              Attendance Register
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Branch HR Specific KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Branch Headcount"
          value={branchEmployees.length}
          icon={Users}
          trend="up"
          change="Stationed at Singapore HQ"
        />
        <StatCard
          title="Present Today"
          value={presentCount}
          icon={UserCheck}
          trend="up"
          change="89.5% daily attendance"
        />
        <StatCard
          title="Late Arrivals"
          value={lateCount}
          icon={Clock}
          trend="down"
          change="Grace period exceeded"
        />
        <StatCard
          title="Pending Leave Review"
          value={pendingLeaves.length}
          icon={CalendarOff}
          trend="neutral"
          change="Awaiting your approval"
        />
      </div>

      {/* 3. Operational Sections: Pending Approvals & Branch Attendance Roster */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left (6 cols): Pending Leave Approvals for HR Branch */}
        <Card className="lg:col-span-6 border-border/80 shadow-xs">
          <CardHeader className="pb-3 border-b border-border/60 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold text-foreground">
                Branch Leave Approvals
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Time-off requests from Singapore HQ personnel
              </p>
            </div>
            <Link
              href="/leave"
              className="text-xs text-primary font-medium hover:underline inline-flex items-center gap-1"
            >
              All Leaves
              <ArrowRight className="size-3" />
            </Link>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {pendingLeaves.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">
                All branch leave requests have been reviewed and processed!
              </p>
            ) : (
              pendingLeaves.map((req) => (
                <div
                  key={req.id}
                  className="p-3 rounded-xl border border-border/70 bg-muted/20 hover:bg-muted/40 transition-colors text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-foreground">{req.employeeName}</span>
                      <span className="text-[10px] text-muted-foreground ml-1.5 font-mono">
                        ({req.employeeCode})
                      </span>
                    </div>
                    <Badge variant="outline" className="text-[10px] capitalize bg-background">
                      {req.leaveType} ({req.daysCount}d)
                    </Badge>
                  </div>

                  <p className="text-[11px] text-muted-foreground">
                    {formatDate(req.startDate)} → {formatDate(req.endDate)} · &ldquo;{req.reason}&rdquo;
                  </p>

                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-border/40">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleQuickReview(req.id, "approved")}
                      className="h-7 text-xs px-2.5 gap-1 text-emerald-700 bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-300 dark:border-emerald-800"
                    >
                      <CheckCircle className="size-3" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleQuickReview(req.id, "rejected")}
                      className="h-7 text-xs px-2.5 gap-1 text-rose-700 bg-rose-500/10 hover:bg-rose-500/20 border-rose-300 dark:border-rose-800"
                    >
                      <XCircle className="size-3" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Right (6 cols): Branch Daily Attendance Roster & Quick Regularize */}
        <Card className="lg:col-span-6 border-border/80 shadow-xs">
          <CardHeader className="pb-3 border-b border-border/60 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold text-foreground">
                Today&apos;s Branch Attendance Log
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Live biometric punches for Singapore HQ
              </p>
            </div>
            <Link
              href="/attendance"
              className="text-xs text-primary font-medium hover:underline inline-flex items-center gap-1"
            >
              Full Register
              <ArrowRight className="size-3" />
            </Link>
          </CardHeader>
          <CardContent className="p-4 space-y-2.5">
            {branchAttendance.slice(0, 5).map((rec) => (
              <div
                key={rec.id}
                className="flex items-center justify-between p-2.5 rounded-lg border border-border/60 bg-muted/20 hover:bg-muted/40 transition-colors text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground">{rec.employeeName}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {rec.employeeCode}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Check In: <strong className="text-foreground">{rec.checkIn || "Pending"}</strong> · Out: {rec.checkOut || "Active"}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <StatusBadge status={rec.status} />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      const emp = branchEmployees.find((e) => e.id === rec.employeeId);
                      if (emp) {
                        setSelectedEmpToRegularize(emp);
                        setRegularizeOpen(true);
                      }
                    }}
                    className="h-7 text-xs px-2 gap-1 text-primary hover:bg-primary/10"
                    title="Regularize attendance"
                  >
                    <Edit3 className="size-3" />
                    Regularize
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Onboard Employee Dialog */}
      <EmployeeDialog
        open={onboardOpen}
        onOpenChange={setOnboardOpen}
      />

      {/* Regularize Attendance Dialog */}
      <AttendanceRegularizeDialog
        open={regularizeOpen}
        onOpenChange={setRegularizeOpen}
        employee={selectedEmpToRegularize}
      />
    </div>
  );
}
