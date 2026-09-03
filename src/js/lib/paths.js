/**
 * Build URLs that work on both a root domain and a GitHub Pages project site.
 */
export function basePath(path) {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;
}
