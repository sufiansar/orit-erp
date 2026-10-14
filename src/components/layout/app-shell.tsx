"use client";

import * as React from "react";
import { useState } from "react";
import { AppSidebar } from "./app-sidebar";
import { AppHeader } from "./app-header";
import { DemoBanner } from "@/components/shared/demo-banner";
import { GlobalSearchModal } from "./global-search-modal";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-40">
        <AppSidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col md:pl-64 min-w-0">
        <DemoBanner />
        <AppHeader onOpenSearch={() => setSearchOpen(true)} />
        <main className="flex-1 flex flex-col">{children}</main>
      </div>

      {/* Global Command / Search Modal */}
      <GlobalSearchModal open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
