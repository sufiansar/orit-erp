"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { CheckCircle2, AlertCircle, Fingerprint, GitBranch } from "lucide-react";

interface ActivityItem {
  id: string;
  type: "punch" | "late" | "device" | "workflow";
  title: string;
  description: string;
  time: string;
}

const ACTIVITIES: ActivityItem[] = [
  {
    id: "act-1",
    type: "punch",
    title: "Biometric Punch Recorded",
    description: "David Chen clocked in at Singapore HQ (08:55 AM).",
    time: "12m ago",
  },
  {
    id: "act-2",
    type: "late",
    title: "Grace Period Exceeded",
    description: "Sophia Martinez checked in late at New York Hub (09:22 AM).",
    time: "45m ago",
  },
  {
    id: "act-3",
    type: "device",
    title: "Hardware Terminal Sync",
    description: "Hikvision MinMoe in London synchronized 18 attendance records.",
    time: "1h ago",
  },
  {
    id: "act-4",
    type: "workflow",
    title: "Leave Workflow Triggered",
    description: "Multi-Tier Approval step assigned to Elena Rostova.",
    time: "2h ago",
  },
];

export function RecentActivityList() {
  return (
    <Card className="shadow-xs border-border/80 flex flex-col">
      <CardHeader className="pb-3 border-b border-border/60">
        <CardTitle className="text-base font-semibold">Live Activity Stream</CardTitle>
        <CardDescription className="text-xs">
          Real-time biometric logs and automated system events
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 flex-1">
        <div className="space-y-4">
          {ACTIVITIES.map((act) => (
            <div key={act.id} className="flex items-start gap-3">
              <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                {act.type === "punch" && <CheckCircle2 className="size-4 text-emerald-600" />}
                {act.type === "late" && <AlertCircle className="size-4 text-amber-600" />}
                {act.type === "device" && <Fingerprint className="size-4 text-primary" />}
                {act.type === "workflow" && <GitBranch className="size-4 text-indigo-600" />}
              </div>
              <div className="flex-1 space-y-0.5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-foreground">{act.title}</p>
                  <span className="text-[10px] text-muted-foreground">{act.time}</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {act.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
