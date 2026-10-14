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
import { BranchDialog } from "@/components/branches/branch-dialog";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMockStore, mockStore } from "@/lib/mock-api/store";
import { Branch } from "@/types/organization";
import {
  Building2,
  PlusCircle,
  MapPin,
  Clock,
  Users,
  Phone,
  MoreHorizontal,
  Edit2,
  Lock,
  ShieldAlert,
  Globe,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function BranchesPage() {
  const router = useRouter();
  const branches = useMockStore((s) => s.branches);
  const employees = useMockStore((s) => s.employees);
  const currentUser = useMockStore((s) => s.currentUser);

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  const filteredBranches = useMemo(() => {
    if (!search) return branches;
    const q = search.toLowerCase();
    return branches.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.code.toLowerCase().includes(q) ||
        b.location.toLowerCase().includes(q)
    );
  }, [branches, search]);

  const totalEmployeesAcrossBranches = employees.length;

  const handleEdit = (branch: Branch) => {
    if (!mockStore.canManageBranch(branch.id)) {
      toast.error("Branch Permission Denied", {
        description: `As HR for ${currentUser.branchName || "your branch"}, you cannot modify other branch settings.`,
      });
      return;
    }
    setEditingBranch(branch);
    setDialogOpen(true);
  };

  return (
    <>
      <PageHeader
        title="Branch Locations & Offices"
        description="Global organizational branches, office addresses, regional timezones, and site administration."
        breadcrumbs={[{ label: "Organization" }, { label: "Branches" }]}
        actions={
          currentUser.branchScope === "all" ? (
            <Button
              size="sm"
              onClick={() => {
                setEditingBranch(null);
                setDialogOpen(true);
              }}
              className="gap-1.5 text-xs font-semibold"
            >
              <PlusCircle className="size-3.5" />
              Add Branch
            </Button>
          ) : (
            <Badge variant="outline" className="text-xs py-1 px-2.5 bg-muted">
              HR Scoped ({currentUser.branchName || "Assigned Branch"})
            </Badge>
          )
        }
      />

      <PageContainer maxWidth="full">
        {/* Branch Scope HR Notice */}
        {currentUser.branchScope === "assigned_only" && (
          <div className="rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-500/10 p-3.5 mb-6 flex items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200">
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <div>
                <span className="font-bold">Branch HR Administrative Scope: </span>
                <span>
                  You are active as <strong>{currentUser.name}</strong> ({currentUser.branchName}). Your administrative rights apply to Singapore HQ. Other branch offices are view-only.
                </span>
              </div>
            </div>
            <Badge variant="outline" className="text-[10px] bg-background text-amber-700 dark:text-amber-300 border-amber-300 shrink-0 font-medium">
              Singapore HQ Scoped
            </Badge>
          </div>
        )}

        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
          <StatCard
            title="Total Operating Branches"
            value={branches.length}
            icon={Building2}
            trend="up"
            change="Across 4 countries"
          />
          <StatCard
            title="Total Active Personnel"
            value={totalEmployeesAcrossBranches}
            icon={Users}
            trend="up"
            change="Distributed global headcount"
          />
          <StatCard
            title="Active Timezones"
            value="3 Timezones"
            icon={Globe}
            trend="neutral"
            change="SGT, GMT, EST"
          />
        </div>

        {/* Filter Bar */}
        <FilterBar>
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search branches by name, code or city..."
            className="w-full sm:w-80"
          />
          <div className="text-xs text-muted-foreground shrink-0">
            Locations: <strong className="text-foreground">{filteredBranches.length}</strong>
          </div>
        </FilterBar>

        {/* Branches Grid / Cards */}
        {filteredBranches.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No branches found"
            description="No locations match your search query."
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearch("")}
                className="text-xs"
              >
                Clear filter
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2">
            {filteredBranches.map((branch) => {
              const canManage = mockStore.canManageBranch(branch.id);
              const branchStaffCount = employees.filter(
                (e) => e.branchId === branch.id
              ).length;

              return (
                <Card
                  key={branch.id}
                  className={`border transition-all overflow-hidden shadow-2xs ${
                    canManage
                      ? "border-primary/40 bg-gradient-to-br from-card to-primary/5"
                      : "border-border/80 bg-card"
                  }`}
                >
                  <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                          {branch.code}
                        </span>
                        <CardTitle className="text-sm font-bold text-foreground">
                          {branch.name}
                        </CardTitle>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                        <MapPin className="size-3 text-primary shrink-0" />
                        <span className="truncate">{branch.location}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {canManage ? (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          Assigned Branch
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground flex items-center gap-0.5">
                          <Lock className="size-2.5" />
                          View-Only
                        </span>
                      )}
                      <StatusBadge status={branch.status} />
                    </div>
                  </CardHeader>

                  <CardContent className="p-4 pt-2 space-y-3">
                    <div className="grid grid-cols-3 gap-2 py-2 border-y border-border/60 text-xs">
                      <div>
                        <span className="text-[10px] text-muted-foreground block">
                          Headcount
                        </span>
                        <span className="font-bold text-foreground font-mono">
                          {branchStaffCount || branch.employeeCount} staff
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground block">
                          Timezone
                        </span>
                        <span className="font-medium text-foreground truncate block">
                          {branch.timezone.split("/")[1]?.replace("_", " ") || branch.timezone}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground block">
                          Manager
                        </span>
                        <span className="font-medium text-foreground truncate block">
                          {branch.managerName || "Alina Vance"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Phone className="size-3 text-muted-foreground/80" />
                        <span>{branch.phone || "+65 6789 0123"}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/employees?branch=${branch.id}`)}
                          className="h-7 text-xs text-primary hover:bg-primary/10"
                        >
                          View Personnel ({branchStaffCount})
                        </Button>

                        {canManage ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(branch)}
                            className="h-7 text-xs gap-1 border-primary/30"
                          >
                            <Edit2 className="size-3" />
                            Edit
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled
                            className="h-7 text-xs text-muted-foreground cursor-not-allowed gap-1"
                          >
                            <Lock className="size-3" />
                            Locked
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Branch Edit / Add Dialog */}
        <BranchDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          branch={editingBranch}
        />
      </PageContainer>
    </>
  );
}
