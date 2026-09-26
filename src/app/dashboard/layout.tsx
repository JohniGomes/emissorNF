import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const empresa = await prisma.empresa.findFirst({
    where: { userId: session.user.id },
  });

  if (!empresa) redirect("/onboarding");
  if (!empresa.assinaturaAtiva) redirect("/onboarding/plano");

  return (
    <DashboardShell userName={session.user.name} userEmail={session.user.email}>
      {children}
    </DashboardShell>
  );
}
