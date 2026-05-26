/** Load dashboard data from the server */
export async function loadData() {
  const res = await fetch("data.json?t=" + Date.now());
  return res.json();
}

/** Debounced save to server — writes data.json via POST /api/save */
let saveTimer = null;

export function saveData(data, showToast) {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    try {
      const res = await fetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data, null, 2),
      });
      if (!res.ok) throw new Error();
      showToast("Saved to data.json");
    } catch {
      showToast("Save failed — is server.py running?", true);
    }
  }, 400);
}

/** Generate a short unique ID */
export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
