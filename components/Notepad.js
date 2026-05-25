import { html, useState, useContext } from '../lib/preact.js';
import { TrashIcon } from '../lib/icons.js';
import { AppContext } from '../lib/context.js';

export function Notepad({ value, field, placeholder, mono = false, showFooter = false }) {
  const { dispatch } = useContext(AppContext);
  const [status, setStatus] = useState('Saved to data.json');

  const onChange = (e) => {
    dispatch({ type: 'SET_FIELD', field, value: e.target.value });
    if (showFooter) {
      setStatus('Saved');
      setTimeout(() => setStatus('Saved to data.json'), 1500);
    }
  };

  const clear = () => dispatch({ type: 'SET_FIELD', field, value: '' });

  const style = mono
    ? "font-family:'SF Mono','Fira Code','Cascadia Code',monospace;min-height:120px"
    : '';

  return html`
    <div class="notepad">
      <textarea value=${value} onInput=${onChange} placeholder=${placeholder} style=${style} />
      ${showFooter && html`
        <div class="notepad-footer">
          <span>${status}</span>
          <button onClick=${clear} style="background:none;border:1px solid var(--border);border-radius:4px;padding:.2rem .5rem;color:var(--text-dim);cursor:pointer;font-size:.7rem;display:flex;align-items:center;gap:.25rem">
            <${TrashIcon} size=${11} /> Clear
          </button>
        </div>
      `}
    </div>
  `;
}
