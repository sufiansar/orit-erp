"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { PageContainer } from "@/components/shared/page-container";
import { FilterBar } from "@/components/shared/filter-bar";
import { SearchInput } from "@/components/shared/search-input";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMockStore, mockStore } from "@/lib/mock-api/store";
import { formatCurrency, formatDate } from "@/lib/format";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Globe,
  PlusCircle,
  Building,
  Users,
  ShieldAlert,
  LogIn,
  Power,
  RotateCcw,
  CheckCircle2,
  Lock,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

interface TenantItem {
  id: string;
  name: string;
  slug: string;
  plan: string;
  status: string;
  employeeCount: number;
  branchesCount: number;
  mrr: number;
  country: string;
  createdAt: string;
}

export default function PlatformAdminOrganizationsPage() {
  const router = useRouter();
  const platformData = useMockStore((s) => s.platformAdmin);
  const currentOrg = useMockStore((s) => s.getCurrentOrg());
  const currentUser = useMockStore((s) => s.currentUser);

  const [search, setSearch] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Provision Tenant Dialog
  const [provisionOpen, setProvisionOpen] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");
  const [newOrgSlug, setNewOrgSlug] = useState("");
  const [newOrgCountry, setNewOrgCountry] = useState("Singapore");
  const [newOrgPlan, setNewOrgPlan] = useState("growth");
  const [adminEmail, setAdminEmail] = useState("");

  // Suspend/Reactivate confirmation modal
  const [confirmTarget, setConfirmTarget] = useState<TenantItem | null>(null);

  // Detail Modal
  const [detailTarget, setDetailTarget] = useState<TenantItem | null>(null);

  const tenants = platformData.tenantsList;

  const filteredTenants = useMemo(() => {
    return tenants.filter((t) => {
      if (search) {
        const q = search.toLowerCase();
        if (
          !t.name.toLowerCase().includes(q) &&
          !t.slug.toLowerCase().includes(q) &&
          !t.country.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      if (selectedPlan !== "all" && t.plan !== selectedPlan) {
        return false;
      }
      if (selectedStatus !== "all" && t.status !== selectedStatus) {
        return false;
      }
      return true;
    });
  }, [tenants, search, selectedPlan, selectedStatus]);

  const totalItems = filteredTenants.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginatedTenants = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTenants.slice(start, start + pageSize);
  }, [filteredTenants, currentPage, pageSize]);

  const handleToggleStatus = (tenant: TenantItem) => {
    const next = mockStore.toggleTenantStatus(tenant.id);
    toast.success(
      `Tenant "${tenant.name}" marked as ${next?.toUpperCase()} successfully!`,
      {
        description: `Access credentials and API tokens have been ${
          next === "active" ? "reactivated" : "temporarily suspended"
        }.`,
      }
    );
    setConfirmTarget(null);
  };

  const handleImpersonate = (tenant: TenantItem) => {
    mockStore.setCurrentOrg(tenant.id);
    toast.success(`Switched tenant context to ${tenant.name}`, {
      description: "You are now managing this organization as Platform Admin.",
    });
    router.push("/dashboard");
  };

  const handleProvisionTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim()) {
      toast.error("Organization name is required.");
      return;
    }

    const newTenant: TenantItem = {
      id: `org-${newOrgSlug || newOrgName.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
      name: newOrgName,
      slug: newOrgSlug || newOrgName.toLowerCase().replace(/[^a-z0-9]/g, "-"),
      plan: newOrgPlan,
      status: "active",
      employeeCount: 1,
      branchesCount: 1,
      mrr: newOrgPlan === "enterprise" ? 399 : newOrgPlan === "growth" ? 149 : 49,
      country: newOrgCountry,
      createdAt: new Date().toISOString().split("T")[0],
    };

    mockStore.platformAdmin.tenantsList = [
      newTenant,
      ...mockStore.platformAdmin.tenantsList,
    ];
    mockStore.platformAdmin.kpis.totalTenants += 1;
    mockStore.platformAdmin.kpis.activeTenants += 1;
    mockStore.notify();

    toast.success(`Tenant "${newOrgName}" provisioned successfully!`, {
      description: `Default administrator invite dispatched to ${adminEmail || "admin@" + newTenant.slug + ".com"}.`,
    });

    setProvisionOpen(false);
    setNewOrgName("");
    setNewOrgSlug("");
    setAdminEmail("");
  };

  return (
    <>
      <PageHeader
        title="Tenant Organizations"
        description="Global SaaS subscription registry, multi-tenant lifecycle states, and tenant impersonation."
        breadcrumbs={[
          { label: "Platform Admin", href: "/admin/overview" },
          { label: "Organizations" },
        ]}
        actions={
          <Button
            size="sm"
            onClick={() => setProvisionOpen(true)}
            className="gap-1.5 text-xs font-semibold"
          >
            <PlusCircle className="size-3.5" />
            Provision New Tenant
          </Button>
        }
      />

      <PageContainer maxWidth="full">
        {/* Security Warning Notice */}
        <div className="rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-500/10 p-3.5 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
          <ShieldAlert className="size-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-semibold">
              Privileged Platform Operations (Simulated Demo Sandbox)
            </p>
            <p className="text-amber-800 dark:text-amber-300">
              Actions taken here immediately affect tenant accessibility and active sessions. In production, tenant suspension requires 2-person approval and writes to the immutable cold-storage audit log.
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <FilterBar>
          <div className="flex flex-1 flex-wrap items-center gap-2.5">
            <SearchInput
              value={search}
              onChange={(val) => {
                setSearch(val);
                setCurrentPage(1);
              }}
              placeholder="Search tenant name, slug, country..."
              className="w-full sm:w-72"
            />

            <Select
              value={selectedPlan}
              onValueChange={(v) => {
                setSelectedPlan(v || "all");
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-9 w-36 text-xs">
                <SelectValue placeholder="All Plans" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All Plans</SelectItem>
                <SelectItem value="starter" className="text-xs">Starter ($49)</SelectItem>
                <SelectItem value="growth" className="text-xs">Growth ($149)</SelectItem>
                <SelectItem value="enterprise" className="text-xs">Enterprise ($399)</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={selectedStatus}
              onValueChange={(v) => {
                setSelectedStatus(v || "all");
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-9 w-32 text-xs">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All Status</SelectItem>
                <SelectItem value="active" className="text-xs">Active</SelectItem>
                <SelectItem value="suspended" className="text-xs">Suspended</SelectItem>
                <SelectItem value="trial" className="text-xs">Trial</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="text-xs text-muted-foreground shrink-0">
            Tenants: <strong className="text-foreground">{filteredTenants.length}</strong>
          </div>
        </FilterBar>

        {/* Tenants Table */}
        {filteredTenants.length === 0 ? (
          <EmptyState
            icon={Globe}
            title="No tenants found"
            description="No tenant organizations match the selected search or filter criteria."
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch("");
                  setSelectedPlan("all");
                  setSelectedStatus("all");
                }}
                className="text-xs"
              >
                Reset filters
              </Button>
            }
          />
        ) : (
          <div className="space-y-2">
            <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/40">
                    <TableRow>
                      <TableHead className="text-xs font-semibold text-foreground">Organization</TableHead>
                      <TableHead className="text-xs font-semibold text-foreground">Slug / Domain</TableHead>
                      <TableHead className="text-xs font-semibold text-foreground">Plan</TableHead>
                      <TableHead className="text-xs font-semibold text-foreground">Status</TableHead>
                      <TableHead className="text-xs font-semibold text-foreground">Employees</TableHead>
                      <TableHead className="text-xs font-semibold text-foreground">Branches</TableHead>
                      <TableHead className="text-xs font-semibold text-foreground">MRR</TableHead>
                      <TableHead className="text-xs font-semibold text-foreground">Country</TableHead>
                      <TableHead className="text-xs font-semibold text-foreground">Provisioned</TableHead>
                      <TableHead className="text-xs font-semibold text-foreground text-right pr-4">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedTenants.map((t) => {
                      const isCurrentActive = currentOrg.id === t.id;

                      return (
                        <TableRow key={t.id} className="hover:bg-muted/30 transition-colors">
                          <TableCell className="text-xs font-bold text-foreground">
                            <div className="flex items-center gap-2">
                              <span>{t.name}</span>
                              {isCurrentActive && (
                                <Badge variant="outline" className="text-[9px] bg-primary/10 text-primary border-primary/30">
                                  Current Context
                                </Badge>
                              )}
                            </div>
                          </TableCell>

                          <TableCell className="text-xs font-mono text-muted-foreground">
                            {t.slug}.orbiterp.io
                          </TableCell>

                          <TableCell>
                            <span className="capitalize text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                              {t.plan}
                            </span>
                          </TableCell>

                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`text-[10px] capitalize font-medium ${
                                t.status === "active"
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                                  : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30"
                              }`}
                            >
                              {t.status}
                            </Badge>
                          </TableCell>

                          <TableCell className="text-xs font-medium text-foreground">
                            {t.employeeCount} staff
                          </TableCell>

                          <TableCell className="text-xs text-muted-foreground">
                            {t.branchesCount} {t.branchesCount === 1 ? "office" : "offices"}
                          </TableCell>

                          <TableCell className="text-xs font-mono font-bold text-foreground">
                            {formatCurrency(t.mrr)}/mo
                          </TableCell>

                          <TableCell className="text-xs text-muted-foreground">
                            {t.country}
                          </TableCell>

                          <TableCell className="text-xs text-muted-foreground">
                            {formatDate(t.createdAt)}
                          </TableCell>

                          <TableCell className="text-right pr-4">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleImpersonate(t)}
                                className="h-7 text-xs px-2 gap-1 text-primary hover:bg-primary/10 border-primary/30"
                                title="Switch session to this organization"
                              >
                                <LogIn className="size-3" />
                                Switch
                              </Button>

                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setDetailTarget(t)}
                                className="h-7 text-xs px-2 text-muted-foreground hover:text-foreground"
                              >
                                Details
                              </Button>

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setConfirmTarget(t)}
                                className={`h-7 text-xs px-2 gap-1 ${
                                  t.status === "active"
                                    ? "text-rose-600 border-rose-300 dark:border-rose-800 hover:bg-rose-500/10"
                                    : "text-emerald-600 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-500/10"
                                }`}
                              >
                                <Power className="size-3" />
                                {t.status === "active" ? "Suspend" : "Activate"}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </PageContainer>

      {/* Provision New Tenant Modal */}
      <Dialog open={provisionOpen} onOpenChange={setProvisionOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Globe className="size-4 text-primary" />
              Provision New Tenant Organization
            </DialogTitle>
            <DialogDescription className="text-xs">
              Initialize a dedicated SaaS tenant workspace with automated schema isolation and admin credentials.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleProvisionTenant} className="space-y-3.5 py-2">
            <div className="space-y-1">
              <Label htmlFor="orgName" className="text-xs">
                Organization Name *
              </Label>
              <Input
                id="orgName"
                value={newOrgName}
                onChange={(e) => {
                  setNewOrgName(e.target.value);
                  if (!newOrgSlug) {
                    setNewOrgSlug(
                      e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "-")
                    );
                  }
                }}
                placeholder="Pacific Maritime Logistics"
                className="h-8 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="slug" className="text-xs">
                  Workspace Subdomain *
                </Label>
                <Input
                  id="slug"
                  value={newOrgSlug}
                  onChange={(e) => setNewOrgSlug(e.target.value)}
                  placeholder="pacific-logistics"
                  className="h-8 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="country" className="text-xs">
                  Headquarters Country
                </Label>
                <Input
                  id="country"
                  value={newOrgCountry}
                  onChange={(e) => setNewOrgCountry(e.target.value)}
                  placeholder="Singapore"
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Subscription Tier</Label>
                <Select value={newOrgPlan} onValueChange={(v) => setNewOrgPlan(v || "growth")}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="starter" className="text-xs">Starter ($49/mo)</SelectItem>
                    <SelectItem value="growth" className="text-xs">Growth ($149/mo)</SelectItem>
                    <SelectItem value="enterprise" className="text-xs">Enterprise ($399/mo)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="adminEmail" className="text-xs">
                  Primary Org Admin Email
                </Label>
                <Input
                  id="adminEmail"
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="alina@pacific.com"
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setProvisionOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" className="text-xs font-semibold gap-1.5">
                <PlusCircle className="size-3.5" />
                Provision Workspace
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Suspend / Reactivate Confirmation Modal */}
      <Dialog
        open={Boolean(confirmTarget)}
        onOpenChange={(open) => !open && setConfirmTarget(null)}
      >
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <ShieldAlert className="size-4 text-amber-600 dark:text-amber-400" />
              Confirm Tenant {confirmTarget?.status === "active" ? "Suspension" : "Reactivation"}
            </DialogTitle>
            <DialogDescription className="text-xs leading-relaxed">
              Are you sure you want to {confirmTarget?.status === "active" ? "suspend" : "reactivate"}{" "}
              <strong>{confirmTarget?.name}</strong>?
            </DialogDescription>
          </DialogHeader>

          <div className="p-3 rounded-lg border border-border/80 bg-muted/30 text-xs space-y-1">
            <p>
              <strong>Impact:</strong>{" "}
              {confirmTarget?.status === "active"
                ? "Active employee sessions will be terminated. API access and biometric terminal ingest will be locked."
                : "Restores web access, background workflows, and employee punch recording immediately."}
            </p>
          </div>

          <DialogFooter className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmTarget(null)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              variant={confirmTarget?.status === "active" ? "destructive" : "default"}
              onClick={() => confirmTarget && handleToggleStatus(confirmTarget)}
              className="text-xs font-semibold gap-1.5"
            >
              <Power className="size-3.5" />
              Confirm {confirmTarget?.status === "active" ? "Suspension" : "Activation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Modal */}
      <Dialog
        open={Boolean(detailTarget)}
        onOpenChange={(open) => !open && setDetailTarget(null)}
      >
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Building className="size-4 text-primary" />
              {detailTarget?.name}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Tenant telemetry snapshot and multi-region metrics.
            </DialogDescription>
          </DialogHeader>

          {detailTarget && (
            <div className="space-y-3 py-2 text-xs">
              <div className="grid grid-cols-2 gap-2 p-3 rounded-lg border border-border/70 bg-muted/20">
                <div>
                  <span className="text-[11px] text-muted-foreground block">Plan Tier</span>
                  <span className="font-bold capitalize text-primary">{detailTarget.plan}</span>
                </div>
                <div>
                  <span className="text-[11px] text-muted-foreground block">Status</span>
                  <span className="font-bold capitalize text-foreground">{detailTarget.status}</span>
                </div>
                <div>
                  <span className="text-[11px] text-muted-foreground block">Headcount</span>
                  <span className="font-bold text-foreground">{detailTarget.employeeCount} staff</span>
                </div>
                <div>
                  <span className="text-[11px] text-muted-foreground block">Offices / Branches</span>
                  <span className="font-bold text-foreground">{detailTarget.branchesCount} locations</span>
                </div>
                <div>
                  <span className="text-[11px] text-muted-foreground block">Country</span>
                  <span className="font-bold text-foreground">{detailTarget.country}</span>
                </div>
                <div>
                  <span className="text-[11px] text-muted-foreground block">Monthly Billing</span>
                  <span className="font-bold text-foreground">{formatCurrency(detailTarget.mrr)} / mo</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDetailTarget(null)}
                  className="text-xs"
                >
                  Close
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    handleImpersonate(detailTarget);
                    setDetailTarget(null);
                  }}
                  className="text-xs font-semibold gap-1.5"
                >
                  <LogIn className="size-3.5" />
                  Impersonate Workspace
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
