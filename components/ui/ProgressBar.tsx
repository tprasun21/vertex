export function ProgressBar({ value }: { value: number }) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className="flex items-center gap-3">
      <div className="h-1.5 flex-1 rounded-full bg-neutral-200">
        <div
          className="h-full rounded-full bg-primary-500 transition-[width]"
          style={{ width: `${clamped}%` }}
        />
      </div>
      <span className="text-sm text-neutral-500">{clamped}% complete</span>
    </div>
  );
}
