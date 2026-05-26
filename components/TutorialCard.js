import { html, useRef, useContext } from "../lib/preact.js";
import { XIcon, PencilIcon } from "../lib/icons.js";
import { AppContext } from "../lib/context.js";
import { DynamicIcon } from "./DynamicIcon.js";

export function TutorialCard({ tutorial }) {
  const { editMode, dispatch } = useContext(AppContext);
  const ref = useRef();

  const onDragStart = (e) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", tutorial.id);
    ref.current.classList.add("dragging");
  };

  const onDragEnd = () => ref.current?.classList.remove("dragging");

  const onDragOver = (e) => {
    e.preventDefault();
    ref.current.classList.add("drag-over");
  };

  const onDragLeave = () => ref.current?.classList.remove("drag-over");

  const onDrop = (e) => {
    e.preventDefault();
    ref.current.classList.remove("drag-over");
    const fromId = e.dataTransfer.getData("text/plain");
    if (fromId !== tutorial.id) {
      dispatch({
        type: "REORDER",
        list: "tutorials",
        fromId,
        toId: tutorial.id,
      });
    }
  };

  return html`
    <a
      ref=${ref}
      href=${tutorial.url}
      class="card"
      draggable=${editMode}
      onClick=${(e) => editMode && e.preventDefault()}
      onDragStart=${onDragStart}
      onDragEnd=${onDragEnd}
      onDragOver=${onDragOver}
      onDragLeave=${onDragLeave}
      onDrop=${onDrop}
    >
      <div class="card-icon ic-${tutorial.color}">
        <${DynamicIcon} value=${tutorial.icon} size=${20} />
      </div>
      <div class="card-info">
        <h3>${tutorial.name}</h3>
        <p>${tutorial.desc}</p>
      </div>

      ${editMode &&
      html`
        <button
          class="del-btn"
          onClick=${(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (confirm("Remove this tutorial?"))
              dispatch({ type: "DELETE", list: "tutorials", id: tutorial.id });
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
              modalType: "tutorial",
              editId: tutorial.id,
            });
          }}
        >
          <${PencilIcon} size=${12} />
        </button>
      `}
    </a>
  `;
}
