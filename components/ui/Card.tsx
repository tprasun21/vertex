import { BarChart2, Clock, FileText, Layers, PlayCircle, Download } from "lucide-react";
import { cn } from "@/lib/cn";
import { Badge } from "./badge";

export function CourseCard({
  icon,
  iconClassName,
  title,
  description,
  level,
  duration,
  modules,
  className,
}: {
  icon: React.ReactNode;
  iconClassName?: string;
  title: string;
  description: string;
  level: string;
  duration: string;
  modules: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-md border border-neutral-200 bg-white p-5 shadow-sm",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-sm text-white",
            !iconClassName && "bg-neutral-900",
            iconClassName
          )}
        >
          {icon}
        </span>
        <div>
          <h3 className="text-heading-3 font-medium text-neutral-900">{title}</h3>
          <p className="mt-1 text-body text-neutral-500">{description}</p>
        </div>
      </div>
      <div className="flex items-center gap-4 text-small text-neutral-500">
        <span className="inline-flex items-center gap-1">
          <BarChart2 className="size-3.5" />
          {level}
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock className="size-3.5" />
          {duration}
        </span>
        <span className="inline-flex items-center gap-1">
          <Layers className="size-3.5" />
          {modules}
        </span>
      </div>
    </div>
  );
}

export function LessonCard({
  badge,
  title,
  description,
  meta,
  action,
  className,
}: {
  badge: "video" | "lesson";
  title: string;
  description: string;
  meta: string;
  action: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-md border border-neutral-200 bg-white p-5 shadow-sm",
        className
      )}
    >
      <Badge variant={badge}>{badge}</Badge>
      <h3 className="text-heading-3 font-medium text-neutral-900">{title}</h3>
      <p className="text-body text-neutral-500">{description}</p>
      <div className="flex items-center justify-between text-small text-neutral-500">
        <span>{meta}</span>
        <span className="inline-flex items-center gap-1 font-medium text-primary-500">
          <PlayCircle className="size-3.5" />
          {action}
        </span>
      </div>
    </div>
  );
}

export function ResourceCard({
  title,
  description,
  meta,
  className,
}: {
  title: string;
  description: string;
  meta: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-md border border-neutral-200 bg-white p-5 shadow-sm",
        className
      )}
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-sm bg-neutral-100 text-neutral-700">
        <FileText className="size-5" />
      </span>
      <div className="flex-1">
        <h3 className="text-heading-3 font-medium text-neutral-900">{title}</h3>
        <p className="mt-1 text-body text-neutral-500">{description}</p>
        <div className="mt-2 flex items-center justify-between text-small text-neutral-500">
          <span>{meta}</span>
          <Download className="size-3.5" />
        </div>
      </div>
    </div>
  );
}
