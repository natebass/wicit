/**
 * The i18n runtime.
 *
 * Message catalogs are flat `key -> string` JSON files under `locales/`, loaded on demand and
 * cached. Lookups fall back to {@link DEFAULT_LOCALE} key by key, so a partially translated
 * catalog renders translated where it can and English everywhere else — which is what the stub
 * catalogs rely on until they are filled in.
 *
 * Views render through template literals into `innerHTML`, so catalog values are trusted HTML:
 * a message may contain markup (links, `<em>`, list items). Interpolated values are not trusted.
 * Use {@link t} for text destinations (`textContent`, attributes set through the DOM) and
 * {@link tHtml} wherever the result is interpolated into an `innerHTML` template, since only
 * `tHtml` escapes its placeholder values.
 *
 * @see locales.js for the supported languages.
 */
import { DEFAULT_LOCALE, LOCALES, resolveLocale } from "./locales.js";
import { escapeHtml } from "../lib/utility.js";

/** The `localStorage` key holding the visitor's explicit language choice. */
const STORAGE_KEY = "locale";

/** The query-string parameter that overrides the stored and detected language. */
const QUERY_KEY = "lang";

/**
 * Lazy `import()` thunks for every catalog, keyed by module path.
 * Vite resolves this at build time, so catalogs are code-split per language.
 */
const catalogLoaders = import.meta.glob("./locales/*.json");

/** @type {Map<string, Record<string, string>>} Catalogs already fetched, keyed by locale. */
const catalogs = new Map();

/** @type {Set<(locale: string) => void>} Subscribers notified after the locale changes. */
const listeners = new Set();

/** @type {string} The locale currently rendering. */
let activeLocale = DEFAULT_LOCALE;

/**
 * Resolve `localStorage`, or null when it is unavailable.
 *
 * Safari throws a SecurityError on the `window.localStorage` access itself when the user blocks
 * cookies, so the access has to be guarded, not just the read.
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
 * Fetch a locale's catalog, caching both hits and misses so a broken or absent catalog is only
 * ever reported once.
 *
 * @param {string} locale - A supported locale code.
 * @return {Promise<Record<string, string>>} The catalog, or an empty object when it cannot load.
 */
async function loadCatalog(locale) {
  const cached = catalogs.get(locale);
  if (cached) return cached;

  const load = catalogLoaders[`./locales/${locale}.json`];
  if (!load) {
    console.warn(`No message catalog for "${locale}"; falling back to ${DEFAULT_LOCALE}.`);
    catalogs.set(locale, {});
    return {};
  }

  try {
    const module = await load();
    const catalog = module.default ?? module;
    catalogs.set(locale, catalog);
    return catalog;
  } catch (error) {
    console.error(`Failed to load the "${locale}" message catalog:`, error);
    catalogs.set(locale, {});
    return {};
  }
}

/**
 * Substitute `{placeholder}` tokens in a message.
 *
 * @param {string} message - The message template.
 * @param {Record<string, unknown>} params - Values to substitute, keyed by placeholder name.
 * @param {boolean} escape - Whether to HTML-escape each substituted value.
 * @return {string} The interpolated message. Unknown placeholders are left as written, so a
 *                  translator's typo shows up in the UI instead of silently blanking the value.
 */
function interpolate(message, params, escape) {
  return message.replace(/\{(\w+)\}/g, (token, name) => {
    if (!Object.hasOwn(params, name)) return token;
    const value = String(params[name] ?? "");
    return escape ? escapeHtml(value) : value;
  });
}

/**
 * Look a key up in the active catalog, then the default catalog.
 *
 * @param {string} key - The message key.
 * @return {string|null} The raw message, or null when neither catalog defines it.
 */
function lookup(key) {
  const active = catalogs.get(activeLocale);
  if (active && typeof active[key] === "string") return active[key];
  const fallback = catalogs.get(DEFAULT_LOCALE);
  if (fallback && typeof fallback[key] === "string") return fallback[key];
  return null;
}

/**
 * Translate a message key.
 *
 * Placeholder values are substituted verbatim. Use this for text destinations — notification
 * messages, `textContent`, attributes assigned through the DOM — and {@link tHtml} when the
 * result is interpolated into an `innerHTML` template alongside untrusted values.
 *
 * @param {string} key - The message key, e.g. `"nav.map"`.
 * @param {Record<string, unknown>} [params] - Values for `{placeholder}` tokens in the message.
 * @return {string} The translated message, or the key itself when it is not defined anywhere.
 *
 * @example
 * t("search.resultCount", { shown: 25, total: 132 });
 */
export function t(key, params = {}) {
  const message = lookup(key);
  if (message === null) {
    console.warn(`Missing message for key "${key}".`);
    return key;
  }
  return interpolate(message, params, false);
}

/**
 * Translate a message key for an HTML context, escaping every interpolated value.
 *
 * The message itself is still treated as trusted markup; only the `params` are escaped.
 *
 * @param {string} key - The message key.
 * @param {Record<string, unknown>} [params] - Values for `{placeholder}` tokens in the message.
 * @return {string} The translated message with its placeholders escaped and substituted.
 *
 * @example
 * tHtml("search.noResults", { query: userInput });
 */
