import { escapeHtml } from "../lib/utility.js";

const RESULTS_PER_PAGE = 25;
const DEBOUNCE = 200;

/** @type {Promise<object[]> | null} Memoized promise for the bundled food dataset. */
let foodsPromise = null;

/**
 * Lazily load and cache the bundled approved-foods dataset.
 *
 * @returns {Promise<object[]>}
 */
function loadFoods() {
  if (!foodsPromise) {
    foodsPromise = import("../../../sample_data/foods.json").then((m) => m.default);
  }
  return foodsPromise;
}

/**
 * "Which Foods Qualify?" search page. Searches the bundled sample food list client-side.
 *
 * @returns {string} HTML for the search view.
 */
export function SearchView() {
  return `
    <div class="col-md-8 col-md-offset-2" id="content">
      <h2>Which Foods Qualify for WIC?</h2>
      <div class="row search-wrap">
        <div class="search-col col-xs-12 col-sm-8 col-md-7">
          <p class="info">
            We're still working on this feature. This is not a complete list — see the
            <a href="https://www.fns.usda.gov/wic/wic-food-packages-regulatory-requirements-wic-eligible-foods"
               target="_blank" rel="noopener">USDA website</a>
            for more details on qualified foods.
          </p>
          <input
            class="form-control"
            id="search-input"
            type="text"
            placeholder="Search Qualifying Foods..."
          />
          <div id="search-state">
            <div class="well">Search for WIC-eligible foods, brands, and UPC codes.</div>
          </div>
          <p class="info">
            If you have any ideas on how we can improve this feature, please tweet us
            <a href="https://twitter.com/wicitapp" target="_blank" rel="noopener">@wicitapp</a>.
          </p>
        </div>
      </div>
    </div>
  `;
}

/**
 * Wire the debounced search input after render.
 * */
export function initSearchView() {
  const input = document.querySelector("#search-input");
  const stateEl = document.querySelector("#search-state");
  if (!input || !stateEl) return;

  let timeout = 0;
  let hasResults = false;

  /** HTML renderers for each state of the search results panel. */
  const render = {
    initial: () => `<div class="well">Search for WIC-eligible foods, brands, and UPC codes.</div>`,
    pending: () => `<div class="well">Searching...</div>`,
    error: () => `<div class="alert alert-danger">Sorry, something has gone wrong.</div>`,
    noResults: (query) =>
      `<div class="well">No results for &ldquo;${escapeHtml(query)}&rdquo; found.</div>`,
    results: (results, count) => {
      const items = results
        .map(
          (result) => `
            <li class="list-group-item">
              ${escapeHtml(result["Brand Name"])} ${escapeHtml(result["Product Name"])}
              <div class="upc">UPC: ${escapeHtml(result["UPC"])}</div>
            </li>`,
        )
        .join("");
      return `
        <ul class="list-group" id="search-results">${items}</ul>
        <div>${results.length} of ${count} results.</div>
      `;
    },
  };

  /** Read the input, debounce, and render the matching results state. */
  const submit = () => {
    const query = input.value.trim();
    if (!query) {
      clearTimeout(timeout);
      hasResults = false;
      stateEl.innerHTML = render.initial();
      return;
    }

    if (!hasResults) stateEl.innerHTML = render.pending();

    clearTimeout(timeout);
    timeout = window.setTimeout(async () => {
      try {
        const foods = await loadFoods();
        const needle = query.toLowerCase();
        const matches = foods.filter(
          (food) =>
            String(food["UPC"] ?? "")
              .toLowerCase()
              .includes(needle) ||
            String(food["Brand Name"] ?? "")
              .toLowerCase()
              .includes(needle) ||
            String(food["Product Name"] ?? "")
              .toLowerCase()
              .includes(needle) ||
            String(food["Tags"] ?? "")
              .toLowerCase()
              .includes(needle),
        );
        hasResults = matches.length > 0;
        if (matches.length) {
          stateEl.innerHTML = render.results(matches.slice(0, RESULTS_PER_PAGE), matches.length);
        } else {
          stateEl.innerHTML = render.noResults(query);
        }
      } catch {
        hasResults = false;
        stateEl.innerHTML = render.error();
      }
    }, DEBOUNCE);
  };

  input.addEventListener("input", submit);
}
