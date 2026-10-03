/** Public files and native navigation need the mount path; next/link adds it itself. */
export function sitePath(path: string, basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ""): string {
  const base = basePath.replace(/\/$/, "");
  if (!base || !path.startsWith("/") || path.startsWith("//")) return path;
  if (path === base || path.startsWith(`${base}/`) || path.startsWith(`${base}?`) || path.startsWith(`${base}#`)) return path;
  return `${base}${path}`;
}
