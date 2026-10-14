"use client";

import * as React from "react";
import {
  ChevronsUpDown,
  Check,
  Building2,
  PlusCircle,
  Sparkles,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useMockStore, mockStore } from "@/lib/mock-api/store";
import { toast } from "sonner";

export function OrganizationSwitcher({
  collapsed = false,
}: {
  collapsed?: boolean;
}) {
  const currentOrg = useMockStore((s) => s.getCurrentOrg());
  const organizations = useMockStore((s) => s.organizations);

  const handleSelect = (orgId: string) => {
    mockStore.setCurrentOrg(orgId);
    const org = organizations.find((o) => o.id === orgId);
    toast.success(`Switched tenant workspace to ${org?.name}`, {
      description: `Active timezone: ${org?.timezone} · Plan: ${org?.plan.toUpperCase()}`,
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-sidebar-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring group cursor-pointer"
      >
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold shadow-xs shrink-0">
          <Building2 className="size-4" />
        </div>

        {!collapsed && (
          <div className="flex flex-1 flex-col overflow-hidden leading-tight">
            <span className="truncate font-semibold text-sm text-sidebar-foreground">
              {currentOrg.name}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="truncate text-xs text-muted-foreground">
                {currentOrg.slug}
              </span>
              <span className="text-muted-foreground/40 text-[10px]">·</span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-primary">
                {currentOrg.plan}
              </span>
            </div>
          </div>
        )}

        {!collapsed && (
          <ChevronsUpDown className="size-4 text-muted-foreground shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        className="w-64 p-1.5 shadow-md border-border/80"
      >
        <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground px-2 py-1.5">
          Select Tenant Workspace
        </DropdownMenuLabel>

        {organizations.map((org) => {
          const isSelected = org.id === currentOrg.id;
          return (
            <DropdownMenuItem
              key={org.id}
              onClick={() => handleSelect(org.id)}
              className="flex items-center justify-between py-2 px-2.5 cursor-pointer rounded-md focus:bg-accent"
            >
              <div className="flex items-center gap-2.5">
                <div className="size-7 rounded bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                  {org.name.slice(0, 1)}
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-xs text-foreground">
                    {org.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {org.branchesCount} branches · {org.employeeCount} staff
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="text-[10px] uppercase px-1 py-0 font-medium"
                >
                  {org.plan}
                </Badge>
                {isSelected && <Check className="size-4 text-primary shrink-0" />}
              </div>
            </DropdownMenuItem>
          );
        })}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => {
            toast.info("Create Organization Dialog", {
              description: "Simulated multi-tenant onboarding flow.",
            });
          }}
          className="py-2 px-2.5 text-xs text-primary cursor-pointer font-medium gap-2 focus:bg-primary/5"
        >
          <PlusCircle className="size-4" />
          Create New Organization
        </DropdownMenuItem>

        <div className="px-2 py-1.5 text-[10px] text-muted-foreground flex items-center gap-1 bg-muted/40 rounded mt-1">
          <Sparkles className="size-3 text-primary shrink-0" />
          <span>Multi-tenant simulation data</span>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
