import Link from "next/link";
import type { ComponentProps } from "react";
import { buttonClasses, type ButtonSize, type ButtonVariant } from "./Button";

type LinkButtonProps = ComponentProps<typeof Link> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
};

export function LinkButton({
  className,
  variant = "primary",
  size = "md",
  fullWidth,
  ...props
}: LinkButtonProps) {
  return <Link className={buttonClasses({ variant, size, fullWidth, className })} {...props} />;
}
