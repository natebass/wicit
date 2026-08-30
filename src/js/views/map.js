import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getPosition } from "../lib/geolocation.js";
import { addNotification, STATUSES } from "../lib/notifications.js";
import { locationsApiUrl, locationsResourceId, mapboxIntegrationUrl } from "../lib/config.js";
import { escapeHtml } from "../lib/utility.js";

const DEFAULT_ZOOM = 13;
const MAX_ZOOM = 18;
const MIN_ZOOM = 10;

/** How long to wait on the locations API before falling back to sample data, in milliseconds. */
const REQUEST_TIMEOUT = 10000;

/**
 * Create a request timeout signal, including support for browsers without AbortSignal.timeout.
 *
 * @param {number} timeout - Timeout in milliseconds.
 * @returns {AbortSignal}
 */
function createTimeoutSignal(timeout) {
  if (typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function") {
    return AbortSignal.timeout(timeout);
  }

  const controller = new AbortController();
  setTimeout(() => controller.abort(), timeout);
  return controller.signal;
}

/** @type {[number, number]} Default map center used until geolocation resolves. */
const DEFAULT_CENTER = [38.5556, -121.4689];

/**
 * Build a Leaflet icon definition with retina and shadow variants.
 *
 * @param {string} name - Base image name under `/image/` (e.g. `"pin"`).
 * @param {number} [size=30] - Square icon size in pixels.
 * @returns {L.Icon}
 */
function iconFactory(name, size = 30) {
  return new L.Icon({
    iconUrl: `${import.meta.env.BASE_URL}image/${name}.png`,
    iconRetinaUrl: `${import.meta.env.BASE_URL}image/${name}@2x.png`,
    shadowUrl: `${import.meta.env.BASE_URL}image/${name}_shadow.png`,
    iconSize: [size, size],
    shadowSize: [size, size],
    iconAnchor: [0, size / 2],
    shadowAnchor: [0, size / 2],
    popupAnchor: [size / 2, -10],
  });
}

/**
 * Determines if a given URL is a valid tile template.
 *
 * @param {string} url - The URL to validate as a tile template.
 * @return {boolean} Returns true if the URL is a valid tile template, otherwise false.
 */
function isTileTemplate(url) {
  return typeof url === "string" && /^https?:\/\//.test(url) && url.includes("{z}");
}

/**
 * Recalculate the map's size whenever its container is resized.
 *
 * Leaflet 1.x only tracks the window's `resize` event, which iOS Safari does not
 * fire when the address bar collapses or expands. The container still changes
 * height, so the map keeps a stale size and renders blank. Leaflet 2.x watches
 * the container with a ResizeObserver; this restores that behavior.
 *
 * @param {L.Map} map - The Leaflet map instance.
 * @param {Element} container - The map's container element.
 */
function observeContainerSize(map, container) {
  if (typeof ResizeObserver === "undefined") return;
  const observer = new ResizeObserver(() => map.invalidateSize({ debounceMoveend: true }));
  observer.observe(container);
  map.on("unload", () => observer.disconnect());
}

/**
 * Trim a value to a string, treating nullish as empty.
 *
 * @param {unknown} value
 * @returns {string}
 */
const clean = (value) => String(value ?? "").trim();

/**
 * Normalize a record from CHHS into a common vendor shape.
 *
 * @param {Object} record - The input record containing vendor details.
 * @param {string} record.VENDOR - The name of the vendor.
 * @param {string} record.ADDRESS - The primary address of the vendor.
 * @param {string} record["SECOND ADDRESS"] - The secondary address of the vendor.
 * @param {string} record.CITY - The city of the vendor.
 * @param {string} record.ZIP - The ZIP code of the vendor.
 * @param {string} record.COUNTY - The county of the vendor.
 * @param {string|number} record.LATITUDE - The latitude of the vendor's location.
 * @param {string|number} record.LONGITUDE - The longitude of the vendor's location.
 * @return {Object} An object containing normalized properties: name, address, secondAddress, city, zip, county, lat, and lng.
 *
 * @see record
 */
