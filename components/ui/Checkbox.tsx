import { forwardRef } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: ReactNode;
  error?: string;
};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div>
        <label className="flex cursor-pointer items-start gap-2.5 text-sm text-ink-secondary" htmlFor={id}>
          <input
            ref={ref}
            type="checkbox"
            id={id}
            className={cn(
              "mt-0.5 h-4 w-4 shrink-0 rounded border-border text-primary focus:ring-2 focus:ring-primary/30",
              className,
            )}
            {...props}
          />
          <span>{label}</span>
        </label>
        {error && <p className="mt-1 text-xs text-danger">{error}</p>}
      </div>
    );
  },
);

Checkbox.displayName = "Checkbox";
