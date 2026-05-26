import { html, useRef, useContext } from "../lib/preact.js";
import { StarIcon, XIcon, PencilIcon } from "../lib/icons.js";
import { AppContext } from "../lib/context.js";
import { DynamicIcon } from "./DynamicIcon.js";

export function ServiceCard({ service, isFav, status }) {
  const { editMode, dispatch } = useContext(AppContext);
  const ref = useRef();

  // --- Drag & Drop handlers ---
  const onDragStart = (e) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", service.id);
    ref.current.classList.add("dragging");
  };

  const onDragEnd = () => ref.current?.classList.remove("dragging");

  const onDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    ref.current.classList.add("drag-over");
  };

  const onDragLeave = () => ref.current?.classList.remove("drag-over");

  const onDrop = (e) => {
    e.preventDefault();
    ref.current.classList.remove("drag-over");
    const fromId = e.dataTransfer.getData("text/plain");
    if (fromId !== service.id) {
      dispatch({ type: "REORDER", list: "services", fromId, toId: service.id });
    }
  };

  // --- Icon: favicon > lucide > emoji ---
  let iconContent;
  if (service.favicon) {
    iconContent = html`
      <img
        src=${service.favicon}
        onError=${(e) => {
          e.target.style.display = "none";
          e.target.nextElementSibling.style.display = "inline";
        }}
      />
      <span style="display:none"
        ><${DynamicIcon} value=${service.icon} size=${20}
      /></span>
    `;
  } else {
    iconContent = html`<${DynamicIcon} value=${service.icon} size=${20} />`;
  }

  const statusClass =
    status === true ? "up" : status === false ? "down" : "unknown";

  return html`
    <a
      ref=${ref}
      href=${service.url}
      target="_blank"
      class="card ${isFav ? "favorite" : ""}"
      draggable=${editMode}
      onClick=${(e) => editMode && e.preventDefault()}
      onDragStart=${onDragStart}
      onDragEnd=${onDragEnd}
      onDragOver=${onDragOver}
      onDragLeave=${onDragLeave}
      onDrop=${onDrop}
      data-cat=${service.cat}
    >
      <div class="card-icon ic-${service.color}">${iconContent}</div>
      <div class="card-info">
        <h3>${service.name}</h3>
        <p>${service.desc}</p>
      </div>
      <div class="status-dot ${statusClass}"></div>

      ${!editMode &&
      html`
        <button
          class="fav-btn ${isFav ? "is-fav" : ""}"
          onClick=${(e) => {
            e.preventDefault();
            e.stopPropagation();
            dispatch({ type: "TOGGLE_FAV", id: service.id });
          }}
        >
          <${StarIcon} size=${12} />
        </button>
      `}
      ${editMode &&
      html`
        <button
          class="del-btn"
          onClick=${(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (confirm("Remove this service?"))
              dispatch({ type: "DELETE", list: "services", id: service.id });
          }}
        >
          <${XIcon} size=${12} />
        </button>
        <button
          class="edit-btn"
          onClick=${(e) => {
            e.preventDefault();
            e.stopPropagation();
            dispatch({
              type: "OPEN_MODAL",
              modalType: "service",
              editId: service.id,
            });
          }}
        >
          <${PencilIcon} size=${12} />
        </button>
      `}
    </a>
  `;
}
