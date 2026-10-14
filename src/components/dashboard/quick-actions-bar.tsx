"use client";

import * as React from "react";
import Link from "next/link";
import { UserPlus, CalendarCheck, CalendarOff, Boxes } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function QuickActionsBar() {
  const actions = [
    {
      title: "Add Employee",
      description: "Onboard new staff member",
      href: "/employees?action=new",
      icon: UserPlus,
      color: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300",
    },
    {
      title: "View Attendance",
      description: "Daily logs & CSV exports",
      href: "/attendance",
      icon: CalendarCheck,
      color: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
    },
    {
      title: "Review Leave",
      description: "Approve time-off requests",
      href: "/leave",
      icon: CalendarOff,
      color: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
    },
    {
      title: "Configure Modules",
      description: "Manage tenant SaaS features",
      href: "/modules",
      icon: Boxes,
      color: "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {actions.map((act) => {
        const Icon = act.icon;
        return (
          <Link key={act.title} href={act.href} className="group">
            <Card className="h-full transition-all duration-150 hover:border-primary/40 hover:shadow-sm">
              <CardContent className="p-4 flex items-center gap-3.5">
                <div className={`p-2.5 rounded-lg ${act.color} shrink-0 transition-transform group-hover:scale-105`}>
                  <Icon className="size-5" />
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                    {act.title}
                  </h4>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {act.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
