import { html, useState } from "../lib/preact.js";
import { ChevronDownIcon } from "../lib/icons.js";

export function Section({ title, children, visible = true, noMargin = false }) {
  const [collapsed, setCollapsed] = useState(false);

  if (!visible) return null;

  return html`
    <div
      class="section ${collapsed ? "collapsed" : ""}"
      style=${noMargin ? "margin-bottom:0" : ""}
    >
      <div class="section-header" onClick=${() => setCollapsed(!collapsed)}>
        <span class="section-title">${title}</span>
        <span class="section-toggle"><${ChevronDownIcon} size=${14} /></span>
      </div>
      <div class="section-body">${children}</div>
    </div>
  `;
}
