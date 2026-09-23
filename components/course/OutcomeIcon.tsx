import {
  BookOpen,
  Cloud,
  Code,
  Database,
  Gauge,
  Layers,
  Lock,
  Puzzle,
  Rocket,
  Server,
  Shield,
  Sparkles,
  Terminal,
  Workflow,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { COURSE_BY_SLUG_QUERY_RESULT } from "@/sanity.types";

type OutcomeIconName = NonNullable<
  NonNullable<COURSE_BY_SLUG_QUERY_RESULT>["learningOutcomes"]
>[number]["icon"];

// Keys mirror OUTCOME_ICONS in studio/schemaTypes/objects/learning-outcome.ts.
const icons: Record<OutcomeIconName, LucideIcon> = {
  "book-open": BookOpen,
  cloud: Cloud,
  code: Code,
  database: Database,
  gauge: Gauge,
  layers: Layers,
  lock: Lock,
  puzzle: Puzzle,
  rocket: Rocket,
  server: Server,
  shield: Shield,
  sparkles: Sparkles,
  terminal: Terminal,
  workflow: Workflow,
  zap: Zap,
};

export function OutcomeIcon({ name, className }: { name: OutcomeIconName; className?: string }) {
  const Icon = icons[name] ?? Sparkles;
  return <Icon aria-hidden="true" strokeWidth={1.25} className={className} />;
}
