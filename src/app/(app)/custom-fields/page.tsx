"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { PageContainer } from "@/components/shared/page-container";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMockStore, mockStore } from "@/lib/mock-api/store";
import { CustomFieldDefinition, CustomFieldEntity, CustomFieldType } from "@/types/custom-field";
import {
  Layers,
  PlusCircle,
  Users,
  Building2,
  FolderTree,
  CheckCircle2,
  Eye,
  Edit2,
  Trash2,
  Hash,
  Calendar,
  ToggleLeft,
  ListFilter,
  Type,
} from "lucide-react";
import { toast } from "sonner";

export default function CustomFieldsPage() {
  const customFields = useMockStore((s) => s.customFields);
  const [selectedEntity, setSelectedEntity] = useState<CustomFieldEntity>("employee");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<CustomFieldDefinition | null>(null);

  const entityFields = useMemo(() => {
    return customFields.filter((cf) => cf.entityType === selectedEntity);
  }, [customFields, selectedEntity]);

  const handleToggleActive = (field: CustomFieldDefinition) => {
    mockStore.customFields = mockStore.customFields.map((f) =>
      f.id === field.id ? { ...f, isActive: !f.isActive } : f
    );
    mockStore.notify();
    toast.success(
      `Field "${field.label}" ${field.isActive ? "deactivated" : "activated"}`
    );
  };

  const getTypeIcon = (type: CustomFieldType) => {
    switch (type) {
      case "text":
        return <Type className="size-3.5 text-sky-600" />;
      case "number":
        return <Hash className="size-3.5 text-amber-600" />;
      case "date":
        return <Calendar className="size-3.5 text-emerald-600" />;
      case "boolean":
        return <ToggleLeft className="size-3.5 text-purple-600" />;
      case "select":
        return <ListFilter className="size-3.5 text-indigo-600" />;
    }
  };

  return (
    <>
      <PageHeader
        title="Custom Fields Builder"
        description="Extend system entities with custom schema attributes, typed inputs, and tenant-specific metadata."
        breadcrumbs={[{ label: "Configuration" }, { label: "Custom Fields" }]}
        actions={
          <Button
            size="sm"
            onClick={() => {
              setEditingField(null);
              setDialogOpen(true);
            }}
            className="gap-1.5 text-xs font-semibold"
          >
            <PlusCircle className="size-3.5" />
            Add Custom Field
          </Button>
        }
      />

      <PageContainer maxWidth="full">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
          <StatCard
            title="Total Custom Fields"
            value={customFields.length}
            icon={Layers}
            trend="neutral"
            change="Across 3 entity models"
          />
          <StatCard
            title="Employee Schema Fields"
            value={customFields.filter((f) => f.entityType === "employee").length}
            icon={Users}
            trend="up"
            change="Cost center, uniform, visa"
          />
          <StatCard
            title="Active & Enforced"
            value={customFields.filter((f) => f.isActive).length}
            icon={CheckCircle2}
            trend="neutral"
            change="Integrated in data forms"
          />
        </div>

        {/* Entity Selector Tabs */}
        <Tabs
          value={selectedEntity}
          onValueChange={(v) => setSelectedEntity(v as CustomFieldEntity)}
          className="space-y-4"
        >
          <TabsList className="h-10 p-1 bg-muted/60 border border-border/80">
            <TabsTrigger value="employee" className="text-xs font-semibold gap-2">
              <Users className="size-3.5" />
              Employee Fields ({customFields.filter((f) => f.entityType === "employee").length})
            </TabsTrigger>
            <TabsTrigger value="branch" className="text-xs font-semibold gap-2">
              <Building2 className="size-3.5" />
              Branch Fields ({customFields.filter((f) => f.entityType === "branch").length})
            </TabsTrigger>
            <TabsTrigger value="department" className="text-xs font-semibold gap-2">
              <FolderTree className="size-3.5" />
              Department Fields ({customFields.filter((f) => f.entityType === "department").length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={selectedEntity} className="space-y-4">
            {entityFields.length === 0 ? (
              <EmptyState
                icon={Layers}
                title={`No custom fields defined for ${selectedEntity}`}
                description="Add custom properties to capture organization-specific attributes during data entry."
                action={
                  <Button
                    size="sm"
                    onClick={() => {
                      setEditingField(null);
                      setDialogOpen(true);
                    }}
                    className="text-xs"
                  >
                    Add Field
                  </Button>
                }
              />
            ) : (
              <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-xs">
                <Table>
                  <TableHeader className="bg-muted/40">
                    <TableRow>
                      <TableHead className="text-xs font-semibold text-foreground">Field Label</TableHead>
                      <TableHead className="text-xs font-semibold text-foreground">Database Key</TableHead>
                      <TableHead className="text-xs font-semibold text-foreground">Data Type</TableHead>
                      <TableHead className="text-xs font-semibold text-foreground">Validation</TableHead>
                      <TableHead className="text-xs font-semibold text-foreground">Options / Meta</TableHead>
                      <TableHead className="text-xs font-semibold text-foreground">Status</TableHead>
                      <TableHead className="text-xs font-semibold text-foreground text-right pr-4">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entityFields.map((field) => (
                      <TableRow key={field.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="text-xs font-bold text-foreground">
                          {field.label}
                        </TableCell>
                        <TableCell className="text-xs font-mono text-muted-foreground">
                          {field.fieldKey}
                        </TableCell>
                        <TableCell className="text-xs">
                          <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                            {getTypeIcon(field.fieldType)}
                            {field.fieldType.toUpperCase()}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs">
                          {field.required ? (
                            <Badge variant="outline" className="text-[10px] bg-rose-50 text-rose-700 dark:bg-rose-950/40 border-rose-300">
                              Mandatory
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] bg-muted text-muted-foreground">
                              Optional
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {field.options && field.options.length > 0 ? (
                            <span className="text-[11px] truncate max-w-[200px] block">
                              [{field.options.join(", ")}]
                            </span>
                          ) : (
                            <span className="text-muted-foreground/60">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={field.isActive}
                              onCheckedChange={() => handleToggleActive(field)}
                            />
                            <span className="text-[11px] text-muted-foreground">
                              {field.isActive ? "Active" : "Disabled"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right pr-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingField(field);
                              setDialogOpen(true);
                            }}
                            className="h-7 text-xs px-2 gap-1 text-primary hover:bg-primary/10"
                          >
                            <Edit2 className="size-3" />
                            Configure
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Custom Field Dialog */}
        <CustomFieldDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          field={editingField}
          defaultEntity={selectedEntity}
        />
      </PageContainer>
    </>
  );
}

interface CustomFieldDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  field: CustomFieldDefinition | null;
  defaultEntity: CustomFieldEntity;
}

function CustomFieldDialog({
  open,
  onOpenChange,
  field,
  defaultEntity,
}: CustomFieldDialogProps) {
  const [label, setLabel] = useState(field?.label || "");
  const [fieldKey, setFieldKey] = useState(field?.fieldKey || "");
  const [entityType, setEntityType] = useState<CustomFieldEntity>(
    field?.entityType || defaultEntity
  );
  const [fieldType, setFieldType] = useState<CustomFieldType>(
    field?.fieldType || "text"
  );
  const [required, setRequired] = useState(field?.required || false);
  const [placeholder, setPlaceholder] = useState(field?.placeholder || "");
  const [optionsStr, setOptionsStr] = useState(
    field?.options ? field.options.join(", ") : "Option A, Option B, Option C"
  );
  const [saving, setSaving] = useState(false);

  // Auto-generate key from label
  const handleLabelChange = (newLabel: string) => {
    setLabel(newLabel);
    if (!field) {
      const generated = newLabel
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "_")
        .replace(/_+/g, "_")
        .slice(0, 30);
      setFieldKey(generated);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim() || !fieldKey.trim()) {
      toast.error("Label and field key are required.");
      return;
    }

    setSaving(true);
    await new Promise((r) => setTimeout(r, 300));

    const options =
      fieldType === "select"
        ? optionsStr
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined;

    if (field) {
      mockStore.customFields = mockStore.customFields.map((f) =>
        f.id === field.id
          ? {
              ...f,
              label,
              fieldKey,
              entityType,
              fieldType,
              required,
              placeholder,
              options,
            }
          : f
      );
      toast.success(`Custom field "${label}" updated!`);
    } else {
      mockStore.createCustomField({
        organizationId: "org-acme-global",
        label,
        fieldKey,
        entityType,
        fieldType,
        required,
        isActive: true,
        placeholder,
        options,
        orderIndex: mockStore.customFields.length + 1,
      });
      toast.success(`Custom field "${label}" created successfully!`);
    }

    mockStore.notify();
    setSaving(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Layers className="size-4 text-primary" />
              <span>{field ? "Configure Field" : "Create Schema Attribute"}</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Define the label, storage key, and input widget for this entity attribute.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="cf-label" className="text-xs">
                Field Label *
              </Label>
              <Input
                id="cf-label"
                value={label}
                onChange={(e) => handleLabelChange(e.target.value)}
                placeholder="e.g. Cost Center Code"
                required
                className="h-8 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cf-key" className="text-xs">
                Field Key (DB Identifier) *
              </Label>
              <Input
                id="cf-key"
                value={fieldKey}
                onChange={(e) => setFieldKey(e.target.value)}
                placeholder="cost_center_code"
                required
                className="h-8 text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Target Entity *</Label>
              <Select
                value={entityType}
                onValueChange={(v) => setEntityType(v as CustomFieldEntity)}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee" className="text-xs">Employee</SelectItem>
                  <SelectItem value="branch" className="text-xs">Branch Office</SelectItem>
                  <SelectItem value="department" className="text-xs">Department</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Widget / Type *</Label>
              <Select
                value={fieldType}
                onValueChange={(v) => setFieldType(v as CustomFieldType)}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text" className="text-xs">Short Text</SelectItem>
                  <SelectItem value="number" className="text-xs">Numeric</SelectItem>
                  <SelectItem value="date" className="text-xs">Date Picker</SelectItem>
                  <SelectItem value="boolean" className="text-xs">Toggle / Switch</SelectItem>
                  <SelectItem value="select" className="text-xs">Dropdown Select</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {fieldType === "select" && (
            <div className="space-y-1.5">
              <Label htmlFor="cf-options" className="text-xs">
                Dropdown Options (Comma-separated) *
              </Label>
              <Input
                id="cf-options"
                value={optionsStr}
                onChange={(e) => setOptionsStr(e.target.value)}
                placeholder="Option 1, Option 2, Option 3"
                className="h-8 text-xs"
              />
            </div>
          )}

          <div className="flex items-center justify-between p-3 rounded-lg border border-border/70 bg-muted/30">
            <div>
              <p className="text-xs font-semibold text-foreground">Mandatory Field</p>
              <p className="text-[11px] text-muted-foreground">
                Users must provide a value during form submission
              </p>
            </div>
            <Switch checked={required} onCheckedChange={setRequired} />
          </div>

          {/* Live Form Widget Preview */}
          <div className="p-3 rounded-lg border border-dashed border-primary/40 bg-primary/5 space-y-1.5">
            <span className="text-[10px] font-semibold text-primary uppercase tracking-wider block">
              Live Input Preview
            </span>
            <Label className="text-xs text-foreground font-medium">
              {label || "Field Preview"}{" "}
              {required && <span className="text-rose-600">*</span>}
            </Label>
            {fieldType === "text" && (
              <Input placeholder="Sample text entry..." disabled className="h-8 text-xs bg-background" />
            )}
            {fieldType === "number" && (
              <Input type="number" placeholder="42" disabled className="h-8 text-xs font-mono bg-background" />
            )}
            {fieldType === "date" && (
              <Input type="date" disabled className="h-8 text-xs bg-background" />
            )}
            {fieldType === "boolean" && (
              <div className="flex items-center gap-2 pt-1">
                <Switch disabled />
                <span className="text-xs text-muted-foreground">Enabled / Disabled</span>
              </div>
            )}
            {fieldType === "select" && (
              <Select disabled>
                <SelectTrigger className="h-8 text-xs bg-background">
                  <SelectValue placeholder="Select an option..." />
                </SelectTrigger>
              </Select>
            )}
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
              {saving ? "Saving..." : "Save Attribute"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
