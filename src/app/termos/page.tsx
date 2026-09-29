import Link from "next/link";
import { Logo } from "@/components/logo";

export const metadata = {
  title: "Termos de Uso | Notarium",
};

export default function TermosDeUsoPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-8 flex justify-center">
        <Logo size={40} />
      </div>

      <h1 className="mb-2 text-2xl font-semibold text-gray-900">Termos de Uso</h1>
      <p className="mb-8 text-sm text-gray-500">Última atualização: setembro de 2026.</p>

      <div className="space-y-6 text-sm leading-relaxed text-gray-700">
        <section>
          <h2 className="mb-2 text-base font-semibold text-gray-900">1. Aceitação</h2>
          <p>
            Ao criar uma conta no Notarium, você concorda com estes Termos de Uso e com a nossa{" "}
            <Link href="/privacidade" className="text-brand-brown hover:underline">
              Política de Privacidade
            </Link>
            .
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-gray-900">2. O serviço</h2>
          <p>
            O Notarium é uma ferramenta que facilita o preenchimento e o envio de notas fiscais
            de serviço (NFS-e) através da integração com um provedor fiscal. O Notarium não é
            uma prefeitura, não é a Receita Federal, e não substitui a orientação de um contador.
            Somos uma camada de software sobre a infraestrutura fiscal já existente.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-gray-900">
            3. Responsabilidade pelos dados fiscais
          </h2>
          <p>
            Você é responsável pela exatidão dos dados informados (regime tributário, código de
            tributação do serviço, valores, dados do cliente). O Notarium repassa esses dados ao
            provedor fiscal e não valida seu enquadramento tributário. Recomendamos sempre
            revisar com seu contador antes de emitir, especialmente em caso de dúvida sobre
            código de serviço ou regime especial de tributação.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-gray-900">
            4. Disponibilidade e limitações
          </h2>
          <p>
            O Notarium depende da disponibilidade do provedor fiscal e dos sistemas das
            prefeituras e da NFS-e Nacional, fora do nosso controle direto. Notas podem ser rejeitadas por
            motivos fiscais alheios à nossa plataforma (ex: cadastro incompleto na prefeitura,
            código de serviço inválido para o município). Fazemos o possível para traduzir esses
            erros de forma clara, mas a autorização final é sempre do órgão fiscal competente.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-gray-900">5. Conta e segurança</h2>
          <p>
            Você é responsável por manter sua senha em sigilo e por todas as ações realizadas na
            sua conta. Cada empresa cadastrada tem um único login; não compartilhamos acesso
            multiusuário nesta versão do produto.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-gray-900">6. Cancelamento</h2>
          <p>
            Você pode encerrar sua conta a qualquer momento entrando em contato pelo e-mail{" "}
            <a
              href="mailto:suporte@notarium.com.br"
              className="text-brand-brown hover:underline"
            >
              suporte@notarium.com.br
            </a>
            . Documentos fiscais já emitidos permanecem acessíveis conforme o prazo legal de
            guarda.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-gray-900">7. Alterações</h2>
          <p>
            Podemos atualizar estes termos conforme o produto evolui. O uso contínuo da
            plataforma após uma atualização implica aceitação dos novos termos.
          </p>
        </section>
      </div>

      <p className="mt-10 text-center text-sm">
        <Link href="/" className="text-brand-brown hover:underline">
          ← Voltar
        </Link>
      </p>
    </main>
  );
}
