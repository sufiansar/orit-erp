"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getNavItemsByRole, NavItem } from "@/config/navigation";
import { mapRoleToUserRole } from "@/lib/auth.utils";
import { useMockStore } from "@/lib/mock-api/store";
import { APP_CONFIG } from "@/config/app";
import { OrganizationSwitcher } from "./organization-switcher";
import { NavIcon } from "./nav-icon";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Orbit, Sparkles } from "lucide-react";

interface AppSidebarProps {
  className?: string;
  onNavigate?: () => void;
}

export function AppSidebar({ className, onNavigate }: AppSidebarProps) {
  const pathname = usePathname();
  const currentUser = useMockStore((s) => s.currentUser);
  const userRole = mapRoleToUserRole(currentUser.roleType);

  // Dynamically compute navigation sections based on active user role
  const navSections = React.useMemo(() => getNavItemsByRole(userRole), [userRole]);

  const isLinkActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard" || pathname === "/";
    if (href === "/settings/general") return pathname.startsWith("/settings");
    if (href === "/admin/overview") return pathname === "/admin/overview" || pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={cn(
        "flex h-full w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground select-none shrink-0",
        className
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center gap-3 px-5 border-b border-sidebar-border">
        <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-indigo-500 text-primary-foreground shadow-md shadow-primary/20 shrink-0">
          <Orbit className="size-5 animate-[spin_12s_linear_infinite]" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold tracking-tight text-base text-sidebar-foreground">
            {APP_CONFIG.name}
          </span>
          <span className="text-[10px] font-medium tracking-wide uppercase text-muted-foreground">
            Cloud ERP Suite
          </span>
        </div>
      </div>

      {/* Organization Switcher */}
      <div className="p-3 border-b border-sidebar-border/70">
        <OrganizationSwitcher />
      </div>

      {/* Main Navigation Scroll Area - Dynamically Scoped to User Role */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin">
        {navSections.map((section) => (
          <div key={section.title} className="space-y-1">
            <h4 className="px-3 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              {section.title}
            </h4>
            <div className="space-y-0.5 pt-1">
              {section.items.map((item) => (
                <SidebarNavLink
                  key={item.href}
                  item={item}
                  isActive={isLinkActive(item.href)}
                  onClick={onNavigate}
                  isAdmin={item.href.startsWith("/admin")}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Footer Notice */}
      <div className="p-3 border-t border-sidebar-border bg-sidebar-accent/30 text-xs">
        <div className="flex items-center gap-2 text-muted-foreground text-[11px]">
          <Sparkles className="size-3.5 text-primary shrink-0" />
          <span className="truncate">Multi-Tenant Frontend v1.0</span>
        </div>
      </div>
    </aside>
  );
}

function SidebarNavLink({
  item,
  isActive,
  onClick,
  isAdmin = false,
}: {
  item: NavItem;
  isActive: boolean;
  onClick?: () => void;
  isAdmin?: boolean;
}) {
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "group flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-150",
        {
          "bg-primary text-primary-foreground shadow-xs font-semibold":
            isActive && !isAdmin,
          "bg-primary/15 text-primary font-semibold border border-primary/30":
            isActive && isAdmin,
          "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground":
            !isActive,
        }
      )}
    >
      <div className="flex items-center gap-2.5 truncate">
        <NavIcon
          name={item.icon}
          className={cn("size-4 shrink-0 transition-transform group-hover:scale-105", {
            "text-primary-foreground": isActive && !isAdmin,
            "text-primary": (isActive && isAdmin) || (!isActive && isAdmin),
            "text-muted-foreground group-hover:text-sidebar-foreground":
              !isActive && !isAdmin,
          })}
        />
        <span className="truncate">{item.title}</span>
      </div>

      {item.badge && (
        <Badge
          variant="secondary"
          className={cn("text-[10px] px-1.5 py-0 font-medium shrink-0", {
            "bg-primary-foreground/20 text-primary-foreground border-none":
              isActive && !isAdmin,
            "bg-primary/20 text-primary": !isActive,
          })}
        >
          {item.badge}
        </Badge>
      )}
    </Link>
  );
}
