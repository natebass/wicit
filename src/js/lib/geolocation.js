/**
 * The Geolocation service wraps `navigator.geolocation` and caches the last position in `localStorage`
 * so repeat visits do not re-prompt.
 *
 * @see CACHE_LIFETIME
 */

const CACHE_LIFETIME = 86400000;
const STORAGE_KEY = "position";

/** How long to wait for a fix before rejecting, in milliseconds. */
const POSITION_TIMEOUT = 10000;

/** @type {GeolocationPosition | false} In-memory cache of the last known position. */
let cachedPosition = loadCachedPosition();

/**
 * Resolve `localStorage`, or null when it is unavailable.
 *
 * Safari throws a SecurityError on the `window.localStorage` access itself when
 * the user blocks cookies, so the access has to be guarded, not just the read.
 *
 * @return {Storage|null}
 */
function storage() {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage || null;
  } catch {
    return null;
  }
}

/**
 * Retrieves the cached position from localStorage if it exists and is still valid.
 * The position is considered invalid if it is older than a defined cache lifetime.
 *
 * @return {object|boolean} The cached position object if valid; otherwise, `false` if the cache is invalid or not available.
 */
function loadCachedPosition() {
  const store = storage();
  if (!store) return false;
  let position;
  try {
    position = JSON.parse(store.getItem(STORAGE_KEY));
  } catch {
    position = false;
  }
  const timestamp = position ? position.timestamp : 0;
  if (Date.now() - timestamp > CACHE_LIFETIME) {
    position = false;
  }
  return position;
}

/**
 * Encodes a position object into a JSON string containing the timestamp and coordinates data.
 *
 * @param {Object} pos - The position object containing geolocation data.
 * @param {Object} pos.coords - The coordinate object of the position.
 * @param {number} pos.coords.accuracy - The accuracy of the geolocation in meters.
 * @param {number} pos.coords.latitude - The latitude of the position in decimal degrees.
 * @param {number} pos.coords.longitude - The longitude of the position in decimal degrees.
 * @return {string} A JSON string representation of the position with timestamp and coordinates.
 */

function encodePosition(pos) {
  return JSON.stringify({
    timestamp: Date.now(),
    coords: {
      accuracy: pos.coords.accuracy,
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
    },
  });
}

/**
 * Resolve the user's current position, using the cached value unless forceUpdate` is set.
 * LocalStorage may be disabled; caching is best-effort.
 *
 * @param {Object} [options] - Options to configure the position retrieval behavior.
 * @param {boolean} [options.forceUpdate=false] - If true, forces a fresh position retrieval, bypassing any cached position.
 * @return {Promise<GeolocationPosition>} A promise that resolves with the user's geolocation position object.
 *                                       The promise rejects with an error message or a `GeolocationPositionError` if the retrieval fails.
 */
export function getPosition(options = {}) {
  return new Promise((resolve, reject) => {
    if (cachedPosition && !options.forceUpdate) {
      resolve(cachedPosition);
      return;
    }
    if (!navigator.geolocation) {
      reject("Geolocation error.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        cachedPosition = pos;
        resolve(pos);
        try {
          storage()?.setItem(STORAGE_KEY, encodePosition(pos));
        } catch {}
      },
      (error) => reject(error),
      // Without a timeout the prompt can hang indefinitely if the user neither
      // grants nor denies, leaving callers waiting on a promise that never settles.
      { timeout: POSITION_TIMEOUT },
    );
  });
}
