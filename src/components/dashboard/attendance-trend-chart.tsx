"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

const TREND_DATA = [
  { day: "Mon", present: 44, late: 2, absent: 2 },
  { day: "Tue", present: 45, late: 1, absent: 2 },
  { day: "Wed", present: 42, late: 4, absent: 2 },
  { day: "Thu", present: 46, late: 1, absent: 1 },
  { day: "Fri", present: 43, late: 3, absent: 2 },
];

const emptySubscribe = () => () => {};

export function AttendanceTrendChart() {
  const mounted = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  if (!mounted) {
    return (
      <Card className="shadow-xs border-border/80">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Weekly Attendance Trend</CardTitle>
          <CardDescription className="text-xs">Daily check-in distribution for the current week</CardDescription>
        </CardHeader>
        <CardContent className="h-[280px] flex items-center justify-center text-xs text-muted-foreground">
          Loading attendance metrics...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-xs border-border/80">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-base font-semibold">Weekly Attendance Trend</CardTitle>
          <CardDescription className="text-xs">
            Present, late check-ins, and leaves over the current work week
          </CardDescription>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-block size-2 rounded-full bg-emerald-500" /> Present
          <span className="inline-block size-2 rounded-full bg-amber-500 ml-2" /> Late
          <span className="inline-block size-2 rounded-full bg-rose-500 ml-2" /> Absent
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={TREND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.6)" />
              <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--popover)",
                  borderColor: "var(--border)",
                  borderRadius: "8px",
                  fontSize: "12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              />
              <Legend wrapperStyle={{ display: "none" }} />
              <Bar dataKey="present" fill="#10b981" radius={[4, 4, 0, 0]} name="Present" stackId="a" />
              <Bar dataKey="late" fill="#f59e0b" radius={[0, 0, 0, 0]} name="Late Check-in" stackId="a" />
              <Bar dataKey="absent" fill="#ef4444" radius={[4, 4, 0, 0]} name="Absent / Leave" stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
