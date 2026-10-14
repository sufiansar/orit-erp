"use client";

import * as React from "react";
import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { PageContainer } from "@/components/shared/page-container";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMockStore, mockStore } from "@/lib/mock-api/store";
import { SubscriptionPlan, Invoice, UsageMetric } from "@/types/billing";
import {
  CreditCard,
  Crown,
  CheckCircle2,
  Download,
  AlertTriangle,
  Building,
  Users,
  HardDrive,
  Fingerprint,
  Zap,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

export default function BillingPage() {
  const currentOrg = useMockStore((s) => s.getCurrentOrg());
  const plans = useMockStore((s) => s.plans);
  const usageMetrics = useMockStore((s) => s.usageMetrics);
  const invoices = useMockStore((s) => s.invoices);
  const [currentPlanId, setCurrentPlanId] = useState<string>("growth");

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    if (plan.id === currentPlanId) {
      toast.info("Active Plan", {
        description: `Your organization is already on the ${plan.name} plan.`,
      });
      return;
    }
    setCurrentPlanId(plan.id);
    toast.success(`Plan updated to ${plan.name} (Simulated)`, {
      description: `New quota: ${plan.limits.employees} seats, ${plan.limits.branches} branches.`,
    });
  };

  const handleDownloadInvoice = (inv: Invoice) => {
    toast.success(`Invoice ${inv.number} downloaded`, {
      description: `Receipt for $${inv.amount}.00 USD (Frontend demo simulation).`,
    });
  };

  return (
    <>
      <PageHeader
        title="Subscription & Resource Usage"
        description="Monitor multi-tenant seat limits, active branch quotas, billing cycles, and invoice receipts."
        breadcrumbs={[{ label: "Administration" }, { label: "Billing & Plans" }]}
      />

      <PageContainer maxWidth="full">
        {/* Current Subscription Hero Banner */}
        <Card className="border-primary/40 bg-gradient-to-br from-card via-card to-primary/5 shadow-xs mb-6 overflow-hidden">
          <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Crown className="size-5 text-primary" />
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-primary">
                  Current Tenant Plan
                </span>
                <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 border-emerald-300">
                  Active & Good Standing
                </Badge>
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                OrbitERP Growth Plan — $199 / Month
              </h2>
              <p className="text-xs text-muted-foreground">
                Next automatic renewal on <strong>November 1, 2026</strong> via Visa ending in 4242.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  toast.info("Payment Method Details", {
                    description: "Visa ending in 4242 • Expires 12/28",
                  })
                }
                className="text-xs gap-1.5 h-9"
              >
                <CreditCard className="size-3.5" />
                Manage Card
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Resource Usage Meters */}
        <div className="space-y-2 mb-8">
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wider px-1">
            Tenant Resource Utilization
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {usageMetrics.map((meter) => {
              const pct = Math.round((meter.used / meter.limit) * 100);
              const isHigh = pct >= 80;

              return (
                <Card key={meter.key} className="border-border/80 bg-card p-4 shadow-2xs">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-medium text-foreground">{meter.label}</span>
                    <span className="font-mono text-[11px] font-bold text-muted-foreground">
                      {meter.used} / {meter.limit} {meter.unit}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isHigh ? "bg-amber-500" : "bg-primary"
                      }`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-2">
                    <span>{pct}% Quota Utilized</span>
                    {isHigh && (
                      <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-0.5">
                        <AlertTriangle className="size-3" />
                        Near Limit
                      </span>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Plan Tiers Grid */}
        <div className="space-y-3 mb-8">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
              Available SaaS Subscription Tiers
            </h3>
            <span className="text-xs text-muted-foreground">Billed Annually (20% Discount Applied)</span>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {plans.map((p) => {
              const isCurrent = p.id === currentPlanId;
              return (
                <Card
                  key={p.id}
                  className={`border transition-all flex flex-col justify-between ${
                    isCurrent
                      ? "border-primary bg-primary/5 shadow-md shadow-primary/10 ring-1 ring-primary"
                      : "border-border/80 bg-card hover:border-border"
                  }`}
                >
                  <CardHeader className="p-5 pb-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-base text-foreground">{p.name}</span>
                      {isCurrent && (
                        <Badge className="text-[10px] bg-primary text-primary-foreground font-semibold">
                          Active Plan
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{p.tagline}</p>
                    <div className="mt-3 flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold text-foreground font-mono">
                        ${p.priceMonthly}
                      </span>
                      <span className="text-xs text-muted-foreground">/ month</span>
                    </div>
                  </CardHeader>

                  <CardContent className="p-5 pt-2 space-y-4">
                    <div className="space-y-1.5 py-3 border-y border-border/60 text-xs">
                      <div className="flex justify-between text-muted-foreground">
                        <span>Staff Seats</span>
                        <strong className="text-foreground">{p.limits.employees} Users</strong>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Physical Branches</span>
                        <strong className="text-foreground">{p.limits.branches} Locations</strong>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Cloud Storage</span>
                        <strong className="text-foreground">{p.limits.storageGb} GB</strong>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Biometric Terminals</span>
                        <strong className="text-foreground">{p.limits.devices} Devices</strong>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleSelectPlan(p)}
                      variant={isCurrent ? "outline" : "default"}
                      size="sm"
                      className="w-full text-xs font-semibold h-8"
                    >
                      {isCurrent ? "Current Subscription" : `Select ${p.name}`}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Invoice History */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wider px-1">
            Billing History & Receipts
          </h3>
          <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-xs">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="text-xs font-semibold text-foreground">Invoice ID</TableHead>
                  <TableHead className="text-xs font-semibold text-foreground">Billing Date</TableHead>
                  <TableHead className="text-xs font-semibold text-foreground">Plan Coverage</TableHead>
                  <TableHead className="text-xs font-semibold text-foreground">Amount</TableHead>
                  <TableHead className="text-xs font-semibold text-foreground">Status</TableHead>
                  <TableHead className="text-xs font-semibold text-foreground text-right pr-4">Receipt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((inv) => (
                  <TableRow key={inv.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-mono text-xs font-bold text-foreground">
                      {inv.number}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {inv.date}
                    </TableCell>
                    <TableCell className="text-xs font-medium text-foreground">
                      {inv.planName}
                    </TableCell>
                    <TableCell className="text-xs font-mono font-bold text-foreground">
                      ${inv.amount}.00 USD
                    </TableCell>
                    <TableCell>
                      <StatusBadge status="active" />
                    </TableCell>
                    <TableCell className="text-right pr-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownloadInvoice(inv)}
                        className="h-7 text-xs px-2 gap-1 text-primary hover:bg-primary/10"
                      >
                        <Download className="size-3" />
                        PDF
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </PageContainer>
    </>
  );
}
