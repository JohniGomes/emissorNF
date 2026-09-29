import Link from "next/link";
import { Logo } from "@/components/logo";

export const metadata = {
  title: "Política de Privacidade - Notarium",
};

export default function PoliticaPrivacidadePage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-8 flex justify-center">
        <Logo size={40} />
      </div>

      <h1 className="mb-2 text-2xl font-semibold text-gray-900">Política de Privacidade</h1>
      <p className="mb-8 text-sm text-gray-500">Última atualização: setembro de 2026.</p>

      <div className="space-y-6 text-sm leading-relaxed text-gray-700">
        <section>
          <h2 className="mb-2 text-base font-semibold text-gray-900">1. O que fazemos</h2>
          <p>
            O Notarium é uma plataforma para emissão de notas fiscais de serviço (NFS-e) para
            MEIs, autônomos e pequenas empresas, integrada à Focus NFe para comunicação com as
            prefeituras e com a NFS-e Nacional.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-gray-900">2. Quais dados coletamos</h2>
          <p className="mb-2">Para você usar a plataforma, tratamos:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Dados da sua conta: nome, e-mail e senha (armazenada de forma criptografada).</li>
            <li>
              Dados da sua empresa: CNPJ, razão social, endereço, regime tributário, inscrição
              municipal e, quando aplicável, certificado digital (enviado direto ao provedor
              fiscal, nunca armazenado em nossos servidores).
            </li>
            <li>
              Dados dos seus clientes (tomadores de serviço): nome/razão social, CPF ou CNPJ,
              e-mail e endereço - necessários para emitir a nota fiscal em nome deles.
            </li>
            <li>Dados das notas emitidas: descrição do serviço, valor e o retorno da Focus NFe.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-gray-900">
            3. Com quem compartilhamos
          </h2>
          <p>
            Compartilhamos os dados estritamente necessários com a Focus NFe, nosso provedor de
            integração fiscal, para que a nota seja emitida junto à prefeitura ou à NFS-e
            Nacional. Não vendemos nem compartilhamos seus dados com terceiros para fins de
            marketing.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-gray-900">
            4. Como protegemos seus dados
          </h2>
          <p>
            Senhas são armazenadas com hash (nunca em texto puro). O token de integração fiscal
            da sua empresa é armazenado criptografado. Registramos um log de auditoria de ações
            sensíveis (login, emissão, alteração/exclusão de cliente) para investigação em caso
            de incidente.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-gray-900">5. Seus direitos (LGPD)</h2>
          <p>
            Você pode solicitar a qualquer momento a correção, exportação ou exclusão dos seus
            dados e dos dados das empresas/clientes que você cadastrou, respeitados os prazos
            legais de guarda de documentos fiscais. Entre em contato pelo e-mail{" "}
            <a
              href="mailto:suporte@notarium.com.br"
              className="text-brand-brown hover:underline"
            >
              suporte@notarium.com.br
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-gray-900">6. Alterações</h2>
          <p>
            Podemos atualizar esta política conforme o produto evolui. Mudanças relevantes serão
            comunicadas por e-mail ou dentro do próprio sistema.
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
