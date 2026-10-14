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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Branch } from "@/types/organization";
import { useMockStore, mockStore } from "@/lib/mock-api/store";
import { APP_CONFIG } from "@/config/app";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface BranchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branch?: Branch | null;
  onSuccess?: (b: Branch) => void;
}

export function BranchDialog({
  open,
  onOpenChange,
  branch,
  onSuccess,
}: BranchDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {branch ? "Edit Branch Office" : "Add Physical Branch"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {branch
              ? "Update branch location, address coordinates, and local timezone."
              : "Register a new company office or regional hub."}
          </DialogDescription>
        </DialogHeader>

        {open && (
          <BranchFormContent
            key={branch ? branch.id : "new-branch"}
            branch={branch}
            onClose={() => onOpenChange(false)}
            onSuccess={onSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function BranchFormContent({
  branch,
  onClose,
  onSuccess,
}: {
  branch?: Branch | null;
  onClose: () => void;
  onSuccess?: (b: Branch) => void;
}) {
  const currentOrg = useMockStore((s) => s.getCurrentOrg());

  const [formData, setFormData] = useState(() => {
    if (branch) {
      return {
        name: branch.name,
        code: branch.code,
        location: branch.location,
        timezone: branch.timezone,
        phone: branch.phone || "",
        managerName: branch.managerName || "",
        status: branch.status,
      };
    }
    return {
      name: "",
      code: "",
      location: "",
      timezone: currentOrg.timezone || "UTC",
      phone: "",
      managerName: "",
      status: "active" as Branch["status"],
    };
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = "Branch name is required";
    if (!formData.code.trim()) errs.code = "Branch code (e.g. SG-HQ) is required";
    if (!formData.location.trim()) errs.location = "Physical address / city is required";
    if (!formData.timezone) errs.timezone = "Local timezone is required";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 400));

    if (branch) {
      const updated = mockStore.updateBranch(branch.id, formData);
      setSubmitting(false);
      onClose();
      toast.success(`Updated branch: ${formData.name}`);
      if (updated && onSuccess) onSuccess(updated);
    } else {
      const created = mockStore.createBranch({
        ...formData,
        organizationId: currentOrg.id,
      });
      setSubmitting(false);
      onClose();
      toast.success(`Branch created: ${created.name} (${created.code})`);
      if (onSuccess) onSuccess(created);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-2">
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2 space-y-1.5">
          <Label htmlFor="branchName" className="text-xs">
            Branch Name *
          </Label>
          <Input
            id="branchName"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Singapore Tech Hub"
            className="h-8 text-xs"
          />
          {errors.name && (
            <p className="text-[10px] text-destructive">{errors.name}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="branchCode" className="text-xs">
            Code *
          </Label>
          <Input
            id="branchCode"
            value={formData.code}
            onChange={(e) =>
              setFormData({ ...formData, code: e.target.value.toUpperCase() })
            }
            placeholder="SG-HQ"
            className="h-8 text-xs font-mono uppercase"
          />
          {errors.code && (
            <p className="text-[10px] text-destructive">{errors.code}</p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="location" className="text-xs">
          Physical Address & Location *
        </Label>
        <Input
          id="location"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          placeholder="79 Robinson Road, Downtown Core, Singapore"
          className="h-8 text-xs"
        />
        {errors.location && (
          <p className="text-[10px] text-destructive">{errors.location}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Office Local Timezone *</Label>
          <Select
            value={formData.timezone}
            onValueChange={(val) =>
              setFormData({ ...formData, timezone: val || "UTC" })
            }
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {APP_CONFIG.timezones.map((tz) => (
                <SelectItem key={tz.value} value={tz.value} className="text-xs">
                  {tz.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone" className="text-xs">
            Direct Phone
          </Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+65 6789 0123"
            className="h-8 text-xs"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="manager" className="text-xs">
            Branch General Manager
          </Label>
          <Input
            id="manager"
            value={formData.managerName}
            onChange={(e) =>
              setFormData({ ...formData, managerName: e.target.value })
            }
            placeholder="Alina Vance"
            className="h-8 text-xs"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Operational Status</Label>
          <Select
            value={formData.status}
            onValueChange={(val) =>
              setFormData({
                ...formData,
                status: (val as typeof formData.status) || "active",
              })
            }
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active" className="text-xs">Active Branch</SelectItem>
              <SelectItem value="inactive" className="text-xs">Inactive / Renovation</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <DialogFooter className="pt-3 border-t border-border/60">
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
          disabled={submitting}
          className="text-xs gap-1.5"
        >
          {submitting && <Loader2 className="size-3.5 animate-spin" />}
          {branch ? "Save Changes" : "Create Branch"}
        </Button>
      </DialogFooter>
    </form>
  );
}
