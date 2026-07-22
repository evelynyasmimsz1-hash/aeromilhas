import type { LucideIcon } from "lucide-react";

type ValueSlideProps = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export function ValueSlide({ icon: Icon, title, description }: ValueSlideProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center">
      <span className="animate-onboarding-float flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-secondary text-white shadow-xl shadow-primary/30">
        <Icon className="h-11 w-11" aria-hidden />
      </span>
      <h1 className="mt-8 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{title}</h1>
      <p className="mt-3 max-w-xs text-base leading-relaxed text-ink-secondary">{description}</p>
    </div>
  );
}
