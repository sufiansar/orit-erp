"use client";

import * as React from "react";
import { useState } from "react";
import Link from "next/link";
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
import { toast } from "sonner";
import { Loader2, ArrowLeft, MailCheck } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your account email address.");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
    setSubmitted(true);
    toast.success("Password recovery link generated (Simulated email sent)");
  };

  return (
    <Card className="shadow-lg border-border/80">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl font-bold tracking-tight">
          Reset Password
        </CardTitle>
        <CardDescription className="text-xs">
          Enter your registered work email to receive password reset instructions
        </CardDescription>
      </CardHeader>

      {!submitted ? (
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
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
                "Send Reset Instructions"
              )}
            </Button>

            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="size-3.5" />
              Back to Sign In
            </Link>
          </CardFooter>
        </form>
      ) : (
        <CardContent className="space-y-4 py-4 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
            <MailCheck className="size-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">Instructions Sent</h4>
            <p className="text-xs text-muted-foreground">
              We&apos;ve sent a password reset link to <strong>{email}</strong>.
              (Simulated email delivery).
            </p>
          </div>

          <Link href="/login" className="block w-full">
            <Button
              type="button"
              variant="outline"
              className="w-full text-xs mt-2"
            >
              Return to Sign In
            </Button>
          </Link>
        </CardContent>
      )}
    </Card>
  );
}
