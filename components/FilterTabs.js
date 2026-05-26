import { html } from "../lib/preact.js";

export function FilterTabs({ categories, active, onSelect }) {
  return html`
    <div class="filter-tabs">
      <span
        class="filter-tab ${active === "all" ? "active" : ""}"
        onClick=${() => onSelect("all")}
        >All</span
      >
      ${categories.map(
        (cat) => html`
          <span
            key=${cat}
            class="filter-tab ${active === cat ? "active" : ""}"
            onClick=${() => onSelect(cat)}
          >
            ${cat[0].toUpperCase() + cat.slice(1)}
          </span>
        `,
      )}
    </div>
  `;
}
