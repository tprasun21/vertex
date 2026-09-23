import { CheckCircle2, Circle, Lock, PlayCircle } from "lucide-react";
import { cn } from "@/lib/cn";

type Status = "in-progress" | "completed" | "now-playing" | "locked";

const config: Record<Status, { icon: React.ElementType; label: string; className: string }> = {
  "in-progress": { icon: Circle, label: "In Progress", className: "text-primary-400" },
  completed: { icon: CheckCircle2, label: "Completed", className: "text-green-600" },
  "now-playing": { icon: PlayCircle, label: "Now Playing", className: "text-primary-500" },
  locked: { icon: Lock, label: "Locked", className: "text-neutral-500" },
};

export function StatusIndicator({ status }: { status: Status }) {
  const { icon: Icon, label, className } = config[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-sm font-medium", className)}>
      <Icon className="size-4" />
      {label}
    </span>
  );
}
