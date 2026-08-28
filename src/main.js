import "./scss/style.scss";
// oxlint-disable-next-line no-unused-vars
import { Header } from "./js/components/header.js";
import { Footer } from "./js/components/footer.js";
import { initRouter } from "./js/lib/router.js";
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

// Application layout shell
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

// Initialize the router
initRouter();
