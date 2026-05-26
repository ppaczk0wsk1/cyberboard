import { html, render, useState, useEffect, useCallback } from './lib/preact.js';
import { AppContext } from './lib/context.js';
import { loadData, saveData } from './lib/data.js';
import { PlusIcon } from './lib/icons.js';

// Components
import { Header } from './components/Header.js';
import { WeatherWidget } from './components/Weather.js';
import { SearchBar } from './components/SearchBar.js';
import { StatsBar } from './components/StatsBar.js';
import { FilterTabs } from './components/FilterTabs.js';
import { Section } from './components/Section.js';
import { ServiceCard } from './components/ServiceCard.js';
import { TutorialCard } from './components/TutorialCard.js';
import { BookmarkItem } from './components/BookmarkItem.js';
import { Modal } from './components/Modal.js';
import { Notepad } from './components/Notepad.js';
import { SaveStatus, DataActions, InstallButton } from './components/Toolbar.js';

// ============================================================
// App — root component
// ============================================================

function App() {
  const [data, setData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [modalState, setModalState] = useState({ open: false, modalType: '', editId: null });
  const [toast, setToast] = useState({ message: '', isError: false });
  const [theme, setThemeState] = useState(localStorage.getItem('theme') || 'dark');
  const [healthStatus, setHealthStatus] = useState({});
  const [lastCheckTime, setLastCheckTime] = useState(null);

  // --- Boot ---
  useEffect(() => {
    loadData().then(setData).catch(() => showToast('Failed to load data.json', true));
  }, []);

  // --- Theme ---
  const setTheme = useCallback((t) => {
    document.documentElement.setAttribute('data-theme', t);
    localStorage.setItem('theme', t);
    setThemeState(t);
  }, []);

  useEffect(() => { setTheme(theme); }, []);

  // --- Edit mode body class ---
  useEffect(() => {
    document.body.classList.toggle('edit-mode', editMode);
  }, [editMode]);

  // --- Toast ---
  const showToast = useCallback((message, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => setToast({ message: '', isError: false }), 2000);
  }, []);

  // --- Persist helper ---
  const persistData = useCallback((newData) => {
    setData(newData);
    saveData(newData, showToast);
  }, [showToast]);

  // --- Health checks (server-side) ---
  useEffect(() => {
    if (!data) return;
    const run = async () => {
      try {
        const res = await fetch('/api/health');
        setHealthStatus(await res.json());
        setLastCheckTime(Date.now());
      } catch {}
    };
    run();
    const id = setInterval(run, 60000);
    return () => clearInterval(id);
  }, [data?.services?.length]);

  // --- Global keyboard shortcuts ---
  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;
      if (e.key === 'e' || e.key === 'E') setEditMode(m => !m);
      if (e.key === 't' || e.key === 'T') setTheme(theme === 'dark' ? 'light' : 'dark');
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [theme]);

  // --- Central dispatch ---
  const dispatch = useCallback((action) => {
    setData(prev => {
      if (!prev) return prev;
      const next = JSON.parse(JSON.stringify(prev));

      switch (action.type) {
        case 'TOGGLE_FAV': {
          const idx = next.favorites.indexOf(action.id);
          if (idx >= 0) next.favorites.splice(idx, 1);
          else next.favorites.push(action.id);
          break;
        }

        case 'DELETE': {
          next[action.list] = next[action.list].filter(x => x.id !== action.id);
          next.favorites = next.favorites.filter(f => f !== action.id);
          break;
        }

        case 'REORDER': {
          const arr = next[action.list];
          const fromIdx = arr.findIndex(x => x.id === action.fromId);
          const toIdx = arr.findIndex(x => x.id === action.toId);
          if (fromIdx >= 0 && toIdx >= 0) {
            const [item] = arr.splice(fromIdx, 1);
            arr.splice(toIdx, 0, item);
          }
          break;
        }

        case 'SAVE_ITEM': {
          const listKey = action.modalType === 'service' ? 'services'
            : action.modalType === 'tutorial' ? 'tutorials' : 'bookmarks';
          if (action.isEdit) {
            const idx = next[listKey].findIndex(x => x.id === action.item.id);
            if (idx >= 0) next[listKey][idx] = action.item;
          } else {
            next[listKey].push(action.item);
          }
          setModalState({ open: false, modalType: '', editId: null });
          break;
        }

        case 'SET_FIELD':
          next[action.field] = action.value;
          break;

        case 'OPEN_MODAL':
          setModalState({ open: true, modalType: action.modalType, editId: action.editId || null });
          return prev;

        case 'CLOSE_MODAL':
          setModalState({ open: false, modalType: '', editId: null });
          return prev;

        case 'IMPORT':
          Object.assign(next, action.data);
          showToast('Import successful!');
          break;

        case 'EXPORT': {
          const blob = new Blob([JSON.stringify(prev, null, 2)], { type: 'application/json' });
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = 'cyberboard-backup.json';
          a.click();
          URL.revokeObjectURL(a.href);
          return prev;
        }

        case 'FETCH_FAVICONS': {
          showToast('Fetching favicons...');
          (async () => {
            let found = 0;
            const updated = JSON.parse(JSON.stringify(prev));
            await Promise.all(updated.services.map(async (s) => {
              try {
                const origin = new URL(s.url).origin;
                await fetch(origin + '/favicon.ico', { mode: 'no-cors', signal: AbortSignal.timeout(3000) });
                s.favicon = origin + '/favicon.ico';
                found++;
              } catch {}
            }));
            showToast(`Found ${found}/${updated.services.length} favicons`);
            persistData(updated);
          })();
          return prev;
        }

        case 'RESET': {
          if (!confirm('Reset everything to defaults? All customizations will be lost.')) return prev;
          (async () => {
            try {
              const res = await fetch('data.json.default?t=' + Date.now());
              if (res.ok) {
                persistData(await res.json());
                showToast('Reset to defaults');
              }
            } catch {
              showToast('data.json.default not found', true);
            }
          })();
          return prev;
        }

        case 'TOAST':
          showToast(action.message, action.isError);
          return prev;

        default:
          return prev;
      }

      saveData(next, showToast);
      return next;
    });
  }, [persistData, showToast]);

  // --- Loading state ---
  if (!data) {
    return html`<div style="text-align:center;padding:4rem;color:var(--text-dim)">Loading...</div>`;
  }

  // --- Derived state ---
  const categories = [...new Set(data.services.map(s => s.cat).filter(Boolean))].sort();
  const q = searchQuery.toLowerCase().trim();

  const filteredServices = data.services.filter(s => {
    const matchesCat = activeCategory === 'all' || s.cat === activeCategory;
    const matchesSearch = !q || (s.name + ' ' + s.tags + ' ' + s.desc).toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  const filteredTutorials = data.tutorials.filter(t =>
    !q || (t.name + ' ' + t.tags + ' ' + t.desc).toLowerCase().includes(q)
  );

  const filteredBookmarks = data.bookmarks.filter(b =>
    !q || b.name.toLowerCase().includes(q)
  );

  const onlineCount = Object.values(healthStatus).filter(Boolean).length;

  const ctx = {
    data, editMode, setEditMode, dispatch,
    searchQuery, setSearchQuery, theme, setTheme, modalState,
  };

  // --- Render ---
  return html`
    <${AppContext.Provider} value=${ctx}>
      <${SaveStatus} message=${toast.message} isError=${toast.isError} />
      <${Header} />
      <${WeatherWidget} />
      <${SearchBar} />

      <${StatsBar}
        serviceCount=${data.services.length}
        tutorialCount=${data.tutorials.length}
        onlineCount=${onlineCount}
        lastCheckTime=${lastCheckTime}
        favoriteCount=${data.favorites.length} />

      <${DataActions} />

      <${FilterTabs}
        categories=${categories}
        active=${activeCategory}
        onSelect=${setActiveCategory} />

      <${Section} title="Self-Hosted Services" visible=${filteredServices.length > 0 || editMode}>
        <div class="grid">
          ${filteredServices.map(s => html`
            <${ServiceCard} key=${s.id} service=${s}
              isFav=${data.favorites.includes(s.id)}
              status=${healthStatus[s.id]} />
          `)}
          <div class="add-card"
               onClick=${() => dispatch({ type: 'OPEN_MODAL', modalType: 'service' })}>
            <${PlusIcon} size=${16} /> Add Service
          </div>
        </div>
      <//>

      <${Section} title="Tutorials & Learning" visible=${filteredTutorials.length > 0 || editMode}>
        <div class="grid">
          ${filteredTutorials.map(t => html`
            <${TutorialCard} key=${t.id} tutorial=${t} />
          `)}
          <div class="add-card"
               onClick=${() => dispatch({ type: 'OPEN_MODAL', modalType: 'tutorial' })}>
            <${PlusIcon} size=${16} /> Add Tutorial
          </div>
        </div>
      <//>

      <${Section} title="Quick Links" visible=${filteredBookmarks.length > 0 || editMode}>
        <div class="bookmark-group">
          ${filteredBookmarks.map(b => html`
            <${BookmarkItem} key=${b.id} bookmark=${b} />
          `)}
          <span class="add-bookmark"
                onClick=${() => dispatch({ type: 'OPEN_MODAL', modalType: 'bookmark' })}>
            <${PlusIcon} size=${14} /> Add Link
          </span>
        </div>
      <//>

      <div class="bottom-row">
        <${Section} title="Scratchpad" noMargin>
          <${Notepad} value=${data.notes} field="notes"
                      placeholder="Quick notes, IPs, TODOs..." showFooter />
        <//>
        <${Section} title="Network Quick Ref" noMargin>
          <${Notepad} value=${data.networkNotes} field="networkNotes"
                      placeholder="Gateway: 192.168.1.1\nSubnet: 192.168.1.0/24" mono />
        <//>
      </div>

      <${Modal} />
      <${InstallButton} />

      <footer>
        <kbd>/</kbd> search · <kbd>Esc</kbd> clear · <kbd>T</kbd> theme · <kbd>E</kbd> edit mode
      </footer>
    <//>
  `;
}

// ============================================================
// Mount + Service Worker
// ============================================================

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}

render(html`<${App} />`, document.getElementById('app'));
