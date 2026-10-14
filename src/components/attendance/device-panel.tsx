"use client";

import * as React from "react";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { DeviceDialog } from "./device-dialog";
import { useMockStore, mockStore } from "@/lib/mock-api/store";
import { formatDateTime } from "@/lib/format";
import { toast } from "sonner";
import { Fingerprint, RefreshCw, Plus, Wifi } from "lucide-react";

export function DevicePanel() {
  const devices = useMockStore((s) => s.devices);
  const [connectDialogOpen, setConnectDialogOpen] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const handleSync = async (id: string, name: string) => {
    setSyncingId(id);
    await new Promise((r) => setTimeout(r, 600));
    mockStore.syncDevice(id);
    setSyncingId(null);
    toast.success(`Synchronized ${name}`, {
      description: "Ingested latest punch packets into attendance store.",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-foreground">
            Connected Biometric Hardware Terminals
          </h3>
          <p className="text-xs text-muted-foreground">
            Facial recognition and fingerprint gateways synchronizing daily staff punches
          </p>
        </div>

        <Button
          onClick={() => setConnectDialogOpen(true)}
          size="sm"
          className="gap-1.5 text-xs font-semibold self-start sm:self-auto"
        >
          <Plus className="size-3.5" />
          Connect Terminal
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {devices.map((dev) => (
          <Card key={dev.id} className="border-border/80 shadow-xs flex flex-col justify-between">
            <CardHeader className="pb-3 border-b border-border/60 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Fingerprint className="size-5" />
                </div>
                <StatusBadge status={dev.status} />
              </div>

              <div>
                <CardTitle className="text-sm font-bold truncate">{dev.name}</CardTitle>
                <CardDescription className="text-xs truncate">{dev.brand}</CardDescription>
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-3 text-xs">
              <div className="space-y-1.5 text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>Branch:</span>
                  <span className="font-medium text-foreground">{dev.branchName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>IP Address:</span>
                  <span className="font-mono text-[11px] text-foreground">{dev.ipAddress}:{dev.port}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Connection:</span>
                  <span className="font-medium text-foreground inline-flex items-center gap-1">
                    <Wifi className="size-3 text-primary" />
                    {dev.connectionType}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Punches Today:</span>
                  <span className="font-bold text-primary">{dev.totalPunchesToday}</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[10px]">
                  <span>Last Sync:</span>
                  <span className="text-foreground">{formatDateTime(dev.lastSyncAt)}</span>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSync(dev.id, dev.name)}
                disabled={syncingId === dev.id}
                className="w-full text-xs gap-1.5 h-8 mt-1"
              >
                <RefreshCw className={`size-3.5 ${syncingId === dev.id ? "animate-spin text-primary" : ""}`} />
                {syncingId === dev.id ? "Syncing..." : "Sync Terminal"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <DeviceDialog
        open={connectDialogOpen}
        onOpenChange={setConnectDialogOpen}
      />
    </div>
  );
}
