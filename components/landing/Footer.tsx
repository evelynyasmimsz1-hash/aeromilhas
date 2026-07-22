import Link from "next/link";
import { Logo } from "@/components/shared/Logo";

const links = [
  { label: "Privacidade", href: "/privacidade" },
  { label: "Termos", href: "/termos" },
  { label: "Ajuda", href: "#ajuda" },
  { label: "Contato", href: "mailto:contato@aeromilhas.com.br" },
];

export function Footer() {
  return (
    <footer className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center gap-6 border-t border-border pt-8 sm:flex-row sm:justify-between">
        <Logo />
        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2" aria-label="Links institucionais">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm text-ink-secondary hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <p className="mt-6 text-center text-xs text-ink-muted sm:text-left">
        © {new Date().getFullYear()} Aeromilhas. Todos os direitos reservados.
      </p>
    </footer>
  );
}
