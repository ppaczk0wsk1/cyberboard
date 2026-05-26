#!/usr/bin/env python3
"""Download and patch vendor dependencies from esm.sh for offline use."""

import os
import urllib.request

DIR = os.path.dirname(os.path.abspath(__file__))
VENDOR_DIR = os.path.join(DIR, "vendor")

FILES = {
    "preact.js": "https://esm.sh/stable/preact@10.25.4/es2022/preact.mjs",
    "preact-hooks.js": "https://esm.sh/stable/preact@10.25.4/es2022/hooks.js",
    "htm.js": "https://esm.sh/stable/htm@3.1.1/es2022/htm.bundle.mjs",
    "lucide-preact.js": "https://esm.sh/stable/lucide-preact@0.474.0/es2022/lucide-preact.bundle.mjs",
}

# esm.sh bakes in absolute import paths — fix them to bare specifiers for the import map
FIXUPS = {
    "preact-hooks.js": ('from"/stable/preact@10.25.4/es2022/preact.mjs"', 'from"preact"'),
    "lucide-preact.js": ('from"/preact@^10.5.13?target=es2022"', 'from"preact"'),
}

os.makedirs(VENDOR_DIR, exist_ok=True)

for name, url in FILES.items():
    dest = os.path.join(VENDOR_DIR, name)
    print(f"Downloading {name}...")
    urllib.request.urlretrieve(url, dest)

    if name in FIXUPS:
        with open(dest, "r") as f:
            content = f.read()
        old, new = FIXUPS[name]
        content = content.replace(old, new)
        with open(dest, "w") as f:
            f.write(content)

print("Done.")
