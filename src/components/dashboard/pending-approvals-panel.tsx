"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { useMockStore, mockStore } from "@/lib/mock-api/store";
import { formatDate } from "@/lib/format";
import { toast } from "sonner";
import { Check, X, ArrowRight, Calendar } from "lucide-react";

export function PendingApprovalsPanel() {
  const leaveRequests = useMockStore((s) => s.leaveRequests);
  const pendingRequests = leaveRequests.filter((r) => r.status === "pending").slice(0, 3);

  const handleApprove = (id: string, name: string) => {
    mockStore.updateLeaveStatus(id, "approved", "Alina Vance", "Approved from dashboard quick action.");
    toast.success(`Approved leave request for ${name}`);
  };

  const handleReject = (id: string, name: string) => {
    mockStore.updateLeaveStatus(id, "rejected", "Alina Vance", "Declined from dashboard review.");
    toast.info(`Rejected leave request for ${name}`);
  };

  return (
    <Card className="shadow-xs border-border/80 flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/60">
        <div>
          <CardTitle className="text-base font-semibold">Pending Approvals</CardTitle>
          <CardDescription className="text-xs">
            Time-off requests awaiting administrative clearance
          </CardDescription>
        </div>
        <Link
          href="/leave"
          className="inline-flex items-center gap-1 text-xs text-primary font-medium hover:underline py-1 px-2 rounded-md hover:bg-primary/5 transition-colors"
        >
          View All
          <ArrowRight className="size-3" />
        </Link>
      </CardHeader>
      <CardContent className="p-4 flex-1 divide-y divide-border/60">
        {pendingRequests.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            No pending leave requests. All employee requests are up to date!
          </div>
        ) : (
          pendingRequests.map((req) => (
            <div key={req.id} className="py-3 first:pt-0 last:pb-0 flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-xs font-semibold text-foreground">{req.employeeName}</h4>
                  <p className="text-[11px] text-muted-foreground">
                    {req.departmentName} · {req.employeeCode}
                  </p>
                </div>
                <StatusBadge status={req.leaveType} label={`${req.leaveType} leave`} />
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 p-2 rounded-md">
                <Calendar className="size-3.5 text-primary shrink-0" />
                <span>
                  {formatDate(req.startDate, "MMM dd")} – {formatDate(req.endDate, "MMM dd, yyyy")} ({req.daysCount} days)
                </span>
              </div>

              {req.reason && (
                <p className="text-[11px] text-muted-foreground/90 italic truncate">
                  &ldquo;{req.reason}&rdquo;
                </p>
              )}

              <div className="flex items-center justify-end gap-2 pt-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleReject(req.id, req.employeeName)}
                  className="h-7 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 border-rose-200 dark:border-rose-900 gap-1"
                >
                  <X className="size-3.5" />
                  Decline
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleApprove(req.id, req.employeeName)}
                  className="h-7 text-xs gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <Check className="size-3.5" />
                  Approve
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
