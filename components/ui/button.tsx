import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "tertiary" | "text";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary-500 text-white hover:bg-primary-400 disabled:bg-primary-200 disabled:text-white/70",
  secondary:
    "bg-white text-primary-500 border border-primary-500 hover:bg-primary-100 disabled:border-neutral-200 disabled:text-neutral-300",
  tertiary:
    "bg-transparent text-neutral-900 border border-neutral-200 hover:bg-neutral-100 disabled:text-neutral-300",
  text: "bg-transparent text-primary-500 hover:text-primary-400 disabled:text-neutral-300 h-auto px-0",
};

export function Button({
  variant = "primary",
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 h-11 rounded-md px-4 text-sm font-medium transition-colors disabled:cursor-not-allowed",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
