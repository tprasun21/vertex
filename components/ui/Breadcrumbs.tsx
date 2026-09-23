import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-neutral-500">
      {items.map((item, i) => (
        <span key={`${i}-${item.label}`} className="flex items-center gap-2">
          {i > 0 && <ChevronRight className="size-3.5 shrink-0" />}
          {item.href ? (
            <Link href={item.href} className="hover:text-primary-500">
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-neutral-900">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
