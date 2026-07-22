import Link from "next/link";
import { Logo } from "@/components/shared/Logo";

export const metadata = { title: "Privacidade — Aeromilhas" };

export default function PrivacidadePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <Link href="/" aria-label="Aeromilhas, início">
        <Logo />
      </Link>
      <h1 className="mt-8 text-2xl font-semibold tracking-tight text-ink">
        Política de Privacidade
      </h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-ink-secondary">
        <p>
          O Aeromilhas coleta apenas os dados necessários para organizar seus saldos de
          milhas e mostrar oportunidades relevantes: nome, e-mail, programas de
          fidelidade, saldos informados por você e destinos de interesse.
        </p>
        <p>
          Nunca solicitamos a senha das suas contas em programas de fidelidade. Os dados
          são armazenados de forma segura e não são compartilhados com terceiros para
          fins de marketing.
        </p>
        <p>
          Você pode solicitar a exclusão da sua conta e dos seus dados a qualquer momento
          pelas configurações da conta.
        </p>
      </div>
    </div>
  );
}
