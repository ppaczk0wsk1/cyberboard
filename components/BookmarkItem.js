import { html, useContext } from '../lib/preact.js';
import { XIcon } from '../lib/icons.js';
import { AppContext } from '../lib/context.js';
import { DynamicIcon } from './DynamicIcon.js';

export function BookmarkItem({ bookmark }) {
  const { editMode, dispatch } = useContext(AppContext);

  return html`
    <a href=${bookmark.url} target="_blank" class="bookmark"
       onClick=${(e) => editMode && e.preventDefault()}>
      <${DynamicIcon} value=${bookmark.icon} size=${16} />${' '}${bookmark.name}
      ${editMode && html`
        <button class="del-btn"
                onClick=${(e) => { e.preventDefault(); e.stopPropagation(); if (confirm('Remove this link?')) dispatch({ type: 'DELETE', list: 'bookmarks', id: bookmark.id }); }}>
          <${XIcon} size=${10} />
        </button>
      `}
    </a>
  `;
}
