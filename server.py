#!/usr/bin/env python3
"""Minimal server for Cyberboard dashboard. No dependencies beyond stdlib."""

import http.server
import json
import os
import shutil
import ssl
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed

PORT = int(os.environ.get("PORT", 8900))
DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(DIR, "data.json")
DEFAULT_FILE = os.path.join(DIR, "data.json.default")

# Auto-create data.json from defaults on first run
if not os.path.exists(DATA_FILE) and os.path.exists(DEFAULT_FILE):
    shutil.copy2(DEFAULT_FILE, DATA_FILE)
    print(f"Created {DATA_FILE} from defaults")


# SSL context that accepts self-signed certs (common in homelabs)
SSL_CTX = ssl.create_default_context()
SSL_CTX.check_hostname = False
SSL_CTX.verify_mode = ssl.CERT_NONE

HEALTH_TIMEOUT = int(os.environ.get("HEALTH_TIMEOUT", 5))


def check_url(url):
    """Ping a URL. Returns True if the service responds (any HTTP status)."""
    try:
        req = urllib.request.Request(url, method="HEAD")
        urllib.request.urlopen(req, timeout=HEALTH_TIMEOUT, context=SSL_CTX)
        return True
    except urllib.error.HTTPError:
        # 401, 403, 500, etc. — service is up, just not giving a 2xx
        return True
    except Exception:
        # Connection refused, timeout, DNS failure — actually down
        try:
            req = urllib.request.Request(url, method="GET")
            urllib.request.urlopen(req, timeout=HEALTH_TIMEOUT, context=SSL_CTX)
            return True
        except urllib.error.HTTPError:
            return True
        except Exception:
            return False


def run_health_checks():
    """Read data.json, ping all service URLs in parallel, return results."""
    try:
        with open(DATA_FILE) as f:
            data = json.load(f)
    except Exception:
        return {}

    services = data.get("services", [])
    results = {}

    with ThreadPoolExecutor(max_workers=20) as pool:
        futures = {pool.submit(check_url, s["url"]): s["id"] for s in services}
        for future in as_completed(futures):
            sid = futures[future]
            try:
                results[sid] = future.result()
            except Exception:
                results[sid] = False

    return results


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIR, **kwargs)

    def handle(self):
        try:
            super().handle()
        except BrokenPipeError:
            pass  # Browser closed connection early — harmless

    def do_GET(self):
        if self.path == "/api/health":
            results = run_health_checks()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(results).encode())
        else:
            super().do_GET()

    def do_POST(self):
        if self.path == "/api/save":
            length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(length)
            try:
                data = json.loads(body)
                with open(DATA_FILE, "w") as f:
                    json.dump(data, f, indent=2, ensure_ascii=False)
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(b'{"ok":true}')
            except Exception as e:
                self.send_response(500)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode())
        else:
            self.send_response(404)
            self.end_headers()

    def log_message(self, fmt, *args):
        # Quieter logs: only show non-200 or POST
        status = args[1] if len(args) > 1 else ""
        if "POST" in str(args[0]) or str(status) != "200":
            super().log_message(fmt, *args)


if __name__ == "__main__":
    server = http.server.HTTPServer(("0.0.0.0", PORT), Handler)
    print(f"Cyberboard running at http://localhost:{PORT}/index.html")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down.")
        server.server_close()
