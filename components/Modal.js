import { html, useState, useEffect, useContext } from '../lib/preact.js';
import { AppContext } from '../lib/context.js';
import { COLORS, CATEGORIES } from '../lib/constants.js';
import { uid } from '../lib/data.js';
import { IconPicker } from './IconPicker.js';
import { DynamicIcon } from './DynamicIcon.js';

export function Modal() {
  const { modalState, dispatch, data } = useContext(AppContext);
  const { open, modalType, editId } = modalState;

  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [desc, setDesc] = useState('');
  const [tags, setTags] = useState('');
  const [icon, setIcon] = useState('');
  const [color, setColor] = useState('blue');
  const [cat, setCat] = useState('productivity');

  // Populate when editing, reset when adding
  useEffect(() => {
    if (!open) return;
    if (editId) {
      const list = modalType === 'service' ? 'services' : modalType === 'tutorial' ? 'tutorials' : 'bookmarks';
      const item = data[list].find(x => x.id === editId);
      if (item) {
        setName(item.name || ''); setUrl(item.url || '');
        setDesc(item.desc || ''); setTags(item.tags || '');
        setIcon(item.icon || ''); setColor(item.color || 'blue');
        setCat(item.cat || 'productivity');
        return;
      }
    }
    setName(''); setUrl(''); setDesc(''); setTags('');
    setIcon(''); setColor('blue'); setCat('productivity');
  }, [open, editId]);

  if (!open) return null;

  const title = (editId ? 'Edit ' : 'Add ') + modalType[0].toUpperCase() + modalType.slice(1);
  const isService = modalType === 'service';
  const isBookmark = modalType === 'bookmark';

  const close = () => dispatch({ type: 'CLOSE_MODAL' });

  const save = () => {
    if (!name.trim() || !url.trim()) { alert('Name and URL are required.'); return; }
    const finalIcon = icon || '🔗';
    let item;

    if (isBookmark) {
      item = { id: editId || uid(), name: name.trim(), url: url.trim(), icon: finalIcon };
    } else {
      item = {
        id: editId || uid(), name: name.trim(), url: url.trim(),
        desc: desc.trim(), icon: finalIcon, color, tags: tags.trim(),
        ...(isService ? { cat } : {}),
      };
    }

    dispatch({ type: 'SAVE_ITEM', modalType, item, isEdit: !!editId });
  };

  const onKeyDown = (e) => {
    if (e.key === 'Escape') close();
  };

  return html`
    <div class="modal-overlay open" onClick=${(e) => e.target === e.currentTarget && close()}>
      <div class="modal" onKeyDown=${onKeyDown}>
        <h2>${title}</h2>

        <label>Name</label>
        <input value=${name} onInput=${(e) => setName(e.target.value)}
               placeholder=${isBookmark ? 'e.g. GitHub' : 'e.g. Jellyfin'} autofocus />

        <label>URL</label>
        <input value=${url} onInput=${(e) => setUrl(e.target.value)}
               placeholder=${isBookmark ? 'https://...' : 'http://service.local:port'} />

        ${!isBookmark && html`
          <label>Description</label>
          <input value=${desc} onInput=${(e) => setDesc(e.target.value)} placeholder="Short description" />

          <label>Search tags</label>
          <input value=${tags} onInput=${(e) => setTags(e.target.value)} placeholder="jellyfin media streaming" />
        `}

        ${isService && html`
          <label>Category</label>
          <select value=${cat} onChange=${(e) => setCat(e.target.value)}>
            ${CATEGORIES.map(c => html`<option key=${c} value=${c}>${c[0].toUpperCase() + c.slice(1)}</option>`)}
          </select>
        `}

        <label>Icon ${icon ? html` — preview: <${DynamicIcon} value=${icon} size=${18} />` : ''}</label>
        <${IconPicker} value=${icon} onChange=${setIcon} />

        ${!isBookmark && html`
          <label>Color</label>
          <div class="color-picker">
            ${COLORS.map(c => html`
              <div key=${c} class="color-opt ic-${c} ${color === c ? 'selected' : ''}"
                   style="background:var(--${c})"
                   onClick=${() => setColor(c)}></div>
            `)}
          </div>
        `}

        <div class="modal-actions">
          <button class="btn btn-ghost" onClick=${close}>Cancel</button>
          <button class="btn btn-primary" onClick=${save}>Save</button>
        </div>
      </div>
    </div>
  `;
}
