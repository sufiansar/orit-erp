"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { PageContainer } from "@/components/shared/page-container";
import { FilterBar } from "@/components/shared/filter-bar";
import { SearchInput } from "@/components/shared/search-input";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMockStore, mockStore } from "@/lib/mock-api/store";
import { SaasModule, ModuleTier } from "@/types/module";
import {
  Boxes,
  CheckCircle2,
  Lock,
  Sparkles,
  Zap,
  ShieldCheck,
  CreditCard,
  Crown,
  Layers,
  ArrowUpRight,
} from "lucide-react";
import { toast } from "sonner";

export default function ModulesPage() {
  const modules = useMockStore((s) => s.modules);
  const currentOrg = useMockStore((s) => s.getCurrentOrg());
  const currentUser = useMockStore((s) => s.currentUser);

  const [search, setSearch] = useState("");
  const [selectedTier, setSelectedTier] = useState<string>("all");

  const filteredModules = useMemo(() => {
    return modules.filter((mod) => {
      if (search) {
        const q = search.toLowerCase();
        const matches =
          mod.name.toLowerCase().includes(q) ||
          mod.description.toLowerCase().includes(q) ||
          mod.features.some((f) => f.toLowerCase().includes(q));
        if (!matches) return false;
      }

      if (selectedTier !== "all" && mod.tier !== selectedTier) {
        return false;
      }

      return true;
    });
  }, [modules, search, selectedTier]);

  const handleToggleModule = (mod: SaasModule) => {
    if (mod.isCore) {
      toast.info("Core Module Protected", {
        description: `${mod.name} is a fundamental pillar of OrbitERP and cannot be disabled.`,
      });
      return;
    }

    if (currentUser.branchScope !== "all") {
      toast.error("Permission Denied", {
        description: "Only Super Organization Admins can toggle tenant SaaS modules.",
      });
      return;
    }

    const nextState = !mod.isEnabled;
    mockStore.modules = mockStore.modules.map((m) =>
      m.key === mod.key ? { ...m, isEnabled: nextState } : m
    );
    mockStore.notify();

    if (nextState) {
      toast.success(`Module "${mod.name}" activated!`, {
        description: "Navigation items and tenant API endpoints are now enabled.",
      });
    } else {
      toast.info(`Module "${mod.name}" deactivated`, {
        description: "Module features have been paused for this workspace.",
      });
    }
  };

  const activeCount = modules.filter((m) => m.isEnabled).length;

  return (
    <>
      <PageHeader
        title="SaaS Module Catalog"
        description="Enable or disable business capability modules, feature bundles, and tenant add-ons."
        breadcrumbs={[{ label: "Configuration" }, { label: "Modules" }]}
      />

      <PageContainer maxWidth="full">
        {/* Top Summary */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
          <StatCard
            title="Active Modules"
            value={`${activeCount} / ${modules.length}`}
            icon={Boxes}
            trend="up"
            change="Included in Growth Plan"
          />
          <StatCard
            title="Tenant Subscription Plan"
            value="Growth Tier"
            icon={Crown}
            trend="neutral"
            change="Supports up to 50 staff"
          />
          <StatCard
            title="Core ERP Systems"
            value="3 Protected"
            icon={ShieldCheck}
            trend="neutral"
            change="HR, Attendance, Directory"
          />
        </div>

        {/* Filter Bar */}
        <FilterBar>
          <div className="flex flex-1 flex-wrap items-center gap-2.5">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search features or modules..."
              className="w-full sm:w-72"
            />

            <Select value={selectedTier} onValueChange={(val) => setSelectedTier(val || "all")}>
              <SelectTrigger className="h-9 w-40 text-xs">
                <SelectValue placeholder="All Tiers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All Tiers</SelectItem>
                <SelectItem value="core" className="text-xs">Core Modules</SelectItem>
                <SelectItem value="standard" className="text-xs">Standard Included</SelectItem>
                <SelectItem value="add_on" className="text-xs">Optional Add-ons</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="text-xs text-muted-foreground shrink-0">
            Catalog: <strong className="text-foreground">{filteredModules.length}</strong>
          </div>
        </FilterBar>

        {/* Modules Grid */}
        {filteredModules.length === 0 ? (
          <EmptyState
            icon={Boxes}
            title="No modules match your query"
            description="Try adjusting your search terms or filter selection."
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch("");
                  setSelectedTier("all");
                }}
                className="text-xs"
              >
                Reset filters
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredModules.map((mod) => (
              <Card
                key={mod.key}
                className={`border transition-all shadow-2xs flex flex-col justify-between ${
                  mod.isEnabled
                    ? "border-primary/40 bg-card"
                    : "border-border/60 bg-muted/20 opacity-80"
                }`}
              >
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      {mod.tier.replace("_", " ")}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground font-medium">
                        {mod.isEnabled ? "Active" : "Inactive"}
                      </span>
                      <Switch
                        checked={mod.isEnabled}
                        disabled={mod.isCore}
                        onCheckedChange={() => handleToggleModule(mod)}
                      />
                    </div>
                  </div>

                  <CardTitle className="text-base font-bold text-foreground mt-2">
                    {mod.name}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                    {mod.description}
                  </p>
                </CardHeader>

                <CardContent className="p-4 pt-2 space-y-3">
                  {/* Feature Bullets */}
                  <div className="space-y-1.5 pt-2 border-t border-border/60">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                      Capabilities Included
                    </span>
                    <ul className="space-y-1">
                      {mod.features.slice(0, 3).map((feat) => (
                        <li
                          key={feat}
                          className="text-xs text-foreground flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="size-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span className="truncate">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs">
                    <span className="text-[11px] text-muted-foreground">
                      Required Plan:{" "}
                      <strong className="text-foreground capitalize font-medium">
                        {mod.planRequirement}
                      </strong>
                    </span>

                    {mod.monthlyPriceAddon ? (
                      <span className="font-mono text-xs font-bold text-primary">
                        +${mod.monthlyPriceAddon}/mo
                      </span>
                    ) : (
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                        Included
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </PageContainer>
    </>
  );
}
