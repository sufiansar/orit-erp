"use client";

import * as React from "react";
import Link from "next/link";
import { StatCard } from "@/components/shared/stat-card";
import { SectionCard } from "@/components/shared/section-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMockStore } from "@/lib/mock-api/store";
import { formatCurrency, formatDate } from "@/lib/format";
import {
  Globe,
  Building,
  DollarSign,
  Users,
  Activity,
  ShieldCheck,
  Server,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const REVENUE_TREND = [
  { month: "May", mrr: 36200, tenants: 94 },
  { month: "Jun", mrr: 39100, tenants: 101 },
  { month: "Jul", mrr: 41800, tenants: 108 },
  { month: "Aug", mrr: 44300, tenants: 116 },
  { month: "Sep", mrr: 46100, tenants: 122 },
  { month: "Oct", mrr: 48250, tenants: 128 },
];

export function PlatformAdminDashboard() {
  const platformData = useMockStore((s) => s.platformAdmin);
  const currentUser = useMockStore((s) => s.currentUser);

  const kpis = platformData.kpis;
  const recentEvents = platformData.recentEvents;

  return (
    <div className="space-y-6">
      {/* Platform Owner Hero Banner */}
      <div className="rounded-2xl border border-purple-300 dark:border-purple-800 bg-gradient-to-r from-purple-500/10 via-card to-card p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30">
              SaaS Super Administrator
            </span>
            <Badge variant="outline" className="text-xs">
              Global Platform Scope
            </Badge>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            SaaS Platform Overview
          </h2>
          <p className="text-xs text-muted-foreground">
            Logged in as <strong>{currentUser.name}</strong> · Global multi-tenant cloud operations and infrastructure telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/admin/organizations">
            <Button size="sm" className="gap-1.5 text-xs font-semibold">
              <Globe className="size-3.5" />
              Manage Tenants ({kpis.totalTenants})
            </Button>
          </Link>
        </div>
      </div>

      {/* Global KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Monthly Recurring Revenue"
          value={formatCurrency(kpis.mrr)}
          icon={DollarSign}
          trend="up"
          change="+4.6% this month"
        />
        <StatCard
          title="Total Active Tenants"
          value={`${kpis.activeTenants} / ${kpis.totalTenants}`}
          icon={Building}
          trend="up"
          change={`${kpis.trialTenants} in free trial`}
        />
        <StatCard
          title="Global Managed Staff"
          value={kpis.totalEmployeesServed.toLocaleString()}
          icon={Users}
          trend="up"
          change="Across 18 countries"
        />
        <StatCard
          title="System Health & Uptime"
          value={kpis.systemUptime}
          icon={Activity}
          trend="neutral"
          change="All regions operational"
        />
      </div>

      {/* Charts & System Events */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <SectionCard
            title="MRR & Tenant Growth Trajectory"
            description="Historical monthly recurring revenue and subscriber count"
          >
            <div className="h-[280px] w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={REVENUE_TREND}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="mrrGradPlatform" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary, #4f46e5)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--color-primary, #4f46e5)" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                    formatter={(val) => [`$${Number(val).toLocaleString()}`, "Monthly Revenue"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="mrr"
                    stroke="var(--color-primary, #4f46e5)"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#mrrGradPlatform)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
        </div>

        <div className="lg:col-span-4">
          <SectionCard
            title="Global Platform Events"
            description="Real-time tenant lifecycle notifications"
            action={
              <Link
                href="/admin/organizations"
                className="text-xs text-primary font-medium hover:underline inline-flex items-center gap-1"
              >
                View Tenants
                <ArrowRight className="size-3" />
              </Link>
            }
          >
            <div className="space-y-3">
              {recentEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="p-3 rounded-lg border border-border/60 bg-muted/20 hover:bg-muted/40 transition-colors text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground flex items-center gap-1.5">
                      {evt.severity === "success" && (
                        <span className="size-2 rounded-full bg-emerald-500" />
                      )}
                      {evt.severity === "warning" && (
                        <span className="size-2 rounded-full bg-amber-500" />
                      )}
                      {evt.severity === "info" && (
                        <span className="size-2 rounded-full bg-primary" />
                      )}
                      {evt.title}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {formatDate(evt.timestamp.split("T")[0])}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {evt.description}
                  </p>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
