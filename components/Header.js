import { html, useState, useEffect, useContext } from "../lib/preact.js";
import { PencilIcon, MoonIcon, SunIcon } from "../lib/icons.js";
import { AppContext } from "../lib/context.js";

function Clock() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const fmt = () =>
      setTime(
        new Date().toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
    fmt();
    const id = setInterval(fmt, 1000);
    return () => clearInterval(id);
  }, []);

  return html`<div class="clock">${time}</div>`;
}

export function Header() {
  const { editMode, setEditMode, theme, setTheme } = useContext(AppContext);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return html`
    <header>
      <div class="header-buttons">
        <button
          class="hdr-btn ${editMode ? "active" : ""}"
          onClick=${() => setEditMode(!editMode)}
          title="Edit mode (E)"
        >
          <${PencilIcon} size=${16} />
        </button>
        <button
          class="hdr-btn"
          onClick=${() => setTheme(theme === "dark" ? "light" : "dark")}
          title="Toggle theme (T)"
        >
          ${theme === "dark"
            ? html`<${MoonIcon} size=${16} />`
            : html`<${SunIcon} size=${16} />`}
        </button>
      </div>
      <h1>Cyberboard</h1>
      <div class="greeting">${greeting}</div>
      <${Clock} />
    </header>
  `;
}
