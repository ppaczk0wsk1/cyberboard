import { html } from '../lib/preact.js';

export function StatsBar({ serviceCount, tutorialCount, onlineCount, favoriteCount }) {
  const uptime = serviceCount > 0 ? Math.round((onlineCount / serviceCount) * 100) + '%' : '--';
  const onlineText = onlineCount >= 0 ? `${onlineCount}/${serviceCount}` : '--';

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
        <div class="label">Uptime</div>
        <div class="value">${uptime}</div>
      </div>
      <div class="stat-card">
        <div class="label">Favorites</div>
        <div class="value" style="color:var(--yellow)">${favoriteCount}</div>
      </div>
    </div>
  `;
}
