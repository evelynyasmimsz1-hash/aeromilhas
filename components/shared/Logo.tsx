import { Send } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type LogoProps = {
  showWordmark?: boolean;
  className?: string;
};

export function Logo({ showWordmark = true, className }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
        <Send className="h-4 w-4 -rotate-45" strokeWidth={2.25} />
      </span>
      {showWordmark && (
        <span className="text-lg font-semibold tracking-tight text-ink">
          Aeromilhas
        </span>
      )}
    </span>
  );
}
