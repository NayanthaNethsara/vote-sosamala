export function slugifyContestantName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function createContestantSlug(name: string, id: string): string {
  const readableName = slugifyContestantName(name) || "contestant";
  return `${readableName}--${id}`;
}

export function extractContestantIdFromSlug(slug: string): string | null {
  const marker = "--";
  const markerIndex = slug.lastIndexOf(marker);

  if (markerIndex === -1) {
    return null;
  }

  const id = slug.slice(markerIndex + marker.length).trim();
  return id.length > 0 ? id : null;
}
