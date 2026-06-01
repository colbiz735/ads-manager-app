"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Settings,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  X,
  MapPin,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Schedules", href: "/dashboard/schedules", icon: CalendarDays },
  { label: "Stations", href: "/dashboard/stations", icon: MapPin  },
  // { label: "Analytics", href: "/analytics", icon: TrendingUp },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

interface SidebarProps {
  isMobileOpen: boolean;
  closeMobile: () => void;
}

export default function Sidebar({ isMobileOpen, closeMobile }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* 1. MOBILE ACCESSIBILITY OVERLAY DRAWER BACKDROP */}
      {isMobileOpen && (
        <div
          onClick={closeMobile}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 md:hidden"
        />
      )}

      {/* 2. THE MAIN SIDEBAR COMPONENT CONTAINER */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-slate-200 bg-white text-slate-700 transition-all duration-300 ease-in-out 
          md:sticky md:translate-x-0 ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} ${
            isCollapsed ? "md:w-16" : "md:w-64"
          } w-64 h-full`}
      >
        {/* Brand Header / Close Button on Mobile */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-100">
          <div className="flex items-center gap-3 font-semibold text-blue-600">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
              A
            </div>
            <span
              className={`text-slate-800 ${isCollapsed ? "md:hidden" : "block"}`}
            >
              AdsManager
            </span>
          </div>

          {/* Mobile Close Button Icon */}
          <button
            onClick={closeMobile}
            className="rounded-lg p-1.5 hover:bg-slate-100 text-slate-500 md:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Menus List Link items */}
        <nav className="flex-1 space-y-1 p-3">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobile} // Closes drawer automatically when picking items on mobile
                className={`flex items-center rounded-lg px-3 py-2.5 transition-colors duration-200 group ${
                  isActive
                    ? "bg-blue-50 font-medium text-blue-600"
                    : "hover:bg-slate-50 text-slate-600 hover:text-slate-900"
                }`}
              >
                <item.icon
                  className={`h-5 w-5 flex-shrink-0 ${isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"}`}
                />
                <span
                  className={`ml-3 truncate ${isCollapsed ? "md:hidden block" : "block"}`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Expand / Collapse Toggle Control Button (Hidden on Mobile viewports entirely) */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute bottom-4 -right-3 hidden md:flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm hover:bg-slate-50 hover:text-slate-700"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </aside>
    </>
  );
}
