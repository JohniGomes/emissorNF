import type { NextAuthConfig } from "next-auth";

/**
 * Config "edge-safe": sem providers que dependam de Prisma/bcrypt (Node APIs),
 * usada pelo middleware (Edge runtime). O NextAuth completo (src/lib/auth.ts)
 * estende esta config adicionando o Credentials provider.
 */
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  // Necessário na Vercel: confia no header Host em vez de exigir NEXTAUTH_URL
  // fixo, já que preview deployments têm domínios dinâmicos.
  trustHost: true,
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const precisaLogin =
        request.nextUrl.pathname.startsWith("/dashboard") ||
        request.nextUrl.pathname.startsWith("/onboarding");
      if (precisaLogin && !isLoggedIn) return false;
      return true;
    },
  },
};
