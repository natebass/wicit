import "./scss/style.scss";
import { Header } from "./js/components/header.js";
import { Footer } from "./js/components/footer.js";
import { initI18n, onLocaleChange } from "./js/i18n/index.js";
import { initRouter, router } from "./js/lib/router.js";
import { basePath } from "./js/lib/paths.js";

document.documentElement.style.setProperty("--bg-image", `url("${basePath("image/bg7.jpg")}")`);
document.documentElement.style.setProperty(
  "--loader-image",
  `url("${basePath("image/loader.gif")}")`,
);
document.documentElement.style.setProperty(
  "--geolocate-image",
  `url("${basePath("image/geolocate.png")}")`,
);

/**
 * Render the application layout shell. Every string inside it comes from the active message
 * catalog, so this runs again whenever the language changes.
 */
function renderShell() {
  document.querySelector("#app").innerHTML = `
    <header id="header">
      ${Header()}
    </header>
    <main id="main-content">
    </main>
    <footer id="footer">
      ${Footer()}
    </footer>
    <ul id="global-notifications" class="notifications"></ul>
  `;
}

// Catalogs load over the network while `t()` is synchronous, so nothing renders until the active
// locale's catalog is in memory. A change of language re-renders the shell and the current view.
initI18n().then(() => {
  renderShell();
  initRouter();
  onLocaleChange(() => {
    renderShell();
    router();
  });
});
