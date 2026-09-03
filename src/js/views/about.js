import { formatCurrency, t } from "../i18n/index.js";

/** The seasonal Farmers' Market Nutrition Program benefit, in dollars. */
const FMNP_SEASONAL_BENEFIT = 20;

/**
 * About page.
 */
export function AboutView() {
  return `
    <div class="col-md-8 col-md-offset-2" id="content">
      <h2>${t("about.heading")}</h2>
      <p>${t("about.intro")}</p>
      <h3>${t("about.who.heading")}</h3>
      <ul>
        <li>${t("about.who.women")}</li>
        <li>${t("about.who.children")}</li>
        <li>${t("about.who.income")}</li>
      </ul>
      <p>${t("about.who.quizPrompt")}</p>
      <h3>${t("about.start.heading")}</h3>
      <p class="important">${t("about.start.body")}</p>
      <div class="video-container">
        <iframe
          width="560"
          height="315"
          src="https://www.youtube.com/embed/G_9w2X1AMqM?list=UUvPiebctsOpWJra4qauF8bw"
          allowfullscreen="allowfullscreen"
        ></iframe>
      </div>
      <h3>${t("about.resources.heading")}</h3>
      <p>${t("about.resources.intro")}</p>
      <h4>${t("about.markets.heading")}</h4>
      <p>${t("about.markets.intro")}</p>
      <ul>
        <li>
          <h5>${t("about.markets.fmnp.heading")}</h5>
          <p>${t("about.markets.fmnp.body", { amount: formatCurrency(FMNP_SEASONAL_BENEFIT) })}</p>
        </li>
        <li>
          <h5>${t("about.markets.fvc.heading")}</h5>
          <p>${t("about.markets.fvc.body")}</p>
        </li>
      </ul>
      <h4>${t("about.education.heading")}</h4>
      <p>${t("about.education.body")}</p>
      <h3>${t("about.wicit.heading")}</h3>
      <p>${t("about.wicit.body")}</p>
      <p class="attribution">${t("about.attribution")}</p>
    </div>
  `;
}