function normalizeLive(record) {
  return {
    name: clean(record["VENDOR"]),
    address: clean(record["ADDRESS"]),
    secondAddress: clean(record["SECOND ADDRESS"]),
    city: clean(record["CITY"]),
    zip: clean(record["ZIP"]),
    county: clean(record["COUNTY"]),
    lat: parseFloat(record["LATITUDE"]),
    lng: parseFloat(record["LONGITUDE"]),
  };
}

/**
 * Normalize a bundled sample record (nested `location`) into the common vendor shape produced by {@link normalizeLive}.
 *
 * @param {Record<string, any>} r - Raw sample record.
 * @returns {object}
 */
function normalizeSample(r) {
  return {
    name: clean(r.vendor),
    address: clean(r.address),
    secondAddress: clean(r.second_address),
    city: clean(r.city),
    zip: clean(r.zip_code),
    county: clean(r.county),
    lat: parseFloat(r.location && r.location.latitude),
    lng: parseFloat(r.location && r.location.longitude),
  };
}

/**
 * Render the map's container element.
 *
 * @returns {string} HTML for the map container.
 */
export function MapView() {
  return `<div id="map-container" class="loading"></div>`;
}

/**
 * Initialize the Leaflet map after {@link MapView} is in the DOM. Renders
 * regardless of Mapbox configuration; the base tile layer is added only when a
 * usable tile template is present.
 */
