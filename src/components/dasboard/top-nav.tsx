"use client";

import { Bell, Search, User, Menu } from "lucide-react";

interface TopNavProps {
  openMobile: () => void;
}

export default function TopNav({ openMobile }: TopNavProps) {
  return (
    <header className="flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6">
      {/* Mobile Burger Menu Trigger Action Layout */}
      <div className="flex items-center gap-3">
        <button
          onClick={openMobile}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Context Search bar placeholder - Hidden on very small items */}
        <div className="relative hidden sm:block w-48 md:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="search"
            placeholder="Search campaigns..."
            className="w-full rounded-lg border border-slate-300 bg-slate-50 py-1.5 pl-9 pr-4 text-sm outline-none transition-all focus:border-blue-500 focus:bg-white"
          />
        </div>
      </div>

      {/* User Profiles Panel Actions Area */}
      <div className="flex items-center gap-2 md:gap-4">
        <button className="relative rounded-full p-1.5 text-slate-500 hover:bg-slate-50 hover:text-slate-700">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
        </button>

        <div className="h-6 w-px bg-slate-200" />

        <div className="flex items-center gap-2 md:gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600">
            <User className="h-5 w-5" />
          </div>
          {/* <div className="hidden md:block text-left">
            <p className="text-sm font-medium text-slate-700">Admin Account</p>
            <p className="text-xs text-slate-400">Media Buyer</p>
          </div> */}
        </div>
      </div>
    </header>
  );
}
