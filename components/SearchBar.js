import { html, useEffect, useRef, useContext } from '../lib/preact.js';
import { SearchIcon } from '../lib/icons.js';
import { AppContext } from '../lib/context.js';

export function SearchBar() {
  const { searchQuery, setSearchQuery } = useContext(AppContext);
  const inputRef = useRef();

  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;
      if (e.key === '/') { e.preventDefault(); inputRef.current?.focus(); }
      if (e.key === 'Escape') { setSearchQuery(''); inputRef.current?.blur(); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return html`
    <div class="search-bar">
      <${SearchIcon} size=${18} />
      <input ref=${inputRef} type="text" value=${searchQuery}
             onInput=${(e) => setSearchQuery(e.target.value)}
             placeholder="Search services, tutorials, links..." autocomplete="off" />
      <span class="kbd">/</span>
    </div>
  `;
}
