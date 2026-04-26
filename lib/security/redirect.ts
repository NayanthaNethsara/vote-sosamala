export function isSafeRelativePath(path: string): boolean {
  if (
    path.startsWith("//") ||
    path.includes("://") ||
    path.includes("\\") ||
    /[\r\n]/.test(path)
  ) {
    return false;
  }

  return path.startsWith("/");
}