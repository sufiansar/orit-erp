"use client";

import * as React from "react";
import { Sparkles, X } from "lucide-react";
import { useState } from "react";

export function DemoBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="relative isolate flex items-center gap-x-3 overflow-hidden bg-primary/10 px-4 py-2 text-xs font-medium text-primary border-b border-primary/20 sm:px-6">
      <div className="flex items-center gap-2 flex-1 justify-center">
        <Sparkles className="size-3.5 shrink-0 text-primary animate-pulse" />
        <span>
          <strong className="font-semibold">Frontend Prototype Mode:</strong>{" "}
          All tenant data, CRUD actions, biometric sync, and workflows are running in-memory with typed mock services.
        </span>
      </div>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="p-1 text-primary/70 hover:text-primary transition-colors"
        aria-label="Dismiss banner"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}
