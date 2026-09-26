"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="rounded-full bg-brand-dark px-5 py-2 text-sm font-medium text-white hover:bg-brand-brown"
    >
      Sair
    </button>
  );
}
