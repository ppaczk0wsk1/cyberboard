import { html, useState, useMemo } from "../lib/preact.js";
import { EMOJI_DATA } from "../lib/constants.js";

const CATEGORY_NAMES = Object.keys(EMOJI_DATA);

/**
 * Searchable emoji picker organized by category.
 * Calls onChange with an emoji string.
 */
export function IconPicker({ value, onChange }) {
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState(null); // null = show all

  // Build flat searchable list
  const allEmojis = useMemo(
    () =>
      Object.entries(EMOJI_DATA).flatMap(([cat, entries]) =>
        entries.map(([emoji, keywords]) => ({ emoji, keywords, cat })),
      ),
    [],
  );

  // Filter by search query
  const filtered = useMemo(() => {
    if (!query.trim()) return null; // null = show categories
    const q = query.toLowerCase().trim();
    return allEmojis.filter((e) => e.keywords.includes(q) || e.emoji === q);
  }, [query, allEmojis]);

  // What to display
  const isSearching = filtered !== null;
  const displayEmojis = isSearching
    ? filtered
    : activeCat
      ? EMOJI_DATA[activeCat].map(([emoji, keywords]) => ({
          emoji,
          keywords,
          cat: activeCat,
        }))
      : null;

  return html`
    <div class="icon-picker-container">
      <input
        class="icon-search"
        type="text"
        value=${query}
        onInput=${(e) => {
          setQuery(e.target.value);
          setActiveCat(null);
        }}
        placeholder="Search emojis... (e.g. server, lock, cloud, fire)"
      />

      ${!isSearching &&
      html`
        <div class="icon-picker-tabs">
          ${CATEGORY_NAMES.map(
            (cat) => html`
              <button
                key=${cat}
                class="icon-tab ${activeCat === cat ? "active" : ""}"
                onClick=${() => setActiveCat(activeCat === cat ? null : cat)}
              >
                ${EMOJI_DATA[cat][0][0]} ${cat}
              </button>
            `,
          )}
        </div>
      `}
      ${displayEmojis !== null &&
      html`
        <div class="icon-grid">
          ${displayEmojis.map(
            ({ emoji }) => html`
              <div
                key=${emoji + Math.random()}
                class="icon-grid-item emoji ${value === emoji
                  ? "selected"
                  : ""}"
                onClick=${() => onChange(emoji)}
                title=${emoji}
              >
                ${emoji}
              </div>
            `,
          )}
          ${displayEmojis.length === 0 &&
          html` <div class="icon-grid-empty">No emojis match "${query}"</div> `}
        </div>
      `}
      ${!isSearching &&
      !activeCat &&
      html` <div class="icon-grid-hint">Pick a category or search above</div> `}
    </div>
  `;
}
