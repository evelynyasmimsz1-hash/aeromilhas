import { cn } from "@/lib/utils/cn";

export function LoadingSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-lg bg-border/60", className)}
      aria-hidden
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-center gap-3">
        <LoadingSkeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <LoadingSkeleton className="h-3.5 w-1/3" />
          <LoadingSkeleton className="h-3 w-1/2" />
        </div>
      </div>
    </div>
  );
}
