import { cn } from "@/lib/cn";

type BadgeVariant = "video" | "lesson" | "popular";

const variantClasses: Record<BadgeVariant, string> = {
  video: "bg-neutral-900 text-white",
  lesson: "bg-primary-100 text-primary-500",
  popular: "bg-primary-500 text-white",
};

export function Badge({
  variant = "lesson",
  children,
}: {
  variant?: BadgeVariant;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-xs px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
        variantClasses[variant]
      )}
    >
      {children}
    </span>
  );
}
