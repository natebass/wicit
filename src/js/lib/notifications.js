const CONTAINER_ID = "global-notifications";

export const STATUSES = {
  INFO: { class: "info", duration: 5000 },
  IMPORTANT: { class: "important", duration: 10000 },
  SUCCESS: { class: "success", duration: 3000 },
  WARNING: { class: "warning", duration: 5000 },
  ERROR: { class: "error", duration: 10000 },
};

/**
 * Retrieves the container element with a specific ID. If the container
 * does not exist, it creates a new element, assigns the appropriate
 * ID and class name, appends it to the document body, and returns it.
 *
 * @return {HTMLElement|null} The container element or null if the
 * document object is not available.
 */
function getContainer() {
  if (typeof document === "undefined") return null;
  let container = document.getElementById(CONTAINER_ID);
  if (!container) {
    container = document.createElement("ul");
    container.id = CONTAINER_ID;
    container.className = "notifications";
    document.body.appendChild(container);
  }
  return container;
}

/**
 * Adds a notification to the notification container and removes it after a specified duration.
 *
 * @param {Object} notification - The notification to be added.
 * @param {string} notification.message - The message to display in the notification.
 * @param {Object} [notification.status] - The status object defining the style and duration of the notification.
 * @param {string} [notification.status.class] - The CSS class to apply to the notification element for styling.
 * @param {number} [notification.status.duration] - The time in milliseconds before the notification is removed.
 * @return {void}
 */
export function addNotification(notification) {
  const container = getContainer();
  if (!container) return;

  const item = document.createElement("li");
  item.className = notification.status ? notification.status.class : "";
  item.textContent = notification.message;
  container.appendChild(item);

  const duration = notification.status ? notification.status.duration : STATUSES.INFO.duration;
  setTimeout(() => item.remove(), duration);
}
