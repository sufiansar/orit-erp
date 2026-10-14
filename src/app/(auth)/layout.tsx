import * as React from "react";
import Link from "next/link";
import { Orbit } from "lucide-react";
import { APP_CONFIG } from "@/config/app";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 sm:p-6 bg-gradient-to-b from-background to-muted/40">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 group"
          >
            <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-indigo-500 text-primary-foreground shadow-md shadow-primary/20 group-hover:scale-105 transition-transform">
              <Orbit className="size-6 animate-[spin_12s_linear_infinite]" />
            </div>
            <span className="font-bold text-xl tracking-tight text-foreground">
              {APP_CONFIG.name}
            </span>
          </Link>
          <p className="text-xs text-muted-foreground">{APP_CONFIG.tagline}</p>
        </div>

        {children}

        <p className="text-center text-[11px] text-muted-foreground">
          Protected prototype environment · Mock authentication only
        </p>
      </div>
    </div>
  );
}
