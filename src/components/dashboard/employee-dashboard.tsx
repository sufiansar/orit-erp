"use client";

import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMockStore, mockStore } from "@/lib/mock-api/store";
import { formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/shared/status-badge";
import { LeaveRequestDialog } from "@/components/leave/leave-request-dialog";
import { toast } from "sonner";
import {
  Clock,
  CalendarCheck,
  CalendarDays,
  CalendarOff,
  PlusCircle,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  Building,
  User,
  Coffee,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

export function EmployeeDashboard() {
  const currentUser = useMockStore((s) => s.currentUser);
  const employees = useMockStore((s) => s.employees);
  const leaveRequests = useMockStore((s) => s.leaveRequests);
  const leaveBalances = useMockStore((s) => s.leaveBalances);

  // Active employee context (Sufian or matched by employeeId/email)
  const employee =
    employees.find((e) => e.id === currentUser.employeeId) ||
    employees.find((e) => e.email.includes("sufian")) ||
    employees[0];

  const [applyLeaveOpen, setApplyLeaveOpen] = useState(false);

  // Today check-in simulation
  const [hasCheckedIn, setHasCheckedIn] = useState(true);
  const [hasCheckedOut, setHasCheckedOut] = useState(false);
  const [checkInTime, setCheckInTime] = useState("08:45 AM");
  const [checkOutTime, setCheckOutTime] = useState<string | null>(null);

  const handlePunchToggle = () => {
    const nowTime = new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(new Date());

    try {
      if (!hasCheckedIn) {
        setHasCheckedIn(true);
        setCheckInTime(nowTime);
        mockStore.recordManualPunch(employee.id, "check_in");
        toast.success(`Clock-in recorded at ${nowTime}`, {
          description: `Daily attendance logged for ${employee.fullName}.`,
        });
      } else if (!hasCheckedOut) {
        setHasCheckedOut(true);
        setCheckOutTime(nowTime);
        mockStore.recordManualPunch(employee.id, "check_out");
        toast.success(`Clock-out recorded at ${nowTime}`, {
          description: `Daily shift completed for ${employee.fullName}.`,
        });
      } else {
        toast.info("Shift already completed for today", {
          description: "Both check-in and check-out are already recorded.",
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Punch failed";
      toast.error("Action Denied", { description: msg });
    }
  };

  // Recent leaves applied by this employee
  const myLeaves = leaveRequests
    .filter((l) => l.employeeId === employee.id || l.employeeName === employee.fullName)
    .slice(0, 4);

  // Deterministic past days
  const recentDays = [
    { day: "Wed, Oct 14", status: "Present", in: "08:45 AM", out: "Active", isToday: true },
    { day: "Tue, Oct 13", status: "Present", in: "08:50 AM", out: "05:05 PM" },
    { day: "Mon, Oct 12", status: "Late", in: "09:18 AM", out: "05:30 PM" },
    { day: "Sun, Oct 11", status: "Offday" },
    { day: "Sat, Oct 10", status: "Offday" },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Welcoming Hero Banner (Clean, Personal, Simple) */}
      <div className="rounded-2xl border border-border/80 bg-gradient-to-br from-card via-card to-primary/5 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Staff Self-Service Portal
              </span>
              <span className="text-xs font-mono text-muted-foreground">
                {employee.employeeCode}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Welcome back, {employee.fullName}!
            </h2>
            <p className="text-xs text-muted-foreground">
              {employee.designation} · {employee.departmentName} · {employee.branchName}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              onClick={() => setApplyLeaveOpen(true)}
              size="sm"
              className="gap-1.5 text-xs font-semibold shadow-xs"
            >
              <PlusCircle className="size-3.5" />
              Request Leave
            </Button>
            <Link href="/attendance">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <CalendarCheck className="size-3.5" />
                My Calendar
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Core Employee Quick Cards (4 Focused Cards) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Today Clock & Punch Action */}
        <Card className="border-border/80 shadow-xs flex flex-col justify-between">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Today&apos;s Attendance
              </span>
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="text-2xl font-black tracking-tight text-foreground">
                {hasCheckedOut ? "Clocked Out" : hasCheckedIn ? "Clocked In" : "Not Checked In"}
              </span>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {hasCheckedIn ? `In: ${checkInTime}` : "Shift starts at 08:00 AM"}
                {hasCheckedOut && ` · Out: ${checkOutTime}`}
              </p>
            </div>

            <Button
              onClick={handlePunchToggle}
              size="sm"
              className={`w-full text-xs font-semibold gap-1.5 h-8.5 ${
                hasCheckedOut
                  ? "bg-muted text-muted-foreground hover:bg-muted"
                  : hasCheckedIn
                  ? "bg-amber-600 hover:bg-amber-700 text-white"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              }`}
            >
              {hasCheckedOut ? (
                <>
                  <CheckCircle2 className="size-3.5" />
                  Shift Finished Today
                </>
              ) : hasCheckedIn ? (
                <>
                  <ArrowDown className="size-3.5" />
                  Clock Out (Punch Out)
                </>
              ) : (
                <>
                  <ArrowUp className="size-3.5" />
                  Clock In Now
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Card 2: Shift Schedule */}
        <Card className="border-border/80 shadow-xs flex flex-col justify-between">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Shift Schedule
              </span>
              <Clock className="size-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="text-base font-bold text-foreground">
                08:00 AM – 05:00 PM
              </span>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Morning Regular Shift (9h with 1h lunch)
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium pt-1 border-t border-border/60">
              <Coffee className="size-3" />
              <span>Lunch Break: 01:00 PM – 02:00 PM</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Remaining Leave Balances */}
        <Card className="border-border/80 shadow-xs flex flex-col justify-between">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Time-Off Balance
              </span>
              <CalendarOff className="size-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-foreground">17</span>
              <span className="text-xs text-muted-foreground">days remaining</span>
            </div>
            <div className="grid grid-cols-3 gap-1 text-[10px] text-center pt-1 border-t border-border/60">
              <div className="p-1 rounded bg-muted/40">
                <span className="font-bold text-foreground block">8d</span>
                <span className="text-muted-foreground">Casual</span>
              </div>
              <div className="p-1 rounded bg-muted/40">
                <span className="font-bold text-foreground block">5d</span>
                <span className="text-muted-foreground">Sick</span>
              </div>
              <div className="p-1 rounded bg-muted/40">
                <span className="font-bold text-foreground block">4d</span>
                <span className="text-muted-foreground">Annual</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Reporting Manager */}
        <Card className="border-border/80 shadow-xs flex flex-col justify-between">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Reporting Manager
              </span>
              <User className="size-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="text-sm font-bold text-foreground">
                Sarah Jenkins
              </span>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Engineering Team Lead
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground pt-1 border-t border-border/60">
              <Building className="size-3 shrink-0 text-primary" />
              <span className="truncate">Singapore Tech Hub · Level 4</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Two Focused Sections: Recent Attendance & Leave Requests */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column (7 cols): Weekly Attendance Roster for this employee */}
        <Card className="lg:col-span-7 border-border/80 shadow-xs">
          <CardHeader className="pb-3 border-b border-border/60 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold text-foreground">
                My Recent Attendance Log
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Your biometric punches for the current work period
              </p>
            </div>
            <Link
              href="/attendance"
              className="text-xs text-primary font-medium hover:underline inline-flex items-center gap-1"
            >
              Full Calendar
              <ArrowRight className="size-3" />
            </Link>
          </CardHeader>
          <CardContent className="p-4 space-y-2.5">
            {recentDays.map((rec) => {
              let badgeColor = "bg-muted text-muted-foreground border-border";
              if (rec.status === "Present") {
                badgeColor = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
              } else if (rec.status === "Late") {
                badgeColor = "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
              } else if (rec.status === "Offday") {
                badgeColor = "bg-muted text-muted-foreground border-border/60";
              }

              return (
                <div
                  key={rec.day}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                    rec.isToday
                      ? "border-primary/40 bg-primary/5"
                      : "border-border/60 bg-card hover:bg-muted/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-lg bg-muted flex items-center justify-center font-bold text-xs text-foreground">
                      {rec.day.slice(0, 3)}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-foreground">
                        {rec.day} {rec.isToday && "(Today)"}
                      </span>
                      <p className="text-[11px] text-muted-foreground">
                        {rec.in ? `Clock In: ${rec.in} · Clock Out: ${rec.out}` : "Weekend Scheduled Rest Day"}
                      </p>
                    </div>
                  </div>

                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badgeColor}`}>
                    {rec.status}
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Right Column (5 cols): Leave Requests & Upcoming Holidays */}
        <div className="lg:col-span-5 space-y-6">
          {/* Leave Requests Card */}
          <Card className="border-border/80 shadow-xs">
            <CardHeader className="pb-3 border-b border-border/60 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-foreground">
                  My Leave Applications
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Recent time-off submissions
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setApplyLeaveOpen(true)}
                className="h-7 text-xs text-primary font-semibold gap-1 hover:bg-primary/10"
              >
                <PlusCircle className="size-3" />
                Apply
              </Button>
            </CardHeader>
            <CardContent className="p-4 space-y-2.5">
              {myLeaves.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No pending or past leave requests found.
                </p>
              ) : (
                myLeaves.map((l) => (
                  <div
                    key={l.id}
                    className="p-3 rounded-lg border border-border/60 bg-muted/20 hover:bg-muted/40 transition-colors text-xs flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground capitalize">
                          {l.leaveType} Leave
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground">
                          ({l.daysCount} {l.daysCount === 1 ? "day" : "days"})
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {formatDate(l.startDate)} → {formatDate(l.endDate)}
                      </p>
                    </div>
                    <StatusBadge status={l.status} />
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Upcoming Holidays */}
          <Card className="border-border/80 shadow-xs">
            <CardHeader className="pb-2 border-b border-border/60">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Upcoming Public Holidays
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/50">
                <div className="flex items-center gap-2.5">
                  <div className="size-7 rounded bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                    21
                  </div>
                  <div>
                    <span className="font-semibold text-foreground">Deepavali Festival</span>
                    <span className="text-[10px] text-muted-foreground block">Wednesday · Singapore Holiday</span>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px] bg-background">Public</Badge>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/50">
                <div className="flex items-center gap-2.5">
                  <div className="size-7 rounded bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                    26
                  </div>
                  <div>
                    <span className="font-semibold text-foreground">Company Innovation Day</span>
                    <span className="text-[10px] text-muted-foreground block">Monday · Organization Offday</span>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px] bg-background">Corporate</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Leave Application Dialog */}
      <LeaveRequestDialog
        open={applyLeaveOpen}
        onOpenChange={setApplyLeaveOpen}
      />
    </div>
  );
}
