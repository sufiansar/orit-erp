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
  CheckCircle,
  XCircle,
  ArrowRight,
  Briefcase,
  Layers,
  Sparkles,
  Coffee,
  Check,
} from "lucide-react";

export function ManagerDashboard() {
  const currentUser = useMockStore((s) => s.currentUser);
  const employees = useMockStore((s) => s.employees);
  const leaveRequests = useMockStore((s) => s.leaveRequests);

  // Mock team members (Engineering department direct reports)
  const teamMembers = employees.slice(0, 6);
  const pendingTeamLeaves = leaveRequests
    .filter((l) => teamMembers.some((m) => m.id === l.employeeId) && l.status === "pending")
    .slice(0, 3);

  const handleReview = (leaveId: string, status: "approved" | "rejected") => {
    try {
      mockStore.updateLeaveStatus(
        leaveId,
        status,
        currentUser.name,
        status === "approved" ? "Approved by Team Manager" : "Declined by Team Manager"
      );
      toast.success(`Team leave request ${status.toUpperCase()}!`, {
        description: `Sprint coverage updated accordingly.`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Review failed";
      toast.error("Operation Denied", { description: msg });
    }
  };

  const teamCoverage = [
    { name: "MD. Abu Sufian", role: "Senior Engineer", mon: "In Office", tue: "In Office", wed: "In Office", thu: "In Office", fri: "In Office" },
    { name: "Liam Davies", role: "Platform Engineer", mon: "In Office", tue: "In Office", wed: "Leave", thu: "Leave", fri: "In Office" },
    { name: "Emma Watson", role: "Frontend Dev", mon: "In Office", tue: "Remote", wed: "In Office", thu: "Remote", fri: "In Office" },
    { name: "Carlos Rivera", role: "QA Engineer", mon: "In Office", tue: "In Office", wed: "In Office", thu: "In Office", fri: "In Office" },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Manager Header Banner */}
      <div className="rounded-2xl border border-sky-300 dark:border-sky-800 bg-gradient-to-r from-sky-500/10 via-card to-card p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/30">
              Department & Team Lead
            </span>
            <Badge variant="outline" className="text-xs">
              Engineering Team
            </Badge>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Team Manager Dashboard
          </h2>
          <p className="text-xs text-muted-foreground">
            Managing <strong>{teamMembers.length} direct reports</strong> · Department: Engineering · Shift Coverage & Sprint Delivery
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/attendance">
            <Button size="sm" className="gap-1.5 text-xs font-semibold">
              <Clock className="size-3.5" />
              Team Punches
            </Button>
          </Link>
          <Link href="/leave">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <CalendarOff className="size-3.5" />
              Leave Approvals ({pendingTeamLeaves.length})
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Team KPI Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Direct Reports"
          value={teamMembers.length}
          icon={Users}
          trend="neutral"
          change="Engineering squad"
        />
        <StatCard
          title="Team Present Today"
          value={`${teamMembers.length - 1} / ${teamMembers.length}`}
          icon={UserCheck}
          trend="up"
          change="83.3% team in office"
        />
        <StatCard
          title="On Leave Today"
          value={1}
          icon={Coffee}
          trend="down"
          change="Liam (Casual leave)"
        />
        <StatCard
          title="Pending Approvals"
          value={pendingTeamLeaves.length}
          icon={CalendarOff}
          trend="neutral"
          change="Awaiting manager sign-off"
        />
      </div>

      {/* 3. Operational Sections: Direct Reports Today & Approvals */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left (7 cols): Direct Reports Today's Status */}
        <Card className="lg:col-span-7 border-border/80 shadow-xs">
          <CardHeader className="pb-3 border-b border-border/60 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold text-foreground">
                My Direct Reports Today
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Real-time check-in and shift availability
              </p>
            </div>
            <Badge variant="outline" className="text-xs bg-muted/60">
              Oct 14, 2026
            </Badge>
          </CardHeader>
          <CardContent className="p-4 space-y-2.5">
            {teamMembers.map((member, idx) => {
              const isIn = idx !== 1;
              const inTime = idx === 0 ? "08:45 AM" : idx === 2 ? "08:52 AM" : "09:05 AM";

              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-muted/20 hover:bg-muted/40 transition-colors text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs">
                      {member.firstName[0]}
                      {member.lastName[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-foreground">{member.fullName}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {member.employeeCode}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        {member.designation} · {isIn ? `Clocked In: ${inTime}` : "On Approved Leave"}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      isIn
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                    }`}
                  >
                    {isIn ? "In Office" : "On Leave"}
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Right (5 cols): Pending Team Approvals */}
        <Card className="lg:col-span-5 border-border/80 shadow-xs">
          <CardHeader className="pb-3 border-b border-border/60 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold text-foreground">
                Team Approvals
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Leave requests requiring team lead authorization
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
            {pendingTeamLeaves.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8">
                No pending leave requests from your direct reports.
              </p>
            ) : (
              pendingTeamLeaves.map((req) => (
                <div
                  key={req.id}
                  className="p-3 rounded-xl border border-border/70 bg-muted/20 hover:bg-muted/40 transition-colors text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-foreground">{req.employeeName}</span>
                      <span className="text-[10px] text-muted-foreground ml-1.5 font-mono">
                        ({req.daysCount}d)
                      </span>
                    </div>
                    <Badge variant="outline" className="text-[10px] capitalize bg-background">
                      {req.leaveType}
                    </Badge>
                  </div>

                  <p className="text-[11px] text-muted-foreground">
                    {formatDate(req.startDate)} → {formatDate(req.endDate)} · &ldquo;{req.reason}&rdquo;
                  </p>

                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-border/40">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReview(req.id, "approved")}
                      className="h-7 text-xs px-2.5 gap-1 text-emerald-700 bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-300 dark:border-emerald-800"
                    >
                      <CheckCircle className="size-3" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReview(req.id, "rejected")}
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
      </div>

      {/* 4. Team Sprint & Shift Coverage Matrix */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="pb-3 border-b border-border/60 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold text-foreground">
              Team Weekly Shift Coverage Planner
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Attendance and remote presence projection for sprint planning
            </p>
          </div>
          <Badge variant="outline" className="text-xs bg-muted/60">
            Sprint 42 (Oct 12 – Oct 16)
          </Badge>
        </CardHeader>
        <CardContent className="p-4 overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-border/60 text-muted-foreground pb-2">
                <th className="py-2 font-semibold">Team Member</th>
                <th className="py-2 font-semibold text-center">Mon (12)</th>
                <th className="py-2 font-semibold text-center">Tue (13)</th>
                <th className="py-2 font-semibold text-center text-primary font-bold">Wed (14 - Today)</th>
                <th className="py-2 font-semibold text-center">Thu (15)</th>
                <th className="py-2 font-semibold text-center">Fri (16)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {teamCoverage.map((row) => (
                <tr key={row.name} className="hover:bg-muted/20">
                  <td className="py-2.5 font-bold text-foreground">
                    {row.name}
                    <span className="block text-[10px] text-muted-foreground font-normal">{row.role}</span>
                  </td>
                  <td className="py-2.5 text-center"><span className="px-2 py-0.5 rounded bg-muted text-[10px]">{row.mon}</span></td>
                  <td className="py-2.5 text-center"><span className="px-2 py-0.5 rounded bg-muted text-[10px]">{row.tue}</span></td>
                  <td className="py-2.5 text-center"><span className="px-2 py-0.5 rounded font-bold bg-primary/10 text-primary text-[10px] border border-primary/20">{row.wed}</span></td>
                  <td className="py-2.5 text-center"><span className={`px-2 py-0.5 rounded text-[10px] ${row.thu === "Leave" ? "bg-amber-500/10 text-amber-700" : "bg-muted"}`}>{row.thu}</span></td>
                  <td className="py-2.5 text-center"><span className="px-2 py-0.5 rounded bg-muted text-[10px]">{row.fri}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
