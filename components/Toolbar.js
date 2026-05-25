import { html, useState, useEffect, useRef, useContext } from '../lib/preact.js';
import { DownloadIcon, UploadIcon, PaletteIcon, ResetIcon, SmartphoneIcon } from '../lib/icons.js';
import { AppContext } from '../lib/context.js';

// ---- Save Status Toast ----

export function SaveStatus({ message, isError }) {
  if (!message) return null;
  return html`<div class="save-status show ${isError ? 'error' : ''}">${message}</div>`;
}

// ---- Data Actions (visible in edit mode) ----

export function DataActions() {
  const { dispatch } = useContext(AppContext);
  const fileRef = useRef();

  const onImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        dispatch({ type: 'IMPORT', data: JSON.parse(reader.result) });
      } catch {
        dispatch({ type: 'TOAST', message: 'Invalid JSON', isError: true });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return html`
    <div class="data-actions">
      <button class="btn btn-ghost" onClick=${() => dispatch({ type: 'EXPORT' })}>
        <${DownloadIcon} size=${14} /> Export JSON
      </button>
      <button class="btn btn-ghost" onClick=${() => fileRef.current.click()}>
        <${UploadIcon} size=${14} /> Import JSON
      </button>
      <button class="btn btn-ghost" onClick=${() => dispatch({ type: 'FETCH_FAVICONS' })}>
        <${PaletteIcon} size=${14} /> Fetch Favicons
      </button>
      <button class="btn btn-danger" onClick=${() => dispatch({ type: 'RESET' })}>
        <${ResetIcon} size=${14} /> Reset
      </button>
      <input ref=${fileRef} type="file" accept=".json" style="display:none" onChange=${onImport} />
    </div>
  `;
}

// ---- Install PWA Button ----

export function InstallButton() {
  const [prompt, setPrompt] = useState(null);

  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!prompt) return null;

  const install = () => {
    prompt.prompt();
    prompt.userChoice.then(() => setPrompt(null));
  };

  return html`
    <button class="install-btn" style="display:flex" onClick=${install}>
      <${SmartphoneIcon} size=${16} /> Install App
    </button>
  `;
}
