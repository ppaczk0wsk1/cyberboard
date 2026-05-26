import { html, useState, useEffect } from "../lib/preact.js";

const WEATHER_ICONS = {
  clear: "☀️",
  partlyCloudy: "⛅",
  cloudy: "☁️",
  rain: "🌧️",
  snow: "🌨️",
  storm: "⛈️",
};

function weatherIcon(code) {
  if (code === 113) return WEATHER_ICONS.clear;
  if (code === 116) return WEATHER_ICONS.partlyCloudy;
  if ([119, 122].includes(code)) return WEATHER_ICONS.cloudy;
  if (
    [176, 263, 266, 293, 296, 299, 302, 305, 308, 353, 356, 359].includes(code)
  )
    return WEATHER_ICONS.rain;
  if (
    [
      179, 182, 185, 227, 230, 323, 326, 329, 332, 335, 338, 368, 371, 374, 377,
      392, 395,
    ].includes(code)
  )
    return WEATHER_ICONS.snow;
  if ([200, 386, 389].includes(code)) return WEATHER_ICONS.storm;
  return WEATHER_ICONS.cloudy;
}

export function WeatherWidget() {
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("https://wttr.in/?format=j1", {
          signal: AbortSignal.timeout(5000),
        });
        const w = await res.json();
        const cur = w.current_condition[0];
        setWeather({
          icon: weatherIcon(parseInt(cur.weatherCode)),
          temp: cur.temp_C + "°C",
          desc:
            cur.weatherDesc[0].value +
            " · " +
            w.nearest_area[0].areaName[0].value,
        });
      } catch {}
    })();
  }, []);

  if (!weather) return null;

  return html`
    <div class="weather-widget">
      <div class="weather-icon">${weather.icon}</div>
      <div>
        <div class="weather-temp">${weather.temp}</div>
        <div class="weather-desc">${weather.desc}</div>
      </div>
    </div>
  `;
}
