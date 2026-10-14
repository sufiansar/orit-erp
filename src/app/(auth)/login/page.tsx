"use client";

import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  Loader2,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Building,
  User,
  Users,
  ShieldAlert,
  Crown,
} from "lucide-react";
import { DEMO_USERS, DemoUserCredential } from "@/lib/mock-api/data";
import { mockStore } from "@/lib/mock-api/store";

export default function LoginPage() {
  const router = useRouter();
  const [selectedCredential, setSelectedCredential] = useState<DemoUserCredential>(DEMO_USERS[1]); // Default: Alina Vance (Org Admin)
  const [email, setEmail] = useState(DEMO_USERS[1].email);
  const [password, setPassword] = useState("Password123!");
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter a valid work email.");
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    setLoading(false);

    // Find matched demo user or fall back to selected
    const matched =
      DEMO_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase()) ||
      selectedCredential;

    mockStore.setCurrentUser(matched);

    toast.success(`Signed in as ${matched.name}`, {
      description: `Role: ${matched.roleName} • ${
        matched.branchName ? `Branch: ${matched.branchName}` : "Company-Wide Access"
      }`,
    });

    if (matched.roleType === "platform_admin") {
      router.push("/admin/overview");
    } else {
      router.push("/dashboard");
    }
  };

  const handleSelectUser = (user: DemoUserCredential) => {
    setSelectedCredential(user);
    setEmail(user.email);
    setPassword(user.password);
    toast.info(`Selected ${user.title}`, {
      description: `Ready to login as ${user.name} (${user.email})`,
    });
  };

  const getRoleIcon = (roleType: DemoUserCredential["roleType"]) => {
    switch (roleType) {
      case "platform_admin":
        return <ShieldAlert className="size-4 text-purple-600 dark:text-purple-400" />;
      case "org_admin":
        return <Crown className="size-4 text-indigo-600 dark:text-indigo-400" />;
      case "hr_admin":
        return <Building className="size-4 text-amber-600 dark:text-amber-400" />;
      case "manager":
        return <Users className="size-4 text-sky-600 dark:text-sky-400" />;
      case "employee":
        return <User className="size-4 text-emerald-600 dark:text-emerald-400" />;
    }
  };

  return (
    <Card className="shadow-lg border-border/80">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl font-bold tracking-tight">
          Sign In to Workspace
        </CardTitle>
        <CardDescription className="text-xs">
          Access your organization tenant dashboard and ERP modules
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {/* Quick Demo Credentials Autofill Picker */}
          <div className="rounded-xl border border-border/80 bg-muted/30 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <Sparkles className="size-3.5 text-primary" />
                <span>Select Demo Account Role</span>
              </div>
              <span className="text-[10px] text-muted-foreground">Click to Autofill</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {DEMO_USERS.map((user) => {
                const isSelected = selectedCredential.email === user.email;
                return (
                  <button
                    key={user.email}
                    type="button"
                    onClick={() => handleSelectUser(user)}
                    className={`flex flex-col text-left p-2.5 rounded-lg border text-xs transition-all cursor-pointer ${
                      isSelected
                        ? "border-primary bg-primary/10 shadow-xs"
                        : "border-border/70 bg-card hover:bg-muted/50 hover:border-border"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 w-full">
                      <div className="flex items-center gap-1.5 font-semibold text-foreground">
                        {getRoleIcon(user.roleType)}
                        <span className="truncate">{user.name}</span>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted font-medium text-muted-foreground shrink-0">
                        {user.badge}
                      </span>
                    </div>
                    <span className="text-[11px] text-muted-foreground mt-0.5 truncate">
                      {user.email}
                    </span>
                    {user.branchName && (
                      <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400 mt-1">
                        Branch: {user.branchName}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs">
              Work Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              required
              className="h-9 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-xs">
                Password
              </Label>
              <Link
                href="/forgot-password"
                className="text-xs text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-9 text-sm"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={(c) => setRememberMe(!!c)}
            />
            <label
              htmlFor="remember"
              className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-muted-foreground"
            >
              Remember this browser for 30 days
            </label>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button
            type="submit"
            className="w-full gap-2 font-medium"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <>
                Sign In as {selectedCredential.name.split(" ")[0]}
                <ArrowRight className="size-4" />
              </>
            )}
          </Button>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
            <ShieldCheck className="size-3.5 text-emerald-600" />
            <span>Encrypted mock tenant session • Role permissions enforced</span>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
