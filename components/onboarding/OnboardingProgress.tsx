import { cn } from "@/lib/utils/cn";

export function OnboardingProgress({ step, totalSteps }: { step: number; totalSteps: number }) {
  return (
    <div className="flex items-center gap-2" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={totalSteps}>
      {Array.from({ length: totalSteps }).map((_, index) => (
        <span
          key={index}
          className={cn(
            "h-1.5 flex-1 rounded-full transition-all duration-300",
            index < step
              ? "bg-gradient-to-r from-primary to-secondary"
              : "bg-border",
          )}
        />
      ))}
    </div>
  );
}
