import type { CSSProperties } from "react";
export type IconName =
  | "sun"
  | "book"
  | "leaf"
  | "settings"
  | "arrow"
  | "back"
  | "check"
  | "bookmark"
  | "search"
  | "close"
  | "clock"
  | "play"
  | "pause"
  | "volume"
  | "shield"
  | "chevron"
  | "download"
  | "heart";
const paths: Record<IconName, string> = {
  sun: "M3 17h18M6 14a6 6 0 0 1 12 0M12 2v3M3 7l2 2M21 7l-2 2M5 21h14",
  book: "M12 5v16M12 5C9 3 5 3 2 4v15c3-1 7-1 10 2 3-3 7-3 10-2V4c-3-1-7-1-10 1Z",
  leaf: "M5 20c1-7 6-11 13-14M4 16C0 6 10 2 21 3c0 12-6 20-14 15",
  settings:
    "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8M9 3h6l1 3 3 1 2 5-2 5-3 1-1 3H9l-1-3-3-1-2-5 2-5 3-1 1-3Z",
  arrow: "M4 12h16M14 6l6 6-6 6",
  back: "M20 12H4M10 6l-6 6 6 6",
  check: "m5 12 4 4L19 6",
  bookmark: "M6 3h12v18l-6-4-6 4V3Z",
  search: "M21 21l-5-5M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14",
  close: "m6 6 12 12M18 6 6 18",
  clock: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18M12 7v5l3 2",
  play: "m8 4 12 8-12 8V4Z",
  pause: "M8 4v16M16 4v16",
  volume: "M11 4 6 8H2v8h4l5 4V4M16 9l6 6M22 9l-6 6",
  shield: "M12 2 3 6v6c0 5 9 10 9 10s9-5 9-10V6l-9-4Zm-4 10 3 3 5-6",
  chevron: "m9 5 7 7-7 7",
  download: "M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4",
  heart: "M20 5c-3-3-7-1-8 1-1-2-5-4-8-1-5 5 3 12 8 16 5-4 13-11 8-16Z",
};
export function Icon({
  name,
  size = 22,
  style,
}: {
  name: IconName;
  size?: number;
  style?: CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      style={style}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  );
}
