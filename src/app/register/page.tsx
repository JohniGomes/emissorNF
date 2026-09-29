"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { registerUser, type RegisterState } from "./actions";

const initialState: RegisterState = {};

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(registerUser, initialState);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex justify-center">
          <Logo size={40} />
        </div>
        <h1 className="mb-6 text-center text-xl font-semibold text-gray-900">
          Criar conta
        </h1>

        <form action={formAction} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Nome
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand-tan focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              E-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand-tan focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand-tan focus:outline-none"
            />
          </div>

          <div className="flex items-start gap-2">
            <input
              id="aceitouTermos"
              name="aceitouTermos"
              type="checkbox"
              required
              className="mt-0.5"
            />
            <label htmlFor="aceitouTermos" className="text-xs text-gray-600">
              Li e concordo com os{" "}
              <Link href="/termos" target="_blank" className="text-brand-brown hover:underline">
                Termos de Uso
              </Link>{" "}
              e a{" "}
              <Link
                href="/privacidade"
                target="_blank"
                className="text-brand-brown hover:underline"
              >
                Política de Privacidade
              </Link>
              .
            </label>
          </div>

          {state.error && <p className="text-sm text-red-600">{state.error}</p>}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-md btn-gradient px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {pending ? "Criando..." : "Criar conta"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Já tem conta?{" "}
          <Link href="/login" className="text-brand-brown hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </main>
  );
}
