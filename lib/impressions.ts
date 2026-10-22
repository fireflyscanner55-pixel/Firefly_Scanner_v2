
import type { UserImpression } from "@/types/radioanalysis";

export function getImpressions(
  value: unknown
): UserImpression[] {
  if (Array.isArray(value)) {
    return value.filter(
      (item): item is UserImpression =>
        item &&
        typeof item.title === "string" &&
        typeof item.description === "string"
    );
  }

  if (
    value &&
    typeof value === "object" &&
    "title" in value &&
    "description" in value
  ) {
    const entry = value as UserImpression;

    if (
      typeof entry.title === "string" &&
      typeof entry.description === "string"
    ) {
      return [entry];
    }
  }

  return [];
}
