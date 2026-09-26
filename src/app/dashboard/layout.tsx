import Link from "next/link";
import { auth, signOut } from "@/lib/auth";

const navItems = [
  { href: "/dashboard", label: "Início" },
  { href: "/dashboard/empresa", label: "Empresa" },
  { href: "/dashboard/clientes", label: "Clientes" },
  { href: "/dashboard/notas", label: "Notas" },
  { href: "/dashboard/recorrentes", label: "Recorrentes" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3">
        <nav className="flex gap-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-gray-700 hover:text-indigo-600"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{session?.user?.email}</span>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button
              type="submit"
              className="text-sm font-medium text-gray-500 hover:text-red-600"
            >
              Sair
            </button>
          </form>
        </div>
      </header>

      <main className="flex-1 bg-gray-50 px-6 py-8">{children}</main>
    </div>
  );
}
