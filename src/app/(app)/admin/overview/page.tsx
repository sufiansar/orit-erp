"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { PageContainer } from "@/components/shared/page-container";
import { StatCard } from "@/components/shared/stat-card";
import { SectionCard } from "@/components/shared/section-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMockStore } from "@/lib/mock-api/store";
import { formatCurrency, formatDate } from "@/lib/format";
import Link from "next/link";
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
  AlertCircle,
  Clock,
  Sparkles,
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

export default function PlatformAdminOverviewPage() {
  const platformData = useMockStore((s) => s.platformAdmin);
  const currentUser = useMockStore((s) => s.currentUser);

  const kpis = platformData.kpis;
  const recentEvents = platformData.recentEvents;

  return (
    <>
      <PageHeader
        title="Platform Administration"
        description="Global multi-tenant telemetry, monthly recurring revenue, infrastructure uptime, and tenant activity."
        breadcrumbs={[
          { label: "Platform Admin" },
          { label: "Overview" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="bg-primary/10 text-primary border-primary/20 text-xs py-1 px-2.5 font-semibold gap-1.5"
            >
              <ShieldCheck className="size-3.5" />
              SaaS Owner Level
            </Badge>
            <Link href="/admin/organizations">
              <Button size="sm" className="gap-1.5 text-xs font-semibold">
                <Globe className="size-3.5" />
                Manage Tenants ({kpis.totalTenants})
              </Button>
            </Link>
          </div>
        }
      />

      <PageContainer maxWidth="full">
        {/* Notice Banner */}
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-foreground">
          <div className="flex items-start gap-3">
            <Server className="size-4 shrink-0 text-primary mt-0.5" />
            <div>
              <p className="font-semibold text-sm">
                OrbitERP Global Cloud Infrastructure — Production Cluster (ap-southeast-1)
              </p>
              <p className="text-muted-foreground mt-0.5">
                Logged in as <strong>{currentUser.name}</strong> ({currentUser.roleName}). All systems operational. 85 biometric hardware edge bridges active across {kpis.activeTenants} organizations.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs border border-emerald-500/20">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              API Gateway 99.98%
            </span>
          </div>
        </div>

        {/* Global KPIs */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Monthly Recurring Revenue"
            value={formatCurrency(kpis.mrr)}
            icon={DollarSign}
            trend="up"
            change="+4.6% from last month"
          />
          <StatCard
            title="Total Active Tenants"
            value={`${kpis.activeTenants} / ${kpis.totalTenants}`}
            icon={Building}
            trend="up"
            change={`${kpis.trialTenants} in 14-day trial`}
          />
          <StatCard
            title="Global Managed Staff"
            value={kpis.totalEmployeesServed.toLocaleString()}
            icon={Users}
            trend="up"
            change="Across 18 global countries"
          />
          <StatCard
            title="Cloud Health & Uptime"
            value={kpis.systemUptime}
            icon={Activity}
            trend="neutral"
            change="Zero SLA breaches in 90 days"
          />
        </div>

        {/* Charts & System Events */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Revenue Chart (8 cols) */}
          <div className="lg:col-span-8">
            <SectionCard
              title="MRR & Tenant Expansion Trend"
              description="Historical monthly recurring revenue trajectory and active organizations"
              action={
                <Badge variant="outline" className="text-xs bg-muted/60">
                  Last 6 Months
                </Badge>
              }
            >
              <div className="h-[280px] w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={REVENUE_TREND}
                    margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-primary, #4f46e5)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--color-primary, #4f46e5)" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                    <XAxis
                      dataKey="month"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={11}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={11}
                      tickLine={false}
                      tickFormatter={(v) => `$${v / 1000}k`}
                    />
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
                      fill="url(#mrrGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border/60 text-center">
                <div>
                  <span className="text-[11px] text-muted-foreground block">Avg Revenue Per Tenant</span>
                  <p className="text-sm font-bold text-foreground mt-0.5">$377 / mo</p>
                </div>
                <div>
                  <span className="text-[11px] text-muted-foreground block">Net Revenue Retention</span>
                  <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">108.4%</p>
                </div>
                <div>
                  <span className="text-[11px] text-muted-foreground block">Monthly Churn Rate</span>
                  <p className="text-sm font-bold text-foreground mt-0.5">0.8%</p>
                </div>
              </div>
            </SectionCard>
          </div>

          {/* System Telemetry & Recent Events (4 cols) */}
          <div className="lg:col-span-4">
            <SectionCard
              title="Global Platform Events"
              description="Real-time tenant lifecycle notifications"
              action={
                <Link
                  href="/admin/organizations"
                  className="text-xs text-primary font-medium hover:underline inline-flex items-center gap-1"
                >
                  View All
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
      </PageContainer>
    </>
  );
}
