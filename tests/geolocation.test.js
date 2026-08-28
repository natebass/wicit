import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";

/**
 * A minimal in-memory localStorage stand-in, so the test doesn't require a DOM environment.
 */
function makeStorage() {
  const store = {};
  return {
    getItem: (key) => (key in store ? store[key] : null),
    setItem: (key, value) => {
      store[key] = String(value);
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      for (const key of Object.keys(store)) delete store[key];
    },
  };
}

/**
 * Build a GeolocationPosition-shaped object.
 *
 * @param {number} latitude - The latitude value of the position.
 * @param {number} longitude - The longitude value of the position.
 * @return {Object} A position object with coordinates including latitude, longitude, and accuracy.
 */
function makePosition(latitude, longitude) {
  return { coords: { accuracy: 10, latitude, longitude } };
}

/**
 * Import a fresh copy of the service with globals stubbed.
 * Resetting modules clears the module-level position cache between cases.
 */
async function loadService(geolocation) {
  const localStorage = makeStorage();
  vi.stubGlobal("localStorage", localStorage);
  vi.stubGlobal("window", { localStorage });
  vi.stubGlobal("navigator", geolocation ? { geolocation } : {});
  vi.resetModules();
  return import("../src/js/lib/geolocation.js");
}

describe("geolocation service", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("resolves with the navigator position when nothing is cached", async () => {
    const position = makePosition(38.5556, -121.4689);
    const getCurrentPosition = vi.fn((success) => success(position));
    const { getPosition } = await loadService({ getCurrentPosition });

    await expect(getPosition()).resolves.toBe(position);
    expect(getCurrentPosition).toHaveBeenCalledTimes(1);
  });

  it("returns the cached position on the second call without re-querying", async () => {
    const position = makePosition(34.05, -118.25);
    const getCurrentPosition = vi.fn((success) => success(position));
    const { getPosition } = await loadService({ getCurrentPosition });

    const first = await getPosition();
    const second = await getPosition();

    expect(first).toBe(position);
    expect(second).toBe(first);
    // Second call should be served from cache, so the navigator is hit once.
    expect(getCurrentPosition).toHaveBeenCalledTimes(1);
  });

  it("rejects with the navigator error", async () => {
    const getCurrentPosition = vi.fn((_success, error) => error("Error occured!"));
    const { getPosition } = await loadService({ getCurrentPosition });

    await expect(getPosition()).rejects.toBe("Error occured!");
  });

  it("rejects when geolocation is unavailable", async () => {
    const { getPosition } = await loadService(null);

    await expect(getPosition()).rejects.toBe("Geolocation error.");
  });
});
