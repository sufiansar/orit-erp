"use client";

import * as React from "react";
import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { PageContainer } from "@/components/shared/page-container";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMockStore, mockStore } from "@/lib/mock-api/store";
import {
  WorkflowDefinition,
  WorkflowStep,
  WorkflowTrigger,
  ApproverType,
} from "@/types/workflow";
import {
  GitBranch,
  PlusCircle,
  ArrowRight,
  Clock,
  UserCheck,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  PlayCircle,
  FileCheck2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

export default function WorkflowsPage() {
  const workflows = useMockStore((s) => s.workflows);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowDefinition>(
    workflows[0]
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [addStepOpen, setAddStepOpen] = useState(false);

  const handleToggleStatus = (wf: WorkflowDefinition) => {
    const nextStatus = wf.status === "published" ? "draft" : "published";
    mockStore.workflows = mockStore.workflows.map((w) =>
      w.id === wf.id
        ? {
            ...w,
            status: nextStatus,
            version: w.version + 1,
            updatedAt: new Date().toISOString(),
          }
        : w
    );
    mockStore.notify();
    setSelectedWorkflow((prev) =>
      prev.id === wf.id ? { ...prev, status: nextStatus } : prev
    );
    toast.success(
      `Workflow "${wf.name}" is now ${nextStatus.toUpperCase()} (v${
        wf.version + 1
      })`
    );
  };

  const getApproverIcon = (type: ApproverType) => {
    switch (type) {
      case "direct_manager":
        return <UserCheck className="size-3.5 text-sky-600" />;
      case "hr_manager":
        return <ShieldCheck className="size-3.5 text-amber-600" />;
      case "org_admin":
        return <CheckCircle2 className="size-3.5 text-indigo-600" />;
      default:
        return <UserCheck className="size-3.5 text-muted-foreground" />;
    }
  };

  return (
    <>
      <PageHeader
        title="Automated Approval Workflows"
        description="Visual multi-tier approval chains, branch escalation rules, SLA timeouts, and event triggers."
        breadcrumbs={[{ label: "Configuration" }, { label: "Workflows" }]}
        actions={
          <Button
            size="sm"
            onClick={() => setDialogOpen(true)}
            className="gap-1.5 text-xs font-semibold"
          >
            <PlusCircle className="size-3.5" />
            New Workflow
          </Button>
        }
      />

      <PageContainer maxWidth="full">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
          <StatCard
            title="Total Configured Workflows"
            value={workflows.length}
            icon={GitBranch}
            trend="neutral"
            change="Leave, expenses, shift swap"
          />
          <StatCard
            title="Active Production Rules"
            value={workflows.filter((w) => w.status === "published").length}
            icon={CheckCircle2}
            trend="up"
            change="Enforced across tenant"
          />
          <StatCard
            title="Average Escalation SLA"
            value="36 Hours"
            icon={Clock}
            trend="neutral"
            change="Automated timeout threshold"
          />
        </div>

        {/* Workflow Master / Detail View */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Panel: Workflow List */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider px-1">
              Workflow Catalog
            </h3>
            <div className="space-y-2">
              {workflows.map((wf) => {
                const isSelected = selectedWorkflow.id === wf.id;
                return (
                  <Card
                    key={wf.id}
                    onClick={() => setSelectedWorkflow(wf)}
                    className={`cursor-pointer transition-all border ${
                      isSelected
                        ? "border-primary bg-primary/5 shadow-xs"
                        : "border-border/80 bg-card hover:bg-muted/40"
                    }`}
                  >
                    <CardHeader className="p-3 pb-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-muted-foreground">
                          v{wf.version} · {wf.trigger.replace("_", " ")}
                        </span>
                        <StatusBadge status={wf.status} />
                      </div>
                      <CardTitle className="text-sm font-bold text-foreground mt-1">
                        {wf.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-1">
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {wf.description}
                      </p>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/40 text-[10px] text-muted-foreground">
                        <span>{wf.steps.length} Approval Stages</span>
                        <span>
                          Updated {new Date(wf.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Right Panel: Visual Step Pipeline Editor */}
          <div className="lg:col-span-8 space-y-4">
            <Card className="border-border/80 bg-card shadow-xs">
              <CardHeader className="p-5 pb-3 border-b border-border/60 flex flex-row items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                      v{selectedWorkflow.version}
                    </span>
                    <CardTitle className="text-base font-bold text-foreground">
                      {selectedWorkflow.name}
                    </CardTitle>
                    <StatusBadge status={selectedWorkflow.status} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {selectedWorkflow.description}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleStatus(selectedWorkflow)}
                    className="h-8 text-xs font-semibold gap-1.5"
                  >
                    <PlayCircle className="size-3.5" />
                    {selectedWorkflow.status === "published"
                      ? "Unpublish to Draft"
                      : "Publish Workflow"}
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-5 space-y-6">
                {/* Event Trigger Block */}
                <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      <Sparkles className="size-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">
                        Event Trigger
                      </span>
                      <h4 className="text-sm font-bold text-foreground">
                        Trigger: {selectedWorkflow.trigger.replace("_", " ").toUpperCase()}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Fires automatically whenever an employee submits an application.
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs bg-background">
                    Automatic Dispatch
                  </Badge>
                </div>

                {/* Pipeline Arrow */}
                <div className="flex justify-center -my-3">
                  <div className="p-1.5 rounded-full bg-muted border border-border">
                    <ArrowRight className="size-3.5 rotate-90 text-muted-foreground" />
                  </div>
                </div>

                {/* Sequential Approval Stages */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                      Sequential Approval Stages ({selectedWorkflow.steps.length})
                    </h4>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setAddStepOpen(true)}
                      className="h-7 text-xs gap-1 border-primary/30 text-primary hover:bg-primary/10"
                    >
                      <PlusCircle className="size-3" />
                      Add Stage
                    </Button>
                  </div>

                  <div className="space-y-2.5">
                    {selectedWorkflow.steps.map((step, idx) => (
                      <div
                        key={step.id}
                        className="rounded-xl border border-border/80 bg-muted/30 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-primary/40 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="size-8 rounded-lg bg-card border border-border flex items-center justify-center font-bold text-xs text-foreground font-mono shrink-0">
                            {idx + 1}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-foreground">
                                {step.name}
                              </span>
                              <Badge
                                variant="outline"
                                className="text-[10px] px-1.5 py-0 flex items-center gap-1 bg-background"
                              >
                                {getApproverIcon(step.approverType)}
                                {step.approverType.replace("_", " ").toUpperCase()}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-0.5">
                              <span className="flex items-center gap-1">
                                <Clock className="size-3" />
                                SLA: {step.timeLimitHours}h Timeout
                              </span>
                              <span>•</span>
                              <span>
                                {step.autoApproveOnTimeout
                                  ? "Auto-approves on timeout"
                                  : "Escalates on timeout"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <Badge variant="outline" className="text-[10px] bg-background font-mono">
                            Action: {step.requiredApprovalAction.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* New Workflow Modal */}
        <NewWorkflowDialog open={dialogOpen} onOpenChange={setDialogOpen} />

        {/* Add Stage Modal */}
        <AddStepDialog
          open={addStepOpen}
          onOpenChange={setAddStepOpen}
          workflowId={selectedWorkflow.id}
          onStepAdded={(newStep) => {
            setSelectedWorkflow((prev) => ({
              ...prev,
              steps: [...prev.steps, newStep],
            }));
          }}
        />
      </PageContainer>
    </>
  );
}

function NewWorkflowDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [trigger, setTrigger] = useState<WorkflowTrigger>("leave_submitted");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newWf: WorkflowDefinition = {
      id: `wf-${Date.now().toString().slice(-4)}`,
      name,
      description,
      trigger,
      status: "draft",
      version: 1,
      updatedAt: new Date().toISOString(),
      steps: [
        {
          id: `step-1`,
          order: 1,
          name: "Direct Supervisor Review",
          approverType: "direct_manager",
          timeLimitHours: 24,
          autoApproveOnTimeout: false,
          requiredApprovalAction: "any",
        },
        {
          id: `step-2`,
          order: 2,
          name: "Branch HR Verification",
          approverType: "hr_manager",
          timeLimitHours: 48,
          autoApproveOnTimeout: false,
          requiredApprovalAction: "all",
        },
      ],
    };

    mockStore.workflows = [newWf, ...mockStore.workflows];
    mockStore.notify();
    toast.success(`Workflow "${name}" created in draft mode!`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <GitBranch className="size-4 text-primary" />
              <span>Create Approval Workflow</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Configure event-triggered multi-stage routing.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-1.5">
            <Label className="text-xs">Workflow Name *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Executive Travel & Expense Approval"
              required
              className="h-8 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Trigger Event *</Label>
            <Select
              value={trigger}
              onValueChange={(v) => setTrigger(v as WorkflowTrigger)}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="leave_submitted" className="text-xs">Leave Submitted</SelectItem>
                <SelectItem value="expense_submitted" className="text-xs">Expense Claim Filed</SelectItem>
                <SelectItem value="purchase_request_submitted" className="text-xs">Purchase Requisition</SelectItem>
                <SelectItem value="shift_swap_requested" className="text-xs">Shift Swap Request</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Description</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of policy coverage..."
              className="h-8 text-xs"
            />
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
            <Button type="submit" size="sm" className="text-xs font-semibold">
              Create Workflow
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AddStepDialog({
  open,
  onOpenChange,
  workflowId,
  onStepAdded,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workflowId: string;
  onStepAdded: (step: WorkflowStep) => void;
}) {
  const [name, setName] = useState("");
  const [approverType, setApproverType] = useState<ApproverType>("hr_manager");
  const [timeLimit, setTimeLimit] = useState(48);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newStep: WorkflowStep = {
      id: `step-${Date.now().toString().slice(-4)}`,
      order: 3,
      name,
      approverType,
      timeLimitHours: Number(timeLimit),
      autoApproveOnTimeout: false,
      requiredApprovalAction: "all",
    };

    mockStore.workflows = mockStore.workflows.map((w) =>
      w.id === workflowId ? { ...w, steps: [...w.steps, newStep] } : w
    );
    mockStore.notify();
    onStepAdded(newStep);
    toast.success(`Added approval stage "${name}"`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              Add Approval Stage
            </DialogTitle>
            <DialogDescription className="text-xs">
              Append an escalation checkpoint to the workflow chain.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-1.5">
            <Label className="text-xs">Stage Name *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Finance Controller Sign-off"
              required
              className="h-8 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Reviewer Role *</Label>
            <Select
              value={approverType}
              onValueChange={(v) => setApproverType(v as ApproverType)}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="direct_manager" className="text-xs">Reporting Direct Manager</SelectItem>
                <SelectItem value="department_head" className="text-xs">Department Head</SelectItem>
                <SelectItem value="hr_manager" className="text-xs">Branch HR Administrator</SelectItem>
                <SelectItem value="org_admin" className="text-xs">Super Organization Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Resolution Timeout (Hours)</Label>
            <Input
              type="number"
              value={timeLimit}
              onChange={(e) => setTimeLimit(Number(e.target.value))}
              min={1}
              max={168}
              className="h-8 text-xs font-mono"
            />
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
            <Button type="submit" size="sm" className="text-xs font-semibold">
              Add Stage
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
