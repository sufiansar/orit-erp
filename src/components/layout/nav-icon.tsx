import * as React from "react";
import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarCheck,
  Clock,
  CalendarOff,
  Layers,
  GitBranch,
  Boxes,
  ShieldAlert,
  CreditCard,
  Settings,
  ShieldCheck,
  Globe,
  SlidersHorizontal,
  Lock,
  Bell,
  HelpCircle,
  Coins,
  PackageCheck,
  BarChart3,
  LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  Users,
  Building2,
  CalendarCheck,
  Clock,
  CalendarOff,
  Layers,
  GitBranch,
  Boxes,
  ShieldAlert,
  CreditCard,
  Settings,
  ShieldCheck,
  Globe,
  SlidersHorizontal,
  Lock,
  Bell,
  HelpCircle,
  Coins,
  PackageCheck,
  BarChart3,
};

export function NavIcon({
  name,
  className = "size-4",
}: {
  name: string;
  className?: string;
}) {
  const IconComponent = ICON_MAP[name] || LayoutDashboard;
  return <IconComponent className={className} />;
}
