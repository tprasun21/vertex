import { InputHTMLAttributes, SelectHTMLAttributes } from "react";
import { Search, ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-neutral-500" />
      <input
        className={cn(
          "h-11 w-full rounded-sm border border-neutral-200 bg-white pl-10 pr-4 text-sm text-neutral-900 placeholder:text-neutral-500 outline-none transition-colors focus:border-primary-400",
          className
        )}
        {...props}
      />
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
