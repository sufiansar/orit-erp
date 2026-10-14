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
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMockStore, mockStore } from "@/lib/mock-api/store";
import { Shift } from "@/types/attendance";
import {
  Clock,
  PlusCircle,
  Users,
  Timer,
  Coffee,
  Building,
  Edit2,
  Lock,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";

export default function ShiftsPage() {
  const shifts = useMockStore((s) => s.shifts);
  const branches = useMockStore((s) => s.branches);
  const currentUser = useMockStore((s) => s.currentUser);

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);

  const filteredShifts = useMemo(() => {
    if (!search) return shifts;
    const q = search.toLowerCase();
    return shifts.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.startTime.includes(q) ||
        s.endTime.includes(q)
    );
  }, [shifts, search]);

  const handleEdit = (shift: Shift) => {
    // If HR, check branch assignment
    const isAllowed =
      currentUser.branchScope === "all" ||
      (currentUser.branchId && shift.branchIds.includes(currentUser.branchId));

    if (!isAllowed) {
      toast.error("Branch Permission Denied", {
        description: `As HR for ${currentUser.branchName || "your branch"}, you cannot edit shifts outside your assigned branch.`,
      });
      return;
    }

    setEditingShift(shift);
    setDialogOpen(true);
  };

  return (
    <>
      <PageHeader
        title="Shift Schedules & Timings"
        description="Configure work shifts, core working hours, late grace thresholds, and meal break policies."
        breadcrumbs={[{ label: "Time & Attendance" }, { label: "Shifts" }]}
        actions={
          <Button
            size="sm"
            onClick={() => {
              setEditingShift(null);
              setDialogOpen(true);
            }}
            className="gap-1.5 text-xs font-semibold"
          >
            <PlusCircle className="size-3.5" />
            Create Shift
          </Button>
        }
      />

      <PageContainer maxWidth="full">
        {/* Branch Scope Notice */}
        {currentUser.branchScope === "assigned_only" && (
          <div className="rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-500/10 p-3.5 mb-6 flex items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200">
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <div>
                <span className="font-bold">Branch HR Administrative Scope: </span>
                <span>
                  You are active as <strong>{currentUser.name}</strong> ({currentUser.branchName}). You can configure shifts for Singapore HQ. Global shifts are view-only.
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
            title="Total Shift Profiles"
            value={shifts.length}
            icon={Clock}
            trend="neutral"
            change="General, Morning, Night"
          />
          <StatCard
            title="Standard Grace Threshold"
            value="15 Minutes"
            icon={Timer}
            trend="neutral"
            change="Before arrival is marked Late"
          />
          <StatCard
            title="Standard Break Duration"
            value="60 Minutes"
            icon={Coffee}
            trend="neutral"
            change="Lunch & prayer interval"
          />
        </div>

        {/* Filter Bar */}
        <FilterBar>
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search shifts by name or timings..."
            className="w-full sm:w-80"
          />
          <div className="text-xs text-muted-foreground shrink-0">
            Active Shifts: <strong className="text-foreground">{filteredShifts.length}</strong>
          </div>
        </FilterBar>

        {/* Shifts Table */}
        {filteredShifts.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="No shifts found"
            description="No shift policies match your search query."
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
          <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead className="text-xs font-semibold text-foreground">Shift Name</TableHead>
                    <TableHead className="text-xs font-semibold text-foreground">Code</TableHead>
                    <TableHead className="text-xs font-semibold text-foreground">Working Hours</TableHead>
                    <TableHead className="text-xs font-semibold text-foreground">Grace Period</TableHead>
                    <TableHead className="text-xs font-semibold text-foreground">Break Allowance</TableHead>
                    <TableHead className="text-xs font-semibold text-foreground">Assigned Personnel</TableHead>
                    <TableHead className="text-xs font-semibold text-foreground">Status</TableHead>
                    <TableHead className="text-xs font-semibold text-foreground text-right pr-4">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredShifts.map((shift) => {
                    const isAllowed =
                      currentUser.branchScope === "all" ||
                      (currentUser.branchId &&
                        shift.branchIds.includes(currentUser.branchId));

                    return (
                      <TableRow key={shift.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="text-xs font-bold text-foreground">
                          {shift.name}
                        </TableCell>
                        <TableCell className="text-xs font-mono text-muted-foreground">
                          {shift.code}
                        </TableCell>
                        <TableCell className="text-xs font-mono font-medium text-foreground">
                          {shift.startTime} — {shift.endTime}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1 font-medium text-foreground">
                            <Timer className="size-3 text-primary" />
                            {shift.gracePeriodMinutes} mins
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <Coffee className="size-3 text-muted-foreground" />
                            {shift.breakDurationMinutes} mins
                          </span>
                        </TableCell>
                        <TableCell className="text-xs font-mono font-bold text-foreground">
                          {shift.activeEmployeesCount || 12} staff
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={shift.status} />
                        </TableCell>
                        <TableCell className="text-right pr-4">
                          {isAllowed ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(shift)}
                              className="h-7 text-xs px-2.5 gap-1.5 text-primary hover:bg-primary/10 border-primary/30"
                            >
                              <Edit2 className="size-3" />
                              Edit
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled
                              className="h-7 text-xs gap-1 text-muted-foreground/60 cursor-not-allowed"
                            >
                              <Lock className="size-3" />
                              Locked
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Shift Create / Edit Dialog */}
        <ShiftDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          shift={editingShift}
          branchId={currentUser.branchId}
        />
      </PageContainer>
    </>
  );
}

interface ShiftDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shift: Shift | null;
  branchId?: string;
}

function ShiftDialog({ open, onOpenChange, shift, branchId }: ShiftDialogProps) {
  const [name, setName] = useState(shift?.name || "");
  const [code, setCode] = useState(shift?.code || "");
  const [startTime, setStartTime] = useState(shift?.startTime || "09:00");
  const [endTime, setEndTime] = useState(shift?.endTime || "18:00");
  const [gracePeriod, setGracePeriod] = useState(shift?.gracePeriodMinutes || 15);
  const [breakDuration, setBreakDuration] = useState(shift?.breakDurationMinutes || 60);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter a shift title.");
      return;
    }

    setSaving(true);
    await new Promise((r) => setTimeout(r, 300));

    try {
      if (shift) {
        mockStore.updateShift(shift.id, {
          name,
          code,
          startTime,
          endTime,
          gracePeriodMinutes: Number(gracePeriod),
          breakDurationMinutes: Number(breakDuration),
        });
        toast.success(`Shift schedule "${name}" updated successfully!`);
      } else {
        mockStore.createShift({
          name,
          code: code || `SH-${Date.now().toString().slice(-3)}`,
          startTime,
          endTime,
          gracePeriodMinutes: Number(gracePeriod),
          breakDurationMinutes: Number(breakDuration),
          branchIds: branchId ? [branchId] : ["branch-sg-hq"],
          departmentIds: [],
          status: "active",
        });
        toast.success(`New shift schedule "${name}" created!`);
      }
      onOpenChange(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save shift";
      toast.error("Action Failed", { description: msg });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Clock className="size-4 text-primary" />
              <span>{shift ? "Edit Shift Schedule" : "Create Work Shift"}</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Define standard duty hours, grace allowances, and meal intervals.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="shift-name" className="text-xs">
                Shift Name *
              </Label>
              <Input
                id="shift-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Standard Morning Shift"
                required
                className="h-8 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="shift-code" className="text-xs">
                Shift Code
              </Label>
              <Input
                id="shift-code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. MORN-1"
                className="h-8 text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="start-time" className="text-xs">
                Start Time *
              </Label>
              <Input
                id="start-time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="h-8 text-xs font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="end-time" className="text-xs">
                End Time *
              </Label>
              <Input
                id="end-time"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className="h-8 text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="grace" className="text-xs">
                Late Grace Threshold (Mins)
              </Label>
              <Input
                id="grace"
                type="number"
                min={0}
                max={60}
                value={gracePeriod}
                onChange={(e) => setGracePeriod(Number(e.target.value))}
                className="h-8 text-xs font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="break-dur" className="text-xs">
                Break Duration (Mins)
              </Label>
              <Input
                id="break-dur"
                type="number"
                min={0}
                max={120}
                value={breakDuration}
                onChange={(e) => setBreakDuration(Number(e.target.value))}
                className="h-8 text-xs font-mono"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={saving}
              className="text-xs font-semibold gap-1.5"
            >
              <CheckCircle2 className="size-3.5" />
              {saving ? "Saving..." : "Save Shift Profile"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
