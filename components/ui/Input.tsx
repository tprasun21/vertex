import { InputHTMLAttributes, SelectHTMLAttributes } from "react";
import { Search, ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

export function Input({
  className,
  hint,
  size = "md",
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & { hint?: string; size?: "md" | "lg" }) {
  const lg = size === "lg";
  return (
    <div className="relative">
      <Search
        className={cn(
          "pointer-events-none absolute top-1/2 -translate-y-1/2 text-neutral-500",
          lg ? "left-5 size-5" : "left-3.5 size-4"
        )}
      />
      <input
        className={cn(
          "w-full border border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-500 outline-none transition-colors focus:border-primary-400",
          lg ? "h-16 rounded-md pl-14 text-base shadow-sm" : "h-11 rounded-sm pl-10 text-sm",
          hint ? (lg ? "pr-20" : "pr-16") : lg ? "pr-5" : "pr-4",
          className
        )}
        {...props}
      />
      {hint && (
        <span
          className={cn(
            "pointer-events-none absolute top-1/2 -translate-y-1/2 border border-neutral-200 bg-neutral-50 font-medium text-neutral-500",
            lg ? "right-4 rounded-sm px-2 py-1 text-xs" : "right-3.5 rounded-xs px-1.5 py-0.5 text-[11px]"
          )}
        >
          {hint}
        </span>
      )}
    </div>
  );
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        className={cn(
          "h-11 w-full appearance-none rounded-sm border border-neutral-200 bg-white pl-4 pr-10 text-sm text-neutral-900 outline-none transition-colors focus:border-primary-400",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-neutral-500" />
    </div>
  );
}
