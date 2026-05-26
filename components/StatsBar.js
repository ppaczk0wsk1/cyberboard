import { html, useState, useEffect } from '../lib/preact.js';

function timeAgo(ts) {
  if (!ts) return '--';
  const seconds = Math.floor((Date.now() - ts) / 1000);
  if (seconds < 5) return 'just now';
  if (seconds < 60) return seconds + 's ago';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return minutes + 'm ago';
  return Math.floor(minutes / 60) + 'h ago';
}

export function StatsBar({ serviceCount, tutorialCount, onlineCount, favoriteCount, lastCheckTime }) {
  const onlineText = onlineCount >= 0 ? `${onlineCount}/${serviceCount}` : '--';

  // Re-render every 10s so "last check" stays fresh
  const [, tick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => tick(t => t + 1), 10000);
    return () => clearInterval(id);
  }, []);

  return html`
    <div class="stats-bar">
      <div class="stat-card">
        <div class="label">Services</div>
        <div class="value">${serviceCount}</div>
      </div>
      <div class="stat-card">
        <div class="label">Online</div>
        <div class="value" style="color:var(--green)">${onlineText}</div>
      </div>
      <div class="stat-card">
        <div class="label">Tutorials</div>
        <div class="value">${tutorialCount}</div>
      </div>
      <div class="stat-card">
        <div class="label">Favorites</div>
        <div class="value" style="color:var(--yellow)">${favoriteCount}</div>
      </div>
      <div class="stat-card">
        <div class="label">Last Check</div>
        <div class="value" style="font-size:1.1rem">${timeAgo(lastCheckTime)}</div>
      </div>
    </div>
  `;
}
