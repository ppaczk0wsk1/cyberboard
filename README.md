# Cyberboard

A self-contained homelab dashboard for managing self-hosted services, tutorials, bookmarks, and quick notes — built with Preact, backed by a JSON file, no build step.

![Dark theme](https://img.shields.io/badge/theme-dark%20%2F%20light-6c8cff) ![No dependencies](https://img.shields.io/badge/deps-zero-4ade80) ![PWA](https://img.shields.io/badge/PWA-installable-fb923c)

## Quick Start

```bash
git clone https://github.com/ppaczk0wsk1/cyberboard && cd cyberboard
python3 server.py
```

Open [http://localhost:8900](http://localhost:8900)

## Features

**Services Dashboard**

- 41 pre-configured homelab services (Linkwarden, Vaultwarden, Nextcloud, Jellyfin, Grafana, and more)
- Server-side health checks with live status dots (green/red) — works with HTTPS, self-signed certs, auth-protected services
- Auto-refresh every 60 seconds
- Category filter tabs (Productivity, Media, Infrastructure, Security, Monitoring, Development, Networking, Storage, Automation)
- Favorite services with a star — highlighted with a yellow border

**Tutorials & Learning**

- 28 tutorial cards covering Terraform, Kubernetes, Docker, CI/CD, Ansible, Linux networking, and more
- Searchable and filterable alongside services

**Built-in Editor** (press `E` or click the pencil icon)

- Add, edit, and delete services, tutorials, and bookmarks
- Drag-and-drop to reorder cards
- Searchable emoji picker (250+ emojis organized by category) and color selector
- Fetch favicons from service URLs to replace emoji icons
- Export/import JSON backups
- Reset to defaults

**Extras**

- Search across everything with `/`
- Light/dark theme toggle (`T`)
- Weather widget (via wttr.in, no API key)
- Time-based greeting
- Scratchpad for quick notes
- Editable network quick reference
- PWA — installable as a desktop/mobile app with offline support

## File Structure

```
cyberboard/
├── index.html           # HTML shell + import map
├── style.css                # All styles
├── app.js                   # Root Preact component + mount
├── lib/
│   ├── preact.js            # Preact/HTM re-exports
│   ├── icons.js             # Lucide icon re-exports (UI chrome)
│   ├── context.js           # AppContext
│   ├── constants.js         # Emojis, colors, categories
│   └── data.js              # Data loading, saving, helpers
├── components/
│   ├── Header.js            # Header + Clock
│   ├── Weather.js           # Weather widget
│   ├── SearchBar.js         # Search input
│   ├── StatsBar.js          # Stats cards
│   ├── FilterTabs.js        # Category filter tabs
│   ├── Section.js           # Collapsible section wrapper
│   ├── ServiceCard.js       # Service card (favicon, health, drag)
│   ├── TutorialCard.js      # Tutorial card
│   ├── BookmarkItem.js      # Bookmark link
│   ├── Modal.js             # Add/edit modal form
│   ├── IconPicker.js        # Searchable emoji picker
│   ├── DynamicIcon.js       # Emoji renderer
│   ├── Notepad.js           # Scratchpad / network notes
│   └── Toolbar.js           # SaveStatus, DataActions, InstallButton
├── data.json                # All user data (gitignored)
├── data.json.default        # Pristine defaults for reset
├── server.py                # Zero-dependency Python server
├── manifest.json            # PWA manifest
├── sw.js                    # Service worker
├── favicon.svg              # SVG favicon
├── icon-192.png             # PWA icon 192x192
├── icon-512.png             # PWA icon 512x512
├── Dockerfile               # Online (CDN-backed)
├── Dockerfile.offline       # Offline (vendors JS dependencies)
├── docker-compose.yml
├── vendor-download.py       # Downloads vendor deps for offline builds
└── README.md
```

## Tech Stack

- **[Preact](https://preactjs.com/)** — lightweight React alternative (3KB)
- **[HTM](https://github.com/developit/htm)** — tagged template JSX alternative (no build step)
- **[Lucide](https://lucide.dev/)** — clean SVG icon library (tree-shakeable)
- **Import Maps** — bare specifier imports, no bundler needed
- All loaded from [esm.sh](https://esm.sh/) CDN — zero `npm install`

## How It Works

`server.py` is a minimal Python HTTP server (stdlib only, no pip installs) with three endpoints:

| Endpoint      | Method | Purpose                                                      |
| ------------- | ------ | ------------------------------------------------------------ |
| `/*`          | GET    | Serve static files (HTML, CSS, JS)                           |
| `/api/health` | GET    | Ping all service URLs server-side, return `{id: true/false}` |
| `/api/save`   | POST   | Write the full JSON body to `data.json`                      |

Health checks run server-side in parallel (up to 20 threads), accept self-signed certs, and treat any HTTP response (including 401/403) as "online." Only connection failures and timeouts mean "down."

The dashboard loads `data.json` on startup and sends `POST /api/save` whenever you make a change (debounced 400ms). All data lives in one JSON file — easy to back up, version control, or sync.

## Configuration

**Change the port:**

```bash
PORT=3000 python3 server.py
```

**Customize services:**

Edit `data.json` directly or use the built-in editor. Each service has:

```json
{
  "id": "s1",
  "name": "Linkwarden",
  "url": "http://linkwarden.local",
  "desc": "Bookmark manager",
  "icon": "🔖",
  "color": "blue",
  "cat": "productivity",
  "tags": "linkwarden bookmarks"
}
```

Available colors: `blue`, `green`, `orange`, `purple`, `cyan`, `pink`, `red`, `yellow`

## Keyboard Shortcuts

| Key     | Action                     |
| ------- | -------------------------- |
| `/`     | Focus search               |
| `Esc`   | Clear search / close modal |
| `T`     | Toggle light/dark theme    |
| `E`     | Toggle edit mode           |
| `Enter` | Submit modal form          |

## Docker

**Online (default)** — uses CDN for JS dependencies, smaller image:

```bash
docker compose up -d
```

**Offline** — vendors all JS dependencies into the image, works on isolated networks:

```bash
docker compose --profile offline up -d cyberboard-offline
```

**Or build and run manually:**

```bash
docker build -t cyberboard .
docker run -d -p 8900:8900 -v ./data.json:/app/data.json --name cyberboard cyberboard
```

`data.json` is mounted as a volume so your edits persist across container restarts. The image ships with `data.json.default` — on first run it copies it to `data.json` inside the container, but the volume mount overrides it with your local file.

**Custom port:**

```yaml
# docker-compose.yml
ports:
  - "3000:8900"
```

## License

MIT
