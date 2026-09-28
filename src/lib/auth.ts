import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/lib/auth.config";
import { registrarLog } from "@/lib/auditoria";

const JANELA_RATE_LIMIT_MS = 15 * 60 * 1000; // 15 minutos
const MAX_TENTATIVAS = 5;

async function excedeuTentativas(email: string): Promise<boolean> {
  const desde = new Date(Date.now() - JANELA_RATE_LIMIT_MS);
  const tentativas = await prisma.tentativaLoginFalha.count({
    where: { email, createdAt: { gte: desde } },
  });
  return tentativas >= MAX_TENTATIVAS;
}

async function registrarFalha(email: string): Promise<void> {
  await prisma.tentativaLoginFalha.create({ data: { email } });
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;

        if (!email || !password) return null;

        // Bloqueia por e-mail antes mesmo de checar a senha — protege contra
        // força bruta sem revelar ao cliente se o bloqueio é por excesso de
        // tentativas ou credencial errada (a mensagem que aparece é a mesma).
        if (await excedeuTentativas(email)) {
          return null;
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
          await registrarFalha(email);
          return null;
        }

        const senhaValida = await bcrypt.compare(password, user.password);
        if (!senhaValida) {
          await registrarFalha(email);
          return null;
        }

        await registrarLog({ userId: user.id, acao: "auth.login" });

        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (session.user) session.user.id = token.id as string;
      return session;
    },
  },
});
