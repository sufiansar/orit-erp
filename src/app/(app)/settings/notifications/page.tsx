"use client";

import * as React from "react";
import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { PageContainer } from "@/components/shared/page-container";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Bell, Mail, MessageSquare, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function NotificationSettingsPage() {
  const [emailLeave, setEmailLeave] = useState(true);
  const [emailAttendance, setEmailAttendance] = useState(false);
  const [slackAlerts, setSlackAlerts] = useState(true);
  const [deviceAlerts, setDeviceAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);

  const handleSave = () => {
    toast.success("Notification preferences updated!", {
      description: "Alert routing and delivery channels configured.",
    });
  };

  return (
    <>
      <PageHeader
        title="Notification Preferences"
        description="Configure automated email dispatches, Slack webhook alerts, and biometric hardware alarms."
        breadcrumbs={[{ label: "Settings" }, { label: "Notifications" }]}
      />

      <PageContainer maxWidth="4xl">
        <div className="space-y-6">
          <Card className="border-border/80 bg-card shadow-xs">
            <CardHeader className="p-5 pb-3 border-b border-border/60">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <Mail className="size-4 text-primary" />
                <span>Email Delivery Channels</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-foreground">
                    Leave Application & Approval Alerts
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Notify managers and HR when a new time-off request is filed.
                  </p>
                </div>
                <Switch checked={emailLeave} onCheckedChange={setEmailLeave} />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border/40">
                <div>
                  <p className="text-xs font-semibold text-foreground">
                    Biometric Missed Punch / Daily Exceptions
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Send daily summary of late check-ins and unexcused absences.
                  </p>
                </div>
                <Switch checked={emailAttendance} onCheckedChange={setEmailAttendance} />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border/40">
                <div>
                  <p className="text-xs font-semibold text-foreground">
                    Weekly Organization Attendance Digest
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Weekly Monday rollup of branch punctuality and shift compliance.
                  </p>
                </div>
                <Switch checked={weeklyDigest} onCheckedChange={setWeeklyDigest} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-card shadow-xs">
            <CardHeader className="p-5 pb-3 border-b border-border/60">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <AlertCircle className="size-4 text-primary" />
                <span>Hardware & Infrastructure Alarms</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-foreground">
                    Biometric Terminal Offline Emergency Alert
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Immediate notification if a fingerprint/facial device fails heartbeat sync for over 15 minutes.
                  </p>
                </div>
                <Switch checked={deviceAlerts} onCheckedChange={setDeviceAlerts} />
              </div>
            </CardContent>

            <CardFooter className="p-5 pt-0 flex justify-end">
              <Button size="sm" onClick={handleSave} className="text-xs font-semibold">
                Save Notification Rules
              </Button>
            </CardFooter>
          </Card>
        </div>
      </PageContainer>
    </>
  );
}
