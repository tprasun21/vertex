"use client";

import { useEffect, useRef } from "react";
import posthog from "posthog-js";

type LessonViewProperties = {
  lesson_id: string;
  lesson_slug: string;
  lesson_label: string;
  lesson_duration_minutes: number;
  module_number: number;
  course_id: string;
  course_slug: string;
};

export function LessonViewTracker(properties: LessonViewProperties) {
  // Refs survive Strict Mode's double effect, so each lesson is captured once.
  const capturedLessonId = useRef<string | null>(null);

  useEffect(() => {
    if (capturedLessonId.current === properties.lesson_id) return;
    capturedLessonId.current = properties.lesson_id;
    posthog.capture("lesson_viewed", properties);
  }, [properties]);

  return null;
}