export function tHtml(key, params = {}) {
  const message = lookup(key);
  if (message === null) {
    console.warn(`Missing message for key "${key}".`);
    return escapeHtml(key);
  }
  return interpolate(message, params, true);
}

/**
 * Translate a countable message, choosing the plural form the active language needs.
 *
 * The catalog stores one key per CLDR plural category, suffixed onto the base key
 * (`foo.one`, `foo.other`, and for languages that need them `foo.zero`, `foo.two`, `foo.few`,
 * `foo.many`). `{count}` is available to every form.
 *
 * @param {string} key - The base message key, without a plural suffix.
 * @param {number} count - The number the message is about.
 * @param {Record<string, unknown>} [params] - Additional placeholder values.
 * @return {string} The translated message for the matching plural form.
 *
 * @example
 * tCount("search.results", matches.length);
 */
export function tCount(key, count, params = {}) {
  const category = new Intl.PluralRules(activeLocale).select(count);
  const suffixed = `${key}.${category}`;
  return t(lookup(suffixed) === null ? `${key}.other` : suffixed, { ...params, count });
}

/**
 * Format a number for the active locale.
 *
 * @param {number} value - The number to format.
 * @param {Intl.NumberFormatOptions} [options] - Passed through to `Intl.NumberFormat`.
 * @return {string} The localized number.
 */
export function formatNumber(value, options = {}) {
  return new Intl.NumberFormat(activeLocale, options).format(value);
}

/**
 * Format an amount of money for the active locale.
 *
 * WIC benefits are US dollars regardless of the reader's language, so the currency is fixed and
 * only its presentation is localized.
 *
 * @param {number} value - The amount, in dollars.
 * @param {Intl.NumberFormatOptions} [options] - Passed through to `Intl.NumberFormat`.
 * @return {string} The localized currency string.
 */
export function formatCurrency(value, options = {}) {
  return formatNumber(value, {
    currency: "USD",
    maximumFractionDigits: 0,
    style: "currency",
    ...options,
  });
}

/**
 * The locale currently rendering.
 *
 * @return {string}
 */
export function getLocale() {
  return activeLocale;
}

/**
 * The writing direction of the locale currently rendering.
 *
 * @return {"ltr"|"rtl"}
 */
export function getDirection() {
  return LOCALES[activeLocale]?.dir ?? "ltr";
}

/**
 * Pick the language to start in.
 *
 * A `?lang=` parameter wins, so a link can be shared in a specific language; then the visitor's
 * stored choice; then the languages the browser asks for; then English.
 *
 * @return {string} A supported locale code.
 */
export function detectLocale() {
  const search = typeof window === "undefined" ? "" : window.location.search;
  const requested = new URLSearchParams(search).get(QUERY_KEY);
  const preferred = typeof navigator === "undefined" ? [] : (navigator.languages ?? []);
  for (const candidate of [requested, storage()?.getItem(STORAGE_KEY), ...preferred]) {
    const resolved = resolveLocale(candidate);
    if (resolved) return resolved;
  }
  return DEFAULT_LOCALE;
}

/**
 * Reflect the active locale onto the document, for screen readers, `:lang()` styling, and the
 * browser's own translation prompts.
 */
function applyToDocument() {
  if (typeof document === "undefined") return;
  document.documentElement.lang = activeLocale;
  document.documentElement.dir = getDirection();
}

/**
 * Switch languages, loading the catalog before anything re-renders.
 *
 * The choice is persisted, so it survives a reload without needing `?lang=` in the URL.
 * Subscribers registered with {@link onLocaleChange} run once the catalog is in place.
 *
 * @param {string} tag - A language tag; region-qualified tags are resolved to a supported locale.
 * @return {Promise<string>} The locale that ended up active, which may differ from `tag`.
 */
export async function setLocale(tag) {
  const locale = resolveLocale(tag) ?? DEFAULT_LOCALE;
  await loadCatalog(locale);
  if (locale === activeLocale) return locale;

  activeLocale = locale;
  try {
    storage()?.setItem(STORAGE_KEY, locale);
  } catch {}
  applyToDocument();
  listeners.forEach((listener) => listener(locale));
  return locale;
}

/**
 * Subscribe to language changes, e.g. to re-render the app.
 *
 * @param {(locale: string) => void} listener - Called after a new catalog is loaded and active.
 * @return {() => void} A function that removes the subscription.
 */
export function onLocaleChange(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Load the default catalog and the detected locale's catalog, then make the detected locale
 * active. Call this before the first render; {@link t} is synchronous and needs the catalog in
 * memory to return anything but the key.
 *
 * @param {string} [tag] - Force a starting language instead of detecting one. Used by tests.
 * @return {Promise<string>} The active locale.
 */
export async function initI18n(tag) {
  await loadCatalog(DEFAULT_LOCALE);
  activeLocale = DEFAULT_LOCALE;
  const locale = resolveLocale(tag) ?? detectLocale();
  await loadCatalog(locale);
  activeLocale = locale;
  applyToDocument();
  return activeLocale;
}
