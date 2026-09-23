import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

export function Pagination({
  page,
  totalPages,
}: {
  page: number;
  totalPages: number;
}) {
  const pages = [1, 2, 3, "...", totalPages];

  return (
    <nav className="flex items-center gap-1 text-sm">
      <button
        disabled={page === 1}
        className="flex size-9 items-center justify-center rounded-sm text-neutral-500 hover:bg-neutral-100 disabled:opacity-40"
        aria-label="Previous page"
      >
        <ChevronLeft className="size-4" />
      </button>
      {pages.map((p, i) => (
        <span
          key={`${p}-${i}`}
          className={cn(
            "flex size-9 items-center justify-center rounded-sm font-medium",
            p === page
              ? "bg-primary-500 text-white"
              : p === "..."
                ? "text-neutral-500"
                : "text-neutral-700 hover:bg-neutral-100 cursor-pointer"
          )}
        >
          {p}
        </span>
      ))}
      <button
        disabled={page === totalPages}
        className="flex size-9 items-center justify-center rounded-sm text-neutral-500 hover:bg-neutral-100 disabled:opacity-40"
        aria-label="Next page"
      >
        <ChevronRight className="size-4" />
      </button>
    </nav>
  );
}
