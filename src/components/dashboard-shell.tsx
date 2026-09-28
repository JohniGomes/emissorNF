"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { LogoMark } from "./logo-mark";

interface DashboardShellProps {
  userName?: string | null;
  userEmail?: string | null;
  children: React.ReactNode;
}

export function DashboardShell({ userName, userEmail, children }: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <div className="hidden lg:flex lg:w-64 lg:flex-shrink-0 lg:flex-col">
        <div className="flex items-center justify-center border-b border-brand-tan/40 bg-white px-4 py-3">
          <LogoMark size={32} />
        </div>
        <div className="flex-1 overflow-y-auto">
          <Sidebar />
        </div>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-64 flex-col">
            <div className="flex items-center justify-between border-b border-brand-tan/40 bg-white px-4 py-3">
              <LogoMark size={28} />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-md p-1 text-brand-dark hover:bg-brand-cream"
                aria-label="Fechar menu"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <Sidebar onNavigate={() => setMobileOpen(false)} />
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar
          userName={userName}
          userEmail={userEmail}
          onMenuClick={() => setMobileOpen(true)}
        />
        <main className="bg-app-surface flex-1 overflow-y-auto px-4 py-6 sm:px-8 sm:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
