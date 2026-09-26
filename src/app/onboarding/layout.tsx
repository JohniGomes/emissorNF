import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { OnboardingBackdrop } from "@/components/onboarding-backdrop";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="relative min-h-screen overflow-hidden">
      <OnboardingBackdrop />
      <div className="fixed inset-0 bg-black/10 backdrop-blur-[1px]" aria-hidden />

      <main className="relative flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-2xl rounded-xl bg-white p-8 shadow-2xl ring-1 ring-black/5">
          {children}
        </div>
      </main>
    </div>
  );
}
