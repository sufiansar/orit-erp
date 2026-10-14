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
import { Pagination } from "@/components/shared/pagination";
import { LeaveRequestDialog } from "@/components/leave/leave-request-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMockStore, mockStore } from "@/lib/mock-api/store";
import { LeaveRequest, LeaveStatus, LeaveType } from "@/types/leave";
import { formatDate } from "@/lib/format";
import {
  CalendarDays,
  PlusCircle,
  CheckCircle,
  XCircle,
  Clock,
  HeartPulse,
  Palmtree,
  CalendarOff,
  ShieldAlert,
  Lock,
  MessageSquare,
  Building,
} from "lucide-react";
import { toast } from "sonner";

export default function LeaveManagementPage() {
  const leaveRequests = useMockStore((s) => s.leaveRequests);
  const leaveBalances = useMockStore((s) => s.leaveBalances);
  const branches = useMockStore((s) => s.branches);
  const currentUser = useMockStore((s) => s.currentUser);

  // Filter States
  const [activeTab, setActiveTab] = useState<string>("pending");
  const [search, setSearch] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [selectedType, setSelectedType] = useState("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Dialog States
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [reviewDialogTarget, setReviewDialogTarget] = useState<{
    open: boolean;
    request: LeaveRequest | null;
    action: "approve" | "reject";
    comment: string;
  }>({
    open: false,
    request: null,
    action: "approve",
    comment: "",
  });

  // Filtered dataset
  const filteredRequests = useMemo(() => {
    return leaveRequests.filter((req) => {
      // Tab filter
      if (activeTab === "pending" && req.status !== "pending") return false;
      if (activeTab === "approved" && req.status !== "approved") return false;
      if (activeTab === "rejected" && req.status !== "rejected") return false;

      // Search query
      if (search) {
        const q = search.toLowerCase();
        const matches =
          req.employeeName.toLowerCase().includes(q) ||
          req.employeeCode.toLowerCase().includes(q) ||
          req.reason.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Branch filter
      if (selectedBranch !== "all" && req.branchId !== selectedBranch) {
        return false;
      }

      // Leave type filter
      if (selectedType !== "all" && req.leaveType !== selectedType) {
        return false;
      }

      return true;
    });
  }, [leaveRequests, activeTab, search, selectedBranch, selectedType]);

  const totalItems = filteredRequests.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginatedRequests = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRequests.slice(start, start + pageSize);
  }, [filteredRequests, currentPage, pageSize]);

  // Counts for tabs
  const pendingCount = leaveRequests.filter((l) => l.status === "pending").length;
  const approvedCount = leaveRequests.filter((l) => l.status === "approved").length;
  const rejectedCount = leaveRequests.filter((l) => l.status === "rejected").length;

  const handleOpenReview = (
    req: LeaveRequest,
    action: "approve" | "reject"
  ) => {
    if (!mockStore.canManageBranch(req.branchId)) {
      toast.error("Branch Permission Denied", {
        description: `As HR for ${currentUser.branchName || "your branch"}, you cannot ${action} leave requests for ${req.employeeName} (${req.branchName}).`,
      });
      return;
    }

    setReviewDialogTarget({
      open: true,
      request: req,
      action,
      comment:
        action === "approve"
          ? "Approved. Work handoff documented."
          : "Rejected due to critical sprint milestone.",
    });
  };

  const handleConfirmReview = () => {
    const { request, action, comment } = reviewDialogTarget;
    if (!request) return;

    try {
      mockStore.updateLeaveStatus(
        request.id,
        action === "approve" ? "approved" : "rejected",
        currentUser.name,
        comment
      );
      toast.success(
        `Leave request for ${request.employeeName} ${
          action === "approve" ? "approved" : "rejected"
        }`,
        {
          description: `Reviewed by ${currentUser.name} (${currentUser.roleName})`,
        }
      );
      setReviewDialogTarget({
        open: false,
        request: null,
        action: "approve",
        comment: "",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Review action failed";
      toast.error("Action Denied", { description: msg });
    }
  };

  const getLeaveTypeBadge = (type: LeaveType) => {
    switch (type) {
      case "annual":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
            <Palmtree className="size-3" />
            Annual Leave
          </span>
        );
      case "sick":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <HeartPulse className="size-3" />
            Sick Leave
          </span>
        );
      case "casual":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CalendarDays className="size-3" />
            Casual Leave
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <CalendarOff className="size-3" />
            {type.toUpperCase()}
          </span>
        );
    }
  };

  return (
    <>
      <PageHeader
        title="Leave Management & Approvals"
        description="Review time-off requests, manage vacation balances, and enforce branch-scoped approval workflows."
        breadcrumbs={[{ label: "Core HR" }, { label: "Leave Management" }]}
        actions={
          <Button
            size="sm"
            onClick={() => setApplyDialogOpen(true)}
            className="gap-1.5 text-xs font-semibold"
          >
            <PlusCircle className="size-3.5" />
            Apply for Leave
          </Button>
        }
      />

      <PageContainer maxWidth="full">
        {/* Branch Scope HR Notice Banner */}
        {currentUser.branchScope === "assigned_only" && (
          <div className="rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-500/10 p-3.5 mb-6 flex items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <div>
                <span className="font-bold">Branch HR Administrative Scope: </span>
                <span>
                  You are active as <strong>{currentUser.name}</strong> ({currentUser.branchName}). You can approve or reject leave requests only for {currentUser.branchName} staff. Requests from other branches are locked.
                </span>
              </div>
            </div>
            <Badge variant="outline" className="text-[10px] bg-background text-amber-700 dark:text-amber-300 border-amber-300 shrink-0 font-medium">
              Singapore HQ Scoped
            </Badge>
          </div>
        )}

        {/* Leave Balances KPI Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          <StatCard
            title="Casual Leave (CL)"
            value="10 / 12 Days"
            icon={CalendarDays}
            trend="neutral"
            change="2 days used this year"
          />
          <StatCard
            title="Sick Leave (SL)"
            value="8 / 10 Days"
            icon={HeartPulse}
            trend="neutral"
            change="Medical cert required >2d"
          />
          <StatCard
            title="Annual Vacation (AL)"
            value="15 / 20 Days"
            icon={Palmtree}
            trend="up"
            change="5 days planned in Q4"
          />
          <StatCard
            title="Pending Requests"
            value={pendingCount}
            icon={Clock}
            trend={pendingCount > 0 ? "down" : "neutral"}
            change={pendingCount > 0 ? "Requires review" : "Inbox cleared"}
          />
        </div>

        {/* Navigation Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(val) => {
            setActiveTab(val);
            setCurrentPage(1);
          }}
          className="space-y-4"
        >
          <TabsList className="h-10 p-1 bg-muted/60 border border-border/80">
            <TabsTrigger value="pending" className="text-xs font-semibold gap-1.5">
              <Clock className="size-3.5" />
              Pending Approvals
              {pendingCount > 0 && (
                <span className="size-4 rounded-full bg-amber-500 text-white text-[9px] flex items-center justify-center font-bold">
                  {pendingCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="all" className="text-xs font-semibold gap-1.5">
              <CalendarDays className="size-3.5" />
              All Requests ({leaveRequests.length})
            </TabsTrigger>
            <TabsTrigger value="approved" className="text-xs font-semibold gap-1.5">
              <CheckCircle className="size-3.5 text-emerald-600" />
              Approved ({approvedCount})
            </TabsTrigger>
            <TabsTrigger value="rejected" className="text-xs font-semibold gap-1.5">
              <XCircle className="size-3.5 text-rose-600" />
              Rejected ({rejectedCount})
            </TabsTrigger>
          </TabsList>

          {/* Filter Bar */}
          <FilterBar>
            <div className="flex flex-1 flex-wrap items-center gap-2.5">
              <SearchInput
                value={search}
                onChange={(val) => {
                  setSearch(val);
                  setCurrentPage(1);
                }}
                placeholder="Search applicant or reason..."
                className="w-full sm:w-64"
              />

              <Select
                value={selectedBranch}
                onValueChange={(v) => {
                  setSelectedBranch(v || "all");
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="h-9 w-40 text-xs">
                  <SelectValue placeholder="All Branches" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">All Branches</SelectItem>
                  {branches.map((b) => (
                    <SelectItem key={b.id} value={b.id} className="text-xs">
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedType}
                onValueChange={(v) => {
                  setSelectedType(v || "all");
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="h-9 w-36 text-xs">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">All Types</SelectItem>
                  <SelectItem value="casual" className="text-xs">Casual (CL)</SelectItem>
                  <SelectItem value="sick" className="text-xs">Sick (SL)</SelectItem>
                  <SelectItem value="annual" className="text-xs">Annual (AL)</SelectItem>
                  <SelectItem value="unpaid" className="text-xs">Unpaid (LWP)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="text-xs text-muted-foreground shrink-0">
              Filtered: <strong className="text-foreground">{filteredRequests.length}</strong>
            </div>
          </FilterBar>

          {/* Requests Table */}
          {filteredRequests.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title="No leave requests found"
              description="There are no leave requests matching the active filter or tab criteria."
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearch("");
                    setSelectedBranch("all");
                    setSelectedType("all");
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
                        <TableHead className="text-xs font-semibold text-foreground">Employee</TableHead>
                        <TableHead className="text-xs font-semibold text-foreground">Code</TableHead>
                        <TableHead className="text-xs font-semibold text-foreground">Branch</TableHead>
                        <TableHead className="text-xs font-semibold text-foreground">Leave Type</TableHead>
                        <TableHead className="text-xs font-semibold text-foreground">Period</TableHead>
                        <TableHead className="text-xs font-semibold text-foreground">Days</TableHead>
                        <TableHead className="text-xs font-semibold text-foreground">Reason & Notes</TableHead>
                        <TableHead className="text-xs font-semibold text-foreground">Status</TableHead>
                        <TableHead className="text-xs font-semibold text-foreground text-right pr-4">Review Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedRequests.map((req) => {
                        const canManageThis = mockStore.canManageBranch(req.branchId);

                        return (
                          <TableRow key={req.id} className="hover:bg-muted/30 transition-colors">
                            <TableCell className="text-xs font-bold text-foreground">
                              {req.employeeName}
                            </TableCell>
                            <TableCell className="text-xs font-mono text-muted-foreground">
                              {req.employeeCode}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              <span className="flex items-center gap-1 truncate max-w-[150px]">
                                <Building className="size-3 text-primary shrink-0" />
                                {req.branchName}
                              </span>
                            </TableCell>
                            <TableCell>
                              {getLeaveTypeBadge(req.leaveType)}
                            </TableCell>
                            <TableCell className="text-xs text-foreground font-medium">
                              {formatDate(req.startDate)} → {formatDate(req.endDate)}
                            </TableCell>
                            <TableCell className="text-xs font-mono font-bold text-foreground">
                              {req.daysCount} {req.daysCount === 1 ? "day" : "days"}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground max-w-[220px]">
                              <p className="truncate" title={req.reason}>
                                {req.reason}
                              </p>
                              {req.reviewedBy && (
                                <p className="text-[10px] text-muted-foreground/80 mt-0.5 truncate">
                                  Reviewer: {req.reviewedBy}
                                  {req.comments ? ` ("${req.comments}")` : ""}
                                </p>
                              )}
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={req.status} />
                            </TableCell>
                            <TableCell className="text-right pr-4">
                              {req.status === "pending" ? (
                                canManageThis ? (
                                  <div className="flex items-center justify-end gap-1.5">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleOpenReview(req, "approve")}
                                      className="h-7 text-xs px-2.5 gap-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800"
                                    >
                                      <CheckCircle className="size-3" />
                                      Approve
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleOpenReview(req, "reject")}
                                      className="h-7 text-xs px-2.5 gap-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-800"
                                    >
                                      <XCircle className="size-3" />
                                      Reject
                                    </Button>
                                  </div>
                                ) : (
                                  <span
                                    title={`Branch Restricted: Stationed in ${req.branchName}. Outside ${currentUser.branchName || "your branch"}.`}
                                    className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded bg-muted text-muted-foreground cursor-not-allowed"
                                  >
                                    <Lock className="size-3" />
                                    Branch Locked
                                  </span>
                                )
                              ) : (
                                <span className="text-[11px] text-muted-foreground font-medium">
                                  {req.status === "approved" ? "Processed" : "Declined"}
                                </span>
                              )}
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
        </Tabs>

        {/* Apply for Leave Modal */}
        <LeaveRequestDialog
          open={applyDialogOpen}
          onOpenChange={setApplyDialogOpen}
        />

        {/* Approve / Reject Review Confirmation Dialog */}
        <Dialog
          open={reviewDialogTarget.open}
          onOpenChange={(open) =>
            setReviewDialogTarget((prev) => ({ ...prev, open }))
          }
        >
          <DialogContent className="sm:max-w-[440px]">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                {reviewDialogTarget.action === "approve" ? (
                  <CheckCircle className="size-5 text-emerald-600" />
                ) : (
                  <XCircle className="size-5 text-rose-600" />
                )}
                <span>
                  {reviewDialogTarget.action === "approve"
                    ? "Approve Leave Request"
                    : "Reject Leave Request"}
                </span>
              </DialogTitle>
              <DialogDescription className="text-xs">
                {reviewDialogTarget.action === "approve"
                  ? `Confirm approval of ${reviewDialogTarget.request?.daysCount} day(s) for ${reviewDialogTarget.request?.employeeName}.`
                  : `Reject leave request for ${reviewDialogTarget.request?.employeeName}.`}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2 text-xs">
              <div className="rounded-lg bg-muted/40 p-2.5 border border-border/60 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">
                    {reviewDialogTarget.request?.employeeName}
                  </span>
                  <span className="font-mono text-muted-foreground">
                    {reviewDialogTarget.request?.employeeCode}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {reviewDialogTarget.request?.leaveType.toUpperCase()} Leave ·{" "}
                  {reviewDialogTarget.request?.daysCount} days (
                  {reviewDialogTarget.request?.startDate} to{" "}
                  {reviewDialogTarget.request?.endDate})
                </p>
                <p className="text-[11px] text-foreground font-medium pt-1">
                  Reason: &quot;{reviewDialogTarget.request?.reason}&quot;
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="review-comment" className="text-xs">
                  Reviewer Feedback / Comments
                </Label>
                <Textarea
                  id="review-comment"
                  value={reviewDialogTarget.comment}
                  onChange={(e) =>
                    setReviewDialogTarget((prev) => ({
                      ...prev,
                      comment: e.target.value,
                    }))
                  }
                  rows={2}
                  className="text-xs"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setReviewDialogTarget((prev) => ({ ...prev, open: false }))
                }
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmReview}
                className={`text-xs font-semibold gap-1.5 ${
                  reviewDialogTarget.action === "approve"
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : "bg-rose-600 hover:bg-rose-700 text-white"
                }`}
              >
                {reviewDialogTarget.action === "approve" ? "Confirm Approval" : "Confirm Rejection"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageContainer>
    </>
  );
}
