# Cyberboard

A self-contained homelab dashboard for managing self-hosted services, tutorials, bookmarks, and quick notes — all from a single HTML page backed by a JSON file.

![Dark theme](https://img.shields.io/badge/theme-dark%20%2F%20light-6c8cff) ![No dependencies](https://img.shields.io/badge/deps-zero-4ade80) ![PWA](https://img.shields.io/badge/PWA-installable-fb923c)

## Quick Start

```bash
git clone <repo-url> cyberboard && cd cyberboard
python3 server.py
```

Open [http://localhost:8900/dashboard.html](http://localhost:8900/dashboard.html)

## Features

**Services Dashboard**
- 41 pre-configured homelab services (Linkwarden, Vaultwarden, Nextcloud, Jellyfin, Grafana, and more)
- Health check pings with live status dots (green/red)
- Auto-refresh every 60 seconds
- Category filter tabs (Productivity, Media, Infrastructure, Security, Monitoring, Development, Networking, Storage, Automation)
- Favorite services with a star — highlighted with a yellow border

**Tutorials & Learning**
- 28 tutorial cards covering Terraform, Kubernetes, Docker, CI/CD, Ansible, Linux networking, and more
- Searchable and filterable alongside services

**Built-in Editor** (press `E` or click the pencil icon)
- Add, edit, and delete services, tutorials, and bookmarks
- Drag-and-drop to reorder cards
- Emoji icon picker and color selector
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
├── dashboard.html       # The dashboard UI (single-page app)
├── data.json            # All data (services, tutorials, bookmarks, notes)
├── data.json.default    # Pristine defaults (used by "Reset to Defaults")
├── server.py            # Zero-dependency Python HTTP server
├── manifest.json        # PWA manifest
├── sw.js                # Service worker for offline caching
├── Dockerfile           # Container image definition
├── docker-compose.yml   # Compose config with volume mount
├── .dockerignore
└── README.md
```

## How It Works

`server.py` is a minimal Python HTTP server (stdlib only, no pip installs) that:
- Serves static files from the project directory
- Exposes `POST /api/save` to write changes back to `data.json`

The dashboard loads `data.json` on startup and sends a `POST /api/save` whenever you make a change (debounced 400ms). All data lives in one JSON file — easy to back up, version control, or sync.

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

| Key | Action |
|-----|--------|
| `/` | Focus search |
| `Esc` | Clear search / close modal |
| `T` | Toggle light/dark theme |
| `E` | Toggle edit mode |
| `Enter` | Submit modal form |

## Docker

**Using Docker Compose (recommended):**

```bash
docker compose up -d
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

Or with `docker run`:

```bash
docker run -d -p 3000:8900 -v ./data.json:/app/data.json cyberboard
```

## License

MIT
