'use client'

import { useState } from 'react'
import Sidebar from '@/src/components/dasboard/sidebar'
import TopNav from '@/src/components/dasboard/top-nav'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50">
      {/* Sidebar Component: Now takes mobile state controls */}
      <Sidebar isMobileOpen={isMobileOpen} closeMobile={() => setIsMobileOpen(false)} />

      {/* Main Container Workspace */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Navbar: Controls triggering opening sidebar drawer */}
        <TopNav openMobile={() => setIsMobileOpen(true)} />

        {/* Dynamic Client viewport */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
