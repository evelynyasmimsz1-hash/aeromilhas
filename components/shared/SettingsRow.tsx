import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";

type SettingsRowProps = {
  label: string;
  description?: string;
  href?: string;
  onClick?: () => void;
  right?: ReactNode;
  tone?: "default" | "danger";
};

export function SettingsRow({ label, description, href, onClick, right, tone = "default" }: SettingsRowProps) {
  const labelClass = tone === "danger" ? "text-danger" : "text-ink";

  const content = (
    <>
      <div className="min-w-0">
        <p className={`text-sm font-medium ${labelClass}`}>{label}</p>
        {description && <p className="mt-0.5 text-xs text-ink-secondary">{description}</p>}
      </div>
      {right ?? (href || onClick) ? (
        right ?? <ChevronRight className="h-4 w-4 shrink-0 text-ink-muted" aria-hidden />
      ) : null}
    </>
  );

  const className =
    "flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors hover:bg-bg";

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className}>
        {content}
      </button>
    );
  }

  return <div className={className}>{content}</div>;
}
