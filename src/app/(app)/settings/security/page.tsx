"use client";

import * as React from "react";
import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { PageContainer } from "@/components/shared/page-container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Shield, KeyRound, Smartphone, Lock, CheckCircle2, History } from "lucide-react";
import { toast } from "sonner";

export default function SecuritySettingsPage() {
  const [twoFactor, setTwoFactor] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState("30");
  const [requireSpecialChar, setRequireSpecialChar] = useState(true);
  const [minPasswordLength, setMinPasswordLength] = useState("12");

  const handleSave = () => {
    toast.success("Security policies saved successfully", {
      description: "Tenant authentication constraints updated.",
    });
  };

  return (
    <>
      <PageHeader
        title="Security & Authentication"
        description="Tenant access policies, Multi-Factor Authentication (2FA), password complexity, and active sessions."
        breadcrumbs={[{ label: "Settings" }, { label: "Security" }]}
      />

      <PageContainer maxWidth="4xl">
        <div className="space-y-6">
          {/* 2FA Card */}
          <Card className="border-border/80 bg-card shadow-xs">
            <CardHeader className="p-5 pb-3 border-b border-border/60">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <Smartphone className="size-4 text-primary" />
                <span>Multi-Factor Authentication (2FA)</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-foreground">
                    Enforce 2FA for all administrative accounts
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Requires Time-based One-Time Password (TOTP) via Google Authenticator or 1Password.
                  </p>
                </div>
                <Switch checked={twoFactor} onCheckedChange={setTwoFactor} />
              </div>
            </CardContent>
          </Card>

          {/* Password Policy */}
          <Card className="border-border/80 bg-card shadow-xs">
            <CardHeader className="p-5 pb-3 border-b border-border/60">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <KeyRound className="size-4 text-primary" />
                <span>Password Complexity Policy</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Minimum Password Length</Label>
                  <Select value={minPasswordLength} onValueChange={setMinPasswordLength}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="8" className="text-xs">8 Characters (Basic)</SelectItem>
                      <SelectItem value="10" className="text-xs">10 Characters (Standard)</SelectItem>
                      <SelectItem value="12" className="text-xs">12 Characters (Recommended)</SelectItem>
                      <SelectItem value="16" className="text-xs">16 Characters (High Security)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Idle Session Inactivity Timeout</Label>
                  <Select value={sessionTimeout} onValueChange={setSessionTimeout}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15" className="text-xs">15 Minutes</SelectItem>
                      <SelectItem value="30" className="text-xs">30 Minutes (Recommended)</SelectItem>
                      <SelectItem value="60" className="text-xs">1 Hour</SelectItem>
                      <SelectItem value="240" className="text-xs">4 Hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div>
                  <p className="text-xs font-semibold text-foreground">
                    Require Special Symbols and Digits
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Passwords must contain at least one symbol (@, #, $) and numeral.
                  </p>
                </div>
                <Switch checked={requireSpecialChar} onCheckedChange={setRequireSpecialChar} />
              </div>
            </CardContent>

            <CardFooter className="p-5 pt-0 flex justify-end">
              <Button size="sm" onClick={handleSave} className="text-xs font-semibold">
                Save Security Rules
              </Button>
            </CardFooter>
          </Card>

          {/* Active Demo Sessions */}
          <Card className="border-border/80 bg-card shadow-xs">
            <CardHeader className="p-5 pb-3 border-b border-border/60">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <History className="size-4 text-primary" />
                <span>Active Browser Sessions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between text-xs p-3 rounded-lg border border-border/60 bg-muted/20">
                <div>
                  <p className="font-semibold text-foreground">Current Session (Chrome on Windows)</p>
                  <p className="text-[11px] text-muted-foreground">Singapore · IP: 119.74.88.10 · Active Now</p>
                </div>
                <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 border-emerald-300">
                  Current Device
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    </>
  );
}
