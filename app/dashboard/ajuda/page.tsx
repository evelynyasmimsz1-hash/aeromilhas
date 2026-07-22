import { Mail } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { faqItems } from "@/data/faq";

export default function AjudaPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Central de ajuda" description="Respostas rápidas para as dúvidas mais comuns." />

      <div className="divide-y divide-border rounded-2xl border border-border bg-surface px-5">
        {faqItems.map((item) => (
          <div key={item.question} className="py-4">
            <p className="text-sm font-medium text-ink">{item.question}</p>
            <p className="mt-1 text-sm text-ink-secondary">{item.answer}</p>
          </div>
        ))}
      </div>

      <a
        href="mailto:contato@aeromilhas.com.br"
        className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 text-sm font-medium text-ink hover:bg-bg"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-blue text-primary">
          <Mail className="h-4 w-4" aria-hidden />
        </span>
        Falar com o suporte
      </a>
    </div>
  );
}
