// "45m", "1h 12m", "18h 24m"
export function formatDuration(minutes: number | null | undefined) {
  const total = Math.max(0, Math.round(minutes ?? 0));
  const hours = Math.floor(total / 60);
  const rest = total % 60;
  if (hours === 0) return `${rest}m`;
  return rest === 0 ? `${hours}h` : `${hours}h ${rest}m`;
}

const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });

// "2.1k"
export function formatCount(value: number) {
  return compact.format(value).toLowerCase();
}

// "12 modules", "1 module"
export function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
