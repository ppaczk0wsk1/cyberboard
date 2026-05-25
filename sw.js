const CACHE_NAME = 'cyberboard-v4';
const ASSETS = [
  './dashboard.html',
  './style.css',
  './app.js',
  './manifest.json',
  './lib/preact.js',
  './lib/icons.js',
  './lib/context.js',
  './lib/constants.js',
  './lib/data.js',
  './components/Header.js',
  './components/Weather.js',
  './components/SearchBar.js',
  './components/StatsBar.js',
  './components/FilterTabs.js',
  './components/Section.js',
  './components/ServiceCard.js',
  './components/TutorialCard.js',
  './components/BookmarkItem.js',
  './components/Modal.js',
  './components/Notepad.js',
  './components/Toolbar.js',
  './components/DynamicIcon.js',
  './components/IconPicker.js',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
