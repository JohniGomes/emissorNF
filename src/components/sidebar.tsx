"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FilePlus2, FileText, Users, Gift } from "lucide-react";
import { LogoMark } from "./logo-mark";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/notas/nova", label: "Emitir NF", icon: FilePlus2 },
  { href: "/dashboard/notas", label: "NFs emitidas", icon: FileText },
  { href: "/dashboard/clientes", label: "Clientes", icon: Users },
  { href: "/dashboard/indique", label: "Indique e ganhe", icon: Gift },
];

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname();

  const ativoHref = navItems
    .filter((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  return (
    <div className="bg-brand-sidebar flex h-full w-64 flex-col text-white">
      <div className="flex items-center gap-2 px-6 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
          <LogoMark size={22} />
        </div>
        <span className="text-lg font-bold tracking-wide">NOTARIUM</span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {navItems.map((item) => {
          const isActive = item.href === ativoHref;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "btn-gradient text-white"
                  : "text-brand-cream/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
