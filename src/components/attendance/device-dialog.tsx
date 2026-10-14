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
import { useMockStore, mockStore } from "@/lib/mock-api/store";
import { toast } from "sonner";
import { Loader2, Fingerprint, ShieldAlert } from "lucide-react";

interface DeviceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeviceDialog({ open, onOpenChange }: DeviceDialogProps) {
  const branches = useMockStore((s) => s.branches);

  const [formData, setFormData] = useState({
    name: "",
    brand: "ZKTeco ProFace X",
    model: "ProFace-X-IP68",
    branchId: branches[0]?.id || "",
    ipAddress: "192.168.1.100",
    port: 4370,
    connectionType: "TCP/IP" as const,
  });

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Please provide a descriptive device name.");
      return;
    }

    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 500));

    const branch = branches.find((b) => b.id === formData.branchId);
    mockStore.createDevice({
      ...formData,
      branchName: branch?.name || "Main Branch",
      status: "connected",
    });

    setSubmitting(false);
    onOpenChange(false);
    toast.success(`Connected biometric terminal: ${formData.name}`, {
      description: "Terminal registered to mock polling queue. (Backend integration required for physical packets).",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Fingerprint className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base">Connect Biometric Terminal</DialogTitle>
              <DialogDescription className="text-xs">
                Register a fingerprint or facial recognition hardware device
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="deviceName" className="text-xs">
              Device Name *
            </Label>
            <Input
              id="deviceName"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Ground Floor Turnstile Terminal"
              className="h-8 text-xs"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Brand & Hardware Model</Label>
              <Select
                value={formData.brand}
                onValueChange={(val) =>
                  setFormData({ ...formData, brand: val || "ZKTeco ProFace X" })
                }
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ZKTeco ProFace X" className="text-xs">ZKTeco ProFace X</SelectItem>
                  <SelectItem value="Hikvision MinMoe" className="text-xs">Hikvision MinMoe</SelectItem>
                  <SelectItem value="Suprema BioStation" className="text-xs">Suprema BioStation 3</SelectItem>
                  <SelectItem value="Anviz FaceDeep" className="text-xs">Anviz FaceDeep 5</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Branch Office Location</Label>
              <Select
                value={formData.branchId}
                onValueChange={(val) =>
                  setFormData({ ...formData, branchId: val || "" })
                }
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((b) => (
                    <SelectItem key={b.id} value={b.id} className="text-xs">
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="ipAddress" className="text-xs">
                Local IP Address
              </Label>
              <Input
                id="ipAddress"
                value={formData.ipAddress}
                onChange={(e) =>
                  setFormData({ ...formData, ipAddress: e.target.value })
                }
                placeholder="192.168.1.100"
                className="h-8 text-xs font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="port" className="text-xs">
                Port
              </Label>
              <Input
                id="port"
                type="number"
                value={formData.port}
                onChange={(e) =>
                  setFormData({ ...formData, port: parseInt(e.target.value) || 4370 })
                }
                className="h-8 text-xs font-mono"
              />
            </div>
          </div>

          <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-2.5 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2">
            <ShieldAlert className="size-4 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold">Backend Integration Required:</strong>{" "}
              Live socket packets and SDK listeners require the upcoming Express.js daemon. This client simulates connection status.
            </div>
          </div>

          <DialogFooter className="pt-2">
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
              disabled={submitting}
              className="text-xs gap-1.5"
            >
              {submitting && <Loader2 className="size-3.5 animate-spin" />}
              Save Device
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
