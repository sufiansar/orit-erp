"use client";

import * as React from "react";
import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { PageContainer } from "@/components/shared/page-container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMockStore, mockStore } from "@/lib/mock-api/store";
import { Building2, Save, Globe, Clock, DollarSign, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function GeneralSettingsPage() {
  const currentOrg = useMockStore((s) => s.getCurrentOrg());

  const [name, setName] = useState(currentOrg.name);
  const [slug, setSlug] = useState(currentOrg.slug);
  const [domain, setDomain] = useState(currentOrg.domain);
  const [currency, setCurrency] = useState(currentOrg.currency);
  const [timezone, setTimezone] = useState(currentOrg.timezone);
  const [weekStart, setWeekStart] = useState(currentOrg.weekStart || "monday");
  const [dateFormat, setDateFormat] = useState(currentOrg.dateFormat || "YYYY-MM-DD");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));

    mockStore.updateCurrentOrg({
      name,
      slug,
      domain,
      currency,
      timezone,
      weekStart: weekStart as "monday" | "sunday" | "saturday",
      dateFormat,
    });

    setSaving(false);
    toast.success("Organization profile saved successfully!", {
      description: "Company coordinates and timezone updated.",
    });
  };

  return (
    <>
      <PageHeader
        title="Organization Settings"
        description="Company tenant profile, corporate identity, fiscal currency, and localized time settings."
        breadcrumbs={[{ label: "Settings" }, { label: "General" }]}
      />

      <PageContainer maxWidth="default">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="border-border/80 bg-card shadow-xs">
            <CardHeader className="p-5 pb-3 border-b border-border/60">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <Building2 className="size-4 text-primary" />
                <span>Tenant Identity & Domain</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="org-name" className="text-xs">
                    Legal Business Name *
                  </Label>
                  <Input
                    id="org-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="org-slug" className="text-xs">
                    Tenant Slug Identifier *
                  </Label>
                  <Input
                    id="org-slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    required
                    className="h-9 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="org-domain" className="text-xs">
                  Custom Domain or Subdomain
                </Label>
                <Input
                  id="org-domain"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="acmeglobal.io"
                  className="h-9 text-xs font-mono"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-card shadow-xs">
            <CardHeader className="p-5 pb-3 border-b border-border/60">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <Globe className="size-4 text-primary" />
                <span>Localization & Regional Formats</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Primary Timezone *</Label>
                  <Select value={timezone} onValueChange={(v) => v && setTimezone(v)}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Singapore" className="text-xs">Asia/Singapore (UTC+8)</SelectItem>
                      <SelectItem value="Europe/London" className="text-xs">Europe/London (GMT/BST)</SelectItem>
                      <SelectItem value="America/New_York" className="text-xs">America/New_York (EST/EDT)</SelectItem>
                      <SelectItem value="Asia/Dubai" className="text-xs">Asia/Dubai (GST)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Base Accounting Currency *</Label>
                  <Select value={currency} onValueChange={(v) => v && setCurrency(v)}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD" className="text-xs">USD ($) — US Dollar</SelectItem>
                      <SelectItem value="EUR" className="text-xs">EUR (€) — Euro</SelectItem>
                      <SelectItem value="GBP" className="text-xs">GBP (£) — British Pound</SelectItem>
                      <SelectItem value="SGD" className="text-xs">SGD (S$) — Singapore Dollar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">First Day of Work Week</Label>
                  <Select value={weekStart} onValueChange={(v) => v && setWeekStart(v as "monday" | "sunday" | "saturday")}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monday" className="text-xs">Monday</SelectItem>
                      <SelectItem value="sunday" className="text-xs">Sunday</SelectItem>
                      <SelectItem value="saturday" className="text-xs">Saturday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Display Date Format</Label>
                  <Select value={dateFormat} onValueChange={(v) => v && setDateFormat(v)}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="YYYY-MM-DD" className="text-xs">YYYY-MM-DD (2026-10-14)</SelectItem>
                      <SelectItem value="DD/MM/YYYY" className="text-xs">DD/MM/YYYY (14/10/2026)</SelectItem>
                      <SelectItem value="MM/DD/YYYY" className="text-xs">MM/DD/YYYY (10/14/2026)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>

            <CardFooter className="p-5 pt-0 flex justify-end">
              <Button
                type="submit"
                size="sm"
                disabled={saving}
                className="gap-1.5 text-xs font-semibold"
              >
                <Save className="size-3.5" />
                {saving ? "Saving Changes..." : "Save Settings"}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </PageContainer>
    </>
  );
}
