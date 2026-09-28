"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Menu, HelpCircle, Bell, LogOut, Building2 } from "lucide-react";

interface TopbarProps {
  userName?: string | null;
  userEmail?: string | null;
  onMenuClick: () => void;
}

function getInitials(name?: string | null, email?: string | null) {
  const source = name || email || "?";
  return source
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Topbar({ userName, userEmail, onMenuClick }: TopbarProps) {
  const [openMenu, setOpenMenu] = useState<"help" | "notifications" | "user" | null>(
    null,
  );

  function toggle(menu: "help" | "notifications" | "user") {
    setOpenMenu((current) => (current === menu ? null : menu));
  }

  return (
    <header className="flex items-center justify-between border-b border-brand-tan/40 bg-white px-4 py-3 sm:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        className="rounded-md p-2 text-brand-dark hover:bg-brand-cream lg:hidden"
        aria-label="Abrir menu"
      >
        <Menu size={20} />
      </button>

      <div className="hidden lg:block" />

      <div className="flex items-center gap-2">
        <div className="relative">
          <button
            type="button"
            onClick={() => toggle("help")}
            className="rounded-full p-2 text-brand-dark hover:bg-brand-cream"
            aria-label="Ajuda"
          >
            <HelpCircle size={20} />
          </button>
          {openMenu === "help" && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setOpenMenu(null)}
              />
              <div className="absolute right-0 z-20 mt-2 w-64 rounded-md border border-gray-200 bg-white p-4 text-sm shadow-lg">
                <p className="mb-2 font-medium text-gray-900">Precisa de ajuda?</p>
                <p className="text-gray-600">
                  Fale com a gente pelo e-mail{" "}
                  <a
                    href="mailto:suporte@notarium.com.br"
                    className="text-brand-brown hover:underline"
                  >
                    suporte@notarium.com.br
                  </a>
                </p>
              </div>
            </>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => toggle("notifications")}
            className="rounded-full p-2 text-brand-dark hover:bg-brand-cream"
            aria-label="Notificações"
          >
            <Bell size={20} />
          </button>
          {openMenu === "notifications" && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setOpenMenu(null)}
              />
              <div className="absolute right-0 z-20 mt-2 w-64 rounded-md border border-gray-200 bg-white p-4 text-sm shadow-lg">
                <p className="font-medium text-gray-900">Notificações</p>
                <p className="mt-2 text-gray-500">Nenhuma notificação por enquanto.</p>
              </div>
            </>
          )}
        </div>

        <div className="relative ml-1">
          <button
            type="button"
            onClick={() => toggle("user")}
            className="flex h-9 w-9 items-center justify-center rounded-full btn-gradient text-sm font-semibold text-white"
          >
            {getInitials(userName, userEmail)}
          </button>
          {openMenu === "user" && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setOpenMenu(null)}
              />
              <div className="absolute right-0 z-20 mt-2 w-56 rounded-md border border-gray-200 bg-white p-2 text-sm shadow-lg">
                <div className="px-3 py-2">
                  <p className="truncate font-medium text-gray-900">
                    {userName || "Minha conta"}
                  </p>
                  <p className="truncate text-gray-500">{userEmail}</p>
                </div>
                <hr className="my-1 border-gray-100" />
                <Link
                  href="/dashboard/empresa"
                  onClick={() => setOpenMenu(null)}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-gray-700 hover:bg-brand-cream"
                >
                  <Building2 size={16} />
                  Dados da empresa
                </Link>
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-gray-700 hover:bg-brand-cream"
                >
                  <LogOut size={16} />
                  Sair
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