export function initMapView() {
  const container = document.querySelector("#map-container");
  if (!container) return;

  /** Clear the container's loading state. */
  function stopLoading() {
    container.classList.remove("loading");
  }

  let pinIcon, markerIcon, map, userMarker, vendorLayer;

  // Any throw during setup would otherwise leave the container stuck on its
  // loading spinner with nothing surfaced to the user or the console.
  try {
    pinIcon = iconFactory("pin");
    markerIcon = iconFactory("marker");

    map = new L.Map(container, {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      minZoom: MIN_ZOOM,
      maxZoom: MAX_ZOOM,
      zoomControl: false,
    });
    new L.Control.Zoom({ position: "bottomright" }).addTo(map);

    if (isTileTemplate(mapboxIntegrationUrl)) {
      new L.TileLayer(mapboxIntegrationUrl, {
        maxZoom: MAX_ZOOM,
        minZoom: MIN_ZOOM,
        detectRetina: true,
      }).addTo(map);
    }

    userMarker = new L.Marker(DEFAULT_CENTER, { icon: pinIcon }).addTo(map);
    vendorLayer = new L.LayerGroup().addTo(map);
    observeContainerSize(map, container);
  } catch (error) {
    console.error("Map failed to initialize:", error);
    stopLoading();
    addNotification({
      message: `Dang, the map couldn't load on this browser. ${error?.message ?? error}`,
      status: STATUSES.ERROR,
    });
    return;
  }

  const seenVendors = new Set();

  addLocateControl(map, () => geolocate({ forceUpdate: true }));

  /**
   * Center the map on the user's position or notify on failure.
   *
   * @param {{ forceUpdate?: boolean }} [options]
   */
  function geolocate(options) {
    getPosition(options).then(
      (position) => {
        stopLoading();
        const latlng = [position.coords.latitude, position.coords.longitude];
        map.setView(latlng, DEFAULT_ZOOM);
        userMarker.setLatLng(latlng);
      },
      (error) => {
        const message =
          error && error.code === error.PERMISSION_DENIED
            ? "Dang, geolocation is disabled."
            : "Dang, we can't get your location.";
        addNotification({ message, status: STATUSES.ERROR });
        stopLoading();
      },
    );
  }

  let prevBounds = null;

  /**
   * Fetch and render vendors within the current viewport bounds.
   * */
  function updateNearbyLocations() {
    const bounds = map.getBounds();
    if (prevBounds && prevBounds.contains(bounds)) {
      stopLoading();
      return;
    }
    prevBounds = bounds;

    const sql =
      `SELECT * FROM "${locationsResourceId}" ` +
      `WHERE "LONGITUDE" BETWEEN ${bounds.getWest()} AND ${bounds.getEast()} ` +
      `AND "LATITUDE" BETWEEN ${bounds.getSouth()} AND ${bounds.getNorth()}`;
    const url = `${locationsApiUrl}?sql=${encodeURIComponent(sql)}`;

    fetch(url, {
      headers: { Accept: "application/json" },
      signal: createTimeoutSignal(REQUEST_TIMEOUT),
    })
      .then((response) => {
        if (!response.ok) throw new Error(`Request failed: ${response.status}`);
        return response.json();
      })
      .then((data) => {
        const records = (data.result && data.result.records) || [];
        renderVendors(records.map(normalizeLive));
        stopLoading();
      })
      .catch(() => useSampleFallback(bounds));
  }

  /**
   * Render bundled sample locations within view when the live API is
   * unreachable.
   *
   * @param {L.LatLngBounds} bounds - Current viewport bounds.
   */
  function useSampleFallback(bounds) {
    import("../../../sample_data/wic_locations.json")
      .then((m) => {
        const inView = m.default
          .map(normalizeSample)
          .filter((v) => !Number.isNaN(v.lat) && bounds.contains([v.lat, v.lng]));
        renderVendors(inView);
        addNotification({
          message: "Showing sample locations (live data unavailable).",
          status: STATUSES.INFO,
        });
        stopLoading();
      })
      .catch(() => {
        addNotification({
          message: "Unable to load nearby locations.",
          status: STATUSES.ERROR,
        });
        stopLoading();
      });
  }

  /**
   * Add a marker for each vendor.
   *
   * @param {object[]} vendors - Normalized vendor records.
   */
  function renderVendors(vendors) {
    vendors.forEach(addVendorMarker);
  }

  /**
   * Add a single vendor marker, deduping by a name-derived key and skipping
   * records without valid coordinates.
   *
   * @param {object} vendor - A normalized vendor record.
   */
  function addVendorMarker(vendor) {
    const key = vendor.name.replace(/\W/g, "");
    if (!key || seenVendors.has(key)) return;
    seenVendors.add(key);
    if (Number.isNaN(vendor.lat) || Number.isNaN(vendor.lng)) return;

    let address = vendor.address;
    if (vendor.secondAddress && vendor.secondAddress.indexOf('"') < 0) {
      address += ` ${vendor.secondAddress}`;
    }
    address += `, ${vendor.city} ${vendor.zip}`;

    const directions = `https://maps.google.com?saddr=Current+Location&daddr=${encodeURIComponent(address)}`;
    const popup = `
      <h3>${escapeHtml(vendor.name)}</h3>
      <p class="address">${escapeHtml(address)}</p>
      <p class="directions"><a href="${directions}" target="_blank" rel="noopener">Directions</a></p>
    `;

    new L.Marker([vendor.lat, vendor.lng], { icon: markerIcon })
      .bindPopup(popup)
      .addTo(vendorLayer);
  }

  map.on("moveend", updateNearbyLocations);

  geolocate();
  updateNearbyLocations();
}

/**
 * Add a custom "locate me" control to the map.
 *
 * @param {L.Map} map - The Leaflet map instance.
 * @param {() => void} onClick - Handler invoked when the control is clicked.
 */
function addLocateControl(map, onClick) {
  const LocateControl = L.Control.extend({
    options: { position: "bottomright" },
    onAdd() {
      const container = L.DomUtil.create("div", "locate-control");
      L.DomEvent.on(container, "click", (e) => {
        L.DomEvent.stop(e);
        onClick();
      });
      return container;
    },
  });
  map.addControl(new LocateControl());
}
