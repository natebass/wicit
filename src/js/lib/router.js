import { initMapView, MapView } from "../views/map.js";
import { AboutView } from "../views/about.js";
import { initSearchView, SearchView } from "../views/search.js";
import { NotFoundView } from "../views/error.js";
import { QualifyShell } from "../views/qualify/shell.js";
import { ResidencyStep } from "../views/qualify/residency.js";
import { CategoryStep } from "../views/qualify/category.js";
import { IncomeStep, initIncomeStep } from "../views/qualify/income.js";
import { ResultStep } from "../views/qualify/result.js";
import { basePath } from "./paths.js";

const routes = {
  "/": { redirect: "/map" },
  "/map": { template: MapView, init: initMapView, bodyClass: "map" },
  "/about": { template: AboutView },
  "/search": { template: SearchView, init: initSearchView },
  "/qualify": { redirect: "/qualify/residency" },
  "/qualify/residency": {
    template: ResidencyStep,
    layout: QualifyShell,
    outlet: "#qualify-outlet",
  },
  "/qualify/category/:step": {
    template: CategoryStep,
    layout: QualifyShell,
    outlet: "#qualify-outlet",
  },
  "/qualify/income": {
    template: IncomeStep,
    init: initIncomeStep,
    layout: QualifyShell,
    outlet: "#qualify-outlet",
  },
  "/qualify/result": {
    template: ResultStep,
    layout: QualifyShell,
    outlet: "#qualify-outlet",
  },
};

/** @type {Function | null} The layout function currently mounted, if any. */
let currentLayout = null;

/**
 * Compiles a string pattern into a regular expression and extracts parameter keys.
 *
 * @param {string} pattern - The string pattern to compile. Segments starting with `:` are treated as parameters.
 * @return {{ regex: RegExp, keys: string[] }} An object containing the compiled regular expression (`regex`) and an array of parameter keys (`keys`).
 *
 * @example
 * compilePattern("/qualify/category/:step")
 */
function compilePattern(pattern) {
  const keys = [];
  const regexStr = pattern
    .split("/")
    .map((segment) => {
      if (segment.startsWith(":")) {
        keys.push(segment.slice(1));
        return "([^/]+)";
      }
      return segment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    })
    .join("/");
  return { regex: new RegExp(`^${regexStr}/?$`), keys };
}

/**
 * Matches the given pathname to a predefined route and extracts parameters if applicable.
 *
 * @param {string} pathname - The URL path to match against the defined routes.
 * @return {Object|null} An object containing the matched route and its parameters, or null if no match is found.
 */
function matchRoute(pathname) {
  if (routes[pathname]) {
    return { route: routes[pathname], params: {} };
  }
  for (const pattern of Object.keys(routes)) {
    if (!pattern.includes(":")) continue;
    const { regex, keys } = compilePattern(pattern);
    const match = pathname.match(regex);
    if (match) {
      const params = {};
      keys.forEach((key, i) => (params[key] = decodeURIComponent(match[i + 1])));
      return { route: routes[pattern], params };
    }
  }
  return null;
}

/**
 * Parse a search string into a plain object.
 *
 * @param {string} search
 * @returns {Record<string,string>}
 *
 * @example
 * parseQuery("?a=1&b=2")
 */
function parseQuery(search) {
  const query = {};
  new URLSearchParams(search).forEach((value, key) => (query[key] = value));
  return query;
}

/**
 * Highlight the top-level nav item matching the current path.
 *
 * @param {string} pathname
 */
function updateActiveNav(pathname) {
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
  document.querySelectorAll("#main-menu a[href]").forEach((link) => {
    const href = link.getAttribute("href").replace(basePath, "") || "/";
    const isActive = href === pathname || (href !== "/" && pathname.startsWith(href));
    link.parentElement.classList.toggle("active", isActive);
  });
}

/**
 * Resolve the current URL and render the matching view.
 */
export function router() {
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
  const pathname = window.location.pathname;
  const path =
    basePath && (pathname === basePath || pathname.startsWith(`${basePath}/`))
      ? pathname.slice(basePath.length) || "/"
      : pathname;
  const mainContent = document.querySelector("#main-content");
  if (!mainContent) return;

  const matched = matchRoute(path);

  if (!matched) {
    currentLayout = null;
    mainContent.innerHTML = NotFoundView();
    document.body.className = "";
    updateActiveNav(path);
    return;
  }

  const { route, params } = matched;

  if (route.redirect) {
    navigateTo(route.redirect, true);
    return;
  }

  const ctx = { params, query: parseQuery(window.location.search), path };
  document.body.className = route.bodyClass || "";

  if (route.layout) {
    if (currentLayout !== route.layout) {
      mainContent.innerHTML = route.layout();
      currentLayout = route.layout;
    }
    const outlet = mainContent.querySelector(route.outlet);
    if (outlet) outlet.innerHTML = route.template(ctx);
  } else {
    currentLayout = null;
    mainContent.innerHTML = route.template(ctx);
  }

  if (route.init) route.init(ctx);
  updateActiveNav(path);
}

/**
 * Navigate to a route programmatically.
 *
 * @param {string} url - Path (optionally with query string) to navigate to.
 * @param {boolean} [replace=false] - Replace history entry instead of pushing.
 *
 * @example
 * navigateTo("/qualify/result?success=false&reason=income");
 */
export function navigateTo(url, replace = false) {
  const destination = basePath(url);
  if (replace) {
    window.history.replaceState(null, "", destination);
  } else {
    window.history.pushState(null, "", destination);
  }
  router();
}

/**
 * Wire up global navigation: back/forward, `[data-link]` anchors (use `href`),
 * and `[data-nav]` controls such as buttons (use the attribute value).
 */
export function initRouter() {
  window.addEventListener("popstate", router);

  document.addEventListener("click", (e) => {
    const link = e.target.closest("[data-link]");
    if (link) {
      e.preventDefault();
      navigateTo(link.getAttribute("href"));
      return;
    }
    const nav = e.target.closest("[data-nav]");
    if (nav) {
      e.preventDefault();
      navigateTo(nav.getAttribute("data-nav"));
    }
  });

  router();
}
