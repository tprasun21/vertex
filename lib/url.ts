// Content links are validated in the Studio, but imports can bypass validation.
export function isSafeHref(href: string | null | undefined): href is string {
  return typeof href === "string" && /^(https?:|mailto:)/i.test(href);
}
