"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useMockStore } from "@/lib/mock-api/store";

const COLORS = ["#4f46e5", "#06b6d4", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6"];
const emptySubscribe = () => () => {};

export function DepartmentDistributionChart() {
  const mounted = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const departments = useMockStore((s) => s.departments);

  const chartData = departments.map((d) => ({
    name: d.code,
    fullName: d.name,
    employees: d.employeeCount,
  }));

  if (!mounted) {
    return (
      <Card className="shadow-xs border-border/80">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Department Headcount</CardTitle>
          <CardDescription className="text-xs">Staff allocation across active departments</CardDescription>
        </CardHeader>
        <CardContent className="h-[280px] flex items-center justify-center text-xs text-muted-foreground">
          Loading department data...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-xs border-border/80">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Department Headcount</CardTitle>
        <CardDescription className="text-xs">
          Staff allocation across active functional teams
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 10, right: 20, left: 10, bottom: 0 }}
            >
              <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
              <YAxis
                type="category"
                dataKey="name"
                tickLine={false}
                axisLine={false}
                width={50}
                tick={{ fontSize: 11, fill: "var(--foreground)", fontWeight: 500 }}
              />
              <Tooltip
                formatter={(val, name, item) => [
                  `${val} employees`,
                  item.payload.fullName,
                ]}
                contentStyle={{
                  backgroundColor: "var(--popover)",
                  borderColor: "var(--border)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="employees" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
