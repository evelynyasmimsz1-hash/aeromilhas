import Link from "next/link";
import { Logo } from "@/components/shared/Logo";

export const metadata = { title: "Termos de Uso — Aeromilhas" };

export default function TermosPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <Link href="/" aria-label="Aeromilhas, início">
        <Logo />
      </Link>
      <h1 className="mt-8 text-2xl font-semibold tracking-tight text-ink">Termos de Uso</h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-ink-secondary">
        <p>
          O Aeromilhas é uma plataforma de organização de milhas e descoberta de
          oportunidades de viagem. Não somos uma agência de viagens e não emitimos
          passagens: a emissão final é sempre feita diretamente no programa de
          fidelidade ou parceiro correspondente.
        </p>
        <p>
          As informações de saldo e vencimento são fornecidas por você e têm caráter
          informativo. Consulte sempre o programa de fidelidade para confirmar valores
          antes de qualquer resgate.
        </p>
        <p>
          Ao criar uma conta, você concorda em fornecer informações verdadeiras e em usar
          a plataforma de forma responsável.
        </p>
      </div>
    </div>
  );
}
