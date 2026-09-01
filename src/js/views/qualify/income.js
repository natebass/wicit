import { t } from "../../i18n/index.js";
import { navigateTo } from "../../lib/router.js";
import { addNotification, STATUSES } from "../../lib/notifications.js";

/** Pay-period multipliers to convert entered income to a yearly figure. */
const PERIODS = [
  { label: "qualify.income.period.year", value: 1 },
  { label: "qualify.income.period.month", value: 12 },
  { label: "qualify.income.period.week", value: 52 },
];

/**
 * Qualify the final step: family size and income. Computes eligibility against the
 * income threshold and routes to the result.
 */
export function IncomeStep() {
  const options = PERIODS.map(
    (period) => `<option value="${period.value}">${t(period.label)}</option>`,
  ).join("");
  return `
    <div class="form-group qualify income">
      <span class="form-group-label">${t("qualify.income.legend")}</span>
      <label>${t("qualify.income.familySize")}</label>
      <input
        class="family-count"
        type="text"
        maxlength="2"
        placeholder="${t("qualify.income.familySizePlaceholder")}"
        size="2"
      />
      <br />
      <label>${t("qualify.income.combined")}</label>
      <span class="currency-sign">$</span>
      <input
        class="family-income"
        type="text"
        maxlength="8"
        placeholder="${t("qualify.income.amountPlaceholder")}"
        size="10"
      />
      <span class="per">${t("qualify.income.per")}</span>
      <select class="family-payperiod form-control">${options}</select>
      <br />
      <button type="button" id="qualify-submit">${t("qualify.income.submit")}</button>
    </div>
  `;
}

/**
 * Bind a click event handler to the "#qualify-submit" button. It validates user inputs for income,
 * family size, and pay period, calculates yearly income, and compares it against the qualifying threshold.
 */
export function initIncomeStep() {
  const submit = document.querySelector("#qualify-submit");
  if (!submit) return;

  submit.addEventListener("click", () => {
    const income = parseFloat(document.querySelector(".family-income")?.value);
    const count = parseInt(document.querySelector(".family-count")?.value, 10);
    const payperiod = parseFloat(document.querySelector(".family-payperiod")?.value);

    let error = false;
    if (!income) {
      addNotification({ message: t("qualify.income.missingIncome"), status: STATUSES.ERROR });
      error = true;
    }
    if (!count) {
      addNotification({
        message: t("qualify.income.missingFamilySize"),
        status: STATUSES.ERROR,
      });
      error = true;
    }
    if (error) return;

    const yearlyIncome = income * payperiod;
    const threshold = 21590 + 7511 * count;
    if (yearlyIncome > threshold) {
      navigateTo("/qualify/result?success=false&reason=income");
    } else {
      navigateTo("/qualify/result?success=true");
    }
  });
}
