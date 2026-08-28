/**
 * The mapbox tile-layer template URL.
 *
 * @type {string}
 */
export const mapboxIntegrationUrl = import.meta.env.VITE_MAPBOX_INTEGRATION_URL || "";

/**
 * The endpoint for the California WIC vendor locations.
 *
 * @type {string}
 */
export const locationsApiUrl = import.meta.env.VITE_LOCATIONS_API_URL;

/**
 * The datastore resource id queried by {@link locationsApiUrl}.
 *
 * @type {string}
 */
export const locationsResourceId = import.meta.env.VITE_LOCATIONS_RESOURCE_ID;

/**
 * Determines if a given URL is a valid tile template.
 *
 * @param {string} url - The URL to validate as a tile template.
 * @return {boolean} Returns true if the URL is a valid tile template, otherwise false.
 */
export function isTileTemplate(url) {
  return typeof url === "string" && /^https?:\/\//.test(url) && url.includes("{z}");
}
