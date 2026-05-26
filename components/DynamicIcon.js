import { html } from "../lib/preact.js";

/**
 * Renders an emoji icon from data.json.
 */
export function DynamicIcon({ value, size = 20 }) {
  return html`<span style="font-size:${size * 0.85}px;line-height:1"
    >${value}</span
  >`;
}
