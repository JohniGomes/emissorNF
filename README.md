# Emissor NFs

Plataforma para automatizar a emissão de NFS-e (notas fiscais de serviço) para MEI, autônomos e pequenas empresas, com foco em eliminar o preenchimento repetitivo e automatizar notas recorrentes.

## Stack

- **Next.js 14+ (App Router, TypeScript, Tailwind)** — front-end e API em um único projeto.
- **PostgreSQL (Supabase) + Prisma** — persistência de empresas, clientes e notas.
- **NextAuth.js** — autenticação.
- **Focus NFe** — provedor da integração fiscal com prefeituras (NFS-e), começando em ambiente sandbox (gratuito).
- **Vercel Cron Jobs** — motor de notas recorrentes agendadas (dispara `/api/cron/notas-recorrentes` diariamente, ver `vercel.json`).
- **Deploy: GitHub → Vercel**, banco em **Supabase**.

## Setup local

1. Crie um projeto gratuito no [Supabase](https://supabase.com). Em **Project Settings → Database → Connection string**, copie:
   - a connection string com pooling (porta `6543`) → `DATABASE_URL`
   - a connection string direta (porta `5432`) → `DIRECT_URL`

2. Copie o arquivo de variáveis de ambiente e preencha:

   ```bash
   cp .env.example .env
   ```

   Preencha `DATABASE_URL`, `DIRECT_URL`, `NEXTAUTH_SECRET`, `ENCRYPTION_KEY` e `CRON_SECRET` (gere os segredos com `openssl rand -base64 32`).

3. Crie uma conta gratuita na [Focus NFe](https://focusnfe.com.br), pegue o **token de homologação (sandbox)** e coloque em `FOCUS_NFE_TOKEN`. Mantenha `FOCUS_NFE_ENV=sandbox` até estar pronto para produção.

4. Instale as dependências e aplique as migrations:

   ```bash
   npm install
   npx prisma migrate dev
   ```

5. Rode o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

   Acesse [http://localhost:3000](http://localhost:3000).

## Deploy

1. Suba o repositório no GitHub.
2. Importe o repositório na [Vercel](https://vercel.com).
3. Configure as mesmas variáveis de ambiente do `.env` nas configurações do projeto na Vercel (Environment Variables).
4. A Vercel detecta o `vercel.json` e agenda automaticamente o cron das notas recorrentes.

## Estrutura

```
prisma/schema.prisma                       Modelo de dados (User, Empresa, Cliente, Nota, NotaRecorrente)
src/app/                                   Páginas e rotas de API (Next.js App Router)
src/app/api/cron/notas-recorrentes/        Rota chamada pelo Vercel Cron para emitir notas recorrentes
src/lib/focusnfe.ts                        Client de integração com a API da Focus NFe
src/lib/auth.ts                            Configuração do NextAuth
src/lib/prisma.ts                          Cliente Prisma singleton
vercel.json                                Agendamento do cron de notas recorrentes
```

## Status

Projeto em fase inicial (esqueleto). Próximos passos: telas de cadastro de empresa/cliente, fluxo de emissão de nota, lógica do motor de recorrência.
