import {
  getPosition,
  getMoonPosition,
  getMoonIllumination,
  getTimes,
} from "suncalc";
export const cities = {
  pune: { name: "Pune", lat: 18.5204, lng: 73.8567, zone: "Asia/Kolkata" },
  delhi: { name: "New Delhi", lat: 28.6139, lng: 77.209, zone: "Asia/Kolkata" },
  chennai: {
    name: "Chennai",
    lat: 13.0827,
    lng: 80.2707,
    zone: "Asia/Kolkata",
  },
  london: { name: "London", lat: 51.5074, lng: -0.1278, zone: "Europe/London" },
} as const;
export type City = keyof typeof cities;
export const skyPhases = [
  {
    name: "Night",
    colors: ["#070a1c", "#0c1126", "#1d2a5b"],
    elevation: -24,
    rising: true,
  },
  {
    name: "Pre-dawn",
    colors: ["#0c1126", "#1e2358", "#3b2f6b"],
    elevation: -15,
    rising: true,
  },
  {
    name: "Dawn",
    colors: ["#1d2a5b", "#5b3e7a", "#c86b7e"],
    elevation: -8,
    rising: true,
  },
  {
    name: "Sunrise",
    colors: ["#3a4a8c", "#e7a1b0", "#f3b04a"],
    elevation: 0,
    rising: true,
  },
  {
    name: "Morning",
    colors: ["#6f8fc9", "#bfd0ee", "#f6e7d2"],
    elevation: 12,
    rising: true,
  },
  {
    name: "Day",
    colors: ["#8fb3e6", "#d6e4f5", "#f4f3f6"],
    elevation: 30,
    rising: true,
  },
  {
    name: "Late afternoon",
    colors: ["#7c98d0", "#c9d3ea", "#f2dcc4"],
    elevation: 12,
    rising: false,
  },
  {
    name: "Sunset",
    colors: ["#2b3470", "#d9776a", "#f0a202"],
    elevation: 0,
    rising: false,
  },
  {
    name: "Dusk",
    colors: ["#1d2a5b", "#6b3f73", "#d0806c"],
    elevation: -8,
    rising: false,
  },
] as const;
function blend(a: string, b: string, t: number) {
  const channels = [1, 3, 5].map((i) =>
    Math.round(
      parseInt(a.slice(i, i + 2), 16) * (1 - t) +
        parseInt(b.slice(i, i + 2), 16) * t,
    ),
  );
  return `rgb(${channels.join(", ")})`;
}
export function skyAt(elevation: number, rising: boolean) {
  const indices = rising ? [0, 1, 2, 3, 4, 5] : [0, 8, 7, 6, 5];
  const phases = indices.map((i) => skyPhases[i]);
  const altitude = Math.max(-24, Math.min(30, elevation));
  const upper = Math.max(
    1,
    phases.findIndex((p) => p.elevation >= altitude),
  );
  const low = phases[upper - 1],
    high = phases[upper];
  const fraction = Math.max(
    0,
    Math.min(1, (altitude - low.elevation) / (high.elevation - low.elevation)),
  );
  const colors = low.colors.map((c, i) => blend(c, high.colors[i], fraction));
  const phase =
    elevation <= -18
      ? 0
      : elevation > 20
        ? 5
        : rising
          ? elevation <= -12
            ? 1
            : elevation <= -4
              ? 2
              : elevation <= 4
                ? 3
                : 4
          : elevation <= -4
            ? 8
            : elevation <= 4
              ? 7
              : 6;
  return {
    colors,
    name: skyPhases[phase].name,
    elevation,
    rising,
    stars: Math.max(0, Math.min(1, (-elevation - 6) / 12)),
  };
}
export function skyForDate(date: Date, city: City) {
  const { lat, lng } = cities[city];
  const sun = getPosition(date, lat, lng),
    later = getPosition(new Date(+date + 60000), lat, lng);
  return {
    ...skyAt(sun.altitude, later.altitude > sun.altitude),
    moon: { ...getMoonPosition(date, lat, lng), ...getMoonIllumination(date) },
    times: getTimes(date, lat, lng),
  };
}
/** Illuminated disk projection; an astronomical illustration, not a tithi/calendar. */
export function moonPath(fraction: number, waxing: boolean): string {
  const f = Math.max(0, Math.min(1, fraction)),
    direction = waxing ? 1 : -1;
  const edge = Array.from({ length: 33 }, (_, i) => {
    const y = -1 + i / 16;
    return [Math.sqrt(Math.max(0, 1 - y * y)) * direction, y];
  });
  const terminator = [...edge].reverse().map(([x, y]) => [x * (1 - 2 * f), y]);
  return (
    [...edge, ...terminator]
      .map(
        ([x, y], i) =>
          `${i ? "L" : "M"}${(x * 14).toFixed(3)},${(y * 14).toFixed(3)}`,
      )
      .join(" ") + " Z"
  );
}
