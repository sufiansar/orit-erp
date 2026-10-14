"use client";

import * as React from "react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
import { Employee } from "@/types/employee";
import { AttendanceStatus } from "@/types/attendance";
import { mockStore, useMockStore } from "@/lib/mock-api/store";
import { toast } from "sonner";
import { Building, Calendar, Clock, ShieldAlert, CheckCircle2 } from "lucide-react";

interface AttendanceRegularizeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
  initialDate?: string;
  initialStatus?: AttendanceStatus;
  initialCheckIn?: string;
  initialCheckOut?: string;
  onSuccess?: () => void;
}

export function AttendanceRegularizeDialog({
  open,
  onOpenChange,
  employee,
  initialDate,
  initialStatus = "present",
  initialCheckIn = "09:00",
  initialCheckOut = "18:00",
  onSuccess,
}: AttendanceRegularizeDialogProps) {
  if (!employee) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        {/* Render Form with key to cleanly initialize state whenever employee/date changes */}
        <AttendanceRegularizeForm
          key={`${employee.id}-${initialDate || "today"}`}
          employee={employee}
          initialDate={initialDate}
          initialStatus={initialStatus}
          initialCheckIn={initialCheckIn}
          initialCheckOut={initialCheckOut}
          onClose={() => onOpenChange(false)}
          onSuccess={onSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}

interface FormProps {
  employee: Employee;
  initialDate?: string;
  initialStatus: AttendanceStatus;
  initialCheckIn: string;
  initialCheckOut: string;
  onClose: () => void;
  onSuccess?: () => void;
}

function AttendanceRegularizeForm({
  employee,
  initialDate,
  initialStatus,
  initialCheckIn,
  initialCheckOut,
  onClose,
  onSuccess,
}: FormProps) {
  const currentUser = useMockStore((s) => s.currentUser);
  const canManage = mockStore.canManageEmployee(employee.id);

  const [date, setDate] = useState(
    initialDate || new Date().toISOString().split("T")[0]
  );
  const [status, setStatus] = useState<AttendanceStatus>(initialStatus);
  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);
  const [notes, setNotes] = useState(
    `Manual regularization requested by HR (${currentUser.name})`
  );
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canManage) {
      toast.error("Branch Permission Denied", {
        description: `As HR for ${currentUser.branchName || "your branch"}, you cannot modify employees in ${employee.branchName}.`,
      });
      return;
    }

    setSaving(true);
    await new Promise((r) => setTimeout(r, 300));

    try {
      mockStore.regularizeAttendance(
        employee.id,
        date,
        checkIn,
        checkOut,
        status,
        notes
      );
      toast.success("Attendance regularized successfully", {
        description: `${employee.fullName} • ${date} updated as ${status.toUpperCase()}`,
      });
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update attendance";
      toast.error("Operation Denied", { description: msg });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle className="text-base font-bold flex items-center gap-2">
          <Clock className="size-4 text-primary" />
          <span>Manual Attendance & Regularization</span>
        </DialogTitle>
        <DialogDescription className="text-xs">
          Manually adjust punch times, override device logs, or resolve missing shifts.
        </DialogDescription>
      </DialogHeader>

      {/* Employee Identity Context Box */}
      <div className="rounded-lg border border-border/80 bg-muted/40 p-3 space-y-1.5 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-bold text-foreground text-sm">
            {employee.fullName}
          </span>
          <span className="font-mono text-muted-foreground text-[11px]">
            {employee.employeeCode}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-muted-foreground text-[11px]">
          <span>{employee.departmentName}</span>
          <span>•</span>
          <span className="flex items-center gap-1 font-medium text-foreground">
            <Building className="size-3 text-primary" />
            {employee.branchName}
          </span>
        </div>
      </div>

      {/* Branch Access Warning if unauthorized */}
      {!canManage && (
        <div className="rounded-lg border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 p-3 flex items-start gap-2.5 text-xs text-rose-800 dark:text-rose-200">
          <ShieldAlert className="size-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
          <div>
            <p className="font-semibold">Branch Scoping Restriction Active</p>
            <p className="text-[11px] text-rose-700 dark:text-rose-300 mt-0.5">
              You are logged in as <strong>{currentUser.name}</strong> ({currentUser.branchName || "Branch HR"}). You can only update attendance for employees belonging to your assigned branch.
            </p>
          </div>
        </div>
      )}

      {/* Form Fields */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="att-date" className="text-xs">
            Date
          </Label>
          <Input
            id="att-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="h-8 text-xs"
            disabled={!canManage}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="att-status" className="text-xs">
            Attendance Status
          </Label>
          <Select
            value={status}
            onValueChange={(v) => setStatus(v as AttendanceStatus)}
            disabled={!canManage}
          >
            <SelectTrigger id="att-status" className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="present" className="text-xs">Present</SelectItem>
              <SelectItem value="late" className="text-xs">Late Arrival</SelectItem>
              <SelectItem value="early_exit" className="text-xs">Early Exit</SelectItem>
              <SelectItem value="half_day" className="text-xs">Half Day</SelectItem>
              <SelectItem value="absent" className="text-xs">Absent</SelectItem>
              <SelectItem value="on_leave" className="text-xs">On Leave</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="att-checkin" className="text-xs">
            Check-In Time
          </Label>
          <Input
            id="att-checkin"
            type="time"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="h-8 text-xs font-mono"
            disabled={!canManage}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="att-checkout" className="text-xs">
            Check-Out Time
          </Label>
          <Input
            id="att-checkout"
            type="time"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="h-8 text-xs font-mono"
            disabled={!canManage}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="att-notes" className="text-xs">
          HR Justification / Regularization Notes
        </Label>
        <Textarea
          id="att-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Reason for manual attendance adjustment..."
          rows={2}
          className="text-xs"
          disabled={!canManage}
        />
      </div>

      <DialogFooter className="gap-2 sm:gap-0 pt-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onClose}
          className="text-xs"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={saving || !canManage}
          className="text-xs font-semibold gap-1.5"
        >
          <CheckCircle2 className="size-3.5" />
          {saving ? "Saving..." : "Save Regularization"}
        </Button>
      </DialogFooter>
    </form>
  );
}
