import { useId } from "react";

type ArtworkVariant = "purpose" | "balance" | "attention";

const palettes: Record<
  ArtworkVariant,
  {
    sky: string;
    light: string;
    far: string;
    mid: string;
    near: string;
    sun: string;
  }
> = {
  purpose: {
    sky: "#f2ead7",
    light: "#faf5e8",
    far: "#c7cdb6",
    mid: "#a3b398",
    near: "#738a71",
    sun: "#cf9b5d",
  },
  balance: {
    sky: "#194f48",
    light: "#739e8b",
    far: "#638d79",
    mid: "#36725f",
    near: "#123d3a",
    sun: "#eed9a1",
  },
  attention: {
    sky: "#d78a45",
    light: "#eed9a1",
    far: "#b88d56",
    mid: "#6f8869",
    near: "#28574e",
    sun: "#f8e8b9",
  },
};

/** Original, decorative landscape geometry. No religious figures or text. */
export function PracticeArtwork({
  variant = "purpose",
  className = "",
}: {
  variant?: ArtworkVariant;
  className?: string;
}) {
  const id = useId().replace(/:/g, "");
  const skyId = `practice-sky-${id}`;
  const clipId = `practice-clip-${id}`;
  const palette = palettes[variant];

  return (
    <svg
      className={`practice-artwork ${className}`.trim()}
      viewBox="0 0 480 320"
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={skyId} x1="0" y1="0" x2="0.8" y2="1">
          <stop stopColor={palette.light} />
          <stop offset="1" stopColor={palette.sky} />
        </linearGradient>
        <clipPath id={clipId}>
          <path d="M0 0h480v320H0z" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <path d="M0 0h480v320H0z" fill={`url(#${skyId})`} />

        {variant === "purpose" && (
          <>
            <circle cx="322" cy="90" r="29" fill={palette.sun} opacity=".8" />
            <path
              d="M-30 205C48 186 66 136 143 156s78 36 133 13 111-33 234 9v157H-30Z"
              fill={palette.far}
            />
            <path
              d="M-20 256c70-65 133-32 198-61s127-25 186 11 91 25 136 13v116H-20Z"
              fill={palette.mid}
            />
            <path
              d="M-20 277c88-21 131-60 228-34s180 59 296 27v65H-20Z"
              fill={palette.near}
            />
            <path
              d="M197 323c18-27 91-41 87-62-3-16-45-28-40-43 3-8 14-16 23-20-25 9-47 22-37 39 11 18 53 28 39 42-13 13-52 24-72 44Z"
              fill={palette.light}
              opacity=".7"
            />
            <g
              fill="none"
              stroke={palette.light}
              strokeWidth="1.2"
              opacity=".42"
            >
              <path d="M8 214c50-3 77-40 125-42" />
              <path d="M28 226c45-6 69-27 96-32" />
              <path d="M321 225c44 14 62 33 130 27" />
              <path d="M333 235c31 12 58 27 104 26" />
            </g>
            <g transform="translate(350 151)">
              <path d="M0 55V22a20 20 0 0 1 40 0v33Z" fill="#ede7d3" />
              <path d="M9 55V23a11 11 0 0 1 22 0v32Z" fill="#78917b" />
              <path d="M-6 55h52v5H-6z" fill="#d9d2bc" />
            </g>
            <g
              fill="none"
              stroke="#49634e"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M70 312c4-24 6-46 1-72M74 280l-16-17m17 1 13-16" />
              <path d="M64 309c-5-13-15-20-27-25" strokeWidth="1.5" />
            </g>
            <g fill="#49634e">
              <path d="M70 252c-12-2-16-12-14-22 12 4 17 10 14 22Z" />
              <path d="M79 268c-2-14 3-22 16-26 1 11-4 20-16 26Z" />
              <path d="M57 283c-13 2-22-3-24-14 11 0 19 4 24 14Z" />
            </g>
          </>
        )}

        {variant === "balance" && (
          <>
            <circle cx="245" cy="99" r="27" fill={palette.sun} opacity=".8" />
            <path
              d="M-20 192c79-69 107-54 164-14s97 12 135 0 98-11 222 47v110H-20Z"
              fill={palette.far}
            />
            <path
              d="M-20 228c89-18 114 23 177 14s103-60 174-61 113 20 172 54v100H-20Z"
              fill={palette.mid}
            />
            <path
              d="M-20 261c84-18 139 1 208-4 111-8 169-38 315-5v83H-20Z"
              fill="#dce4d8"
            />
            <g fill="none" stroke="#f8f5e9" strokeWidth="1.4" opacity=".7">
              <path d="M148 270c42 4 92-6 163-3" />
              <path d="M82 283c69-6 129 5 186-2" />
              <path d="M294 291c28-4 62-2 98 1" />
              <path d="M212 252h32m-16-6h31" />
            </g>
            <path
              d="M-20 305c61-39 87-14 145-18s77 6 91 48H-20Zm364 30c29-44 81-72 159-41v41Z"
              fill={palette.near}
            />
            <g
              fill="none"
              stroke={palette.light}
              strokeWidth="1.2"
              opacity=".45"
            >
              <path d="M303 195c41-3 65 6 106 23" />
              <path d="M325 202c26 1 41 4 59 11" />
              <path d="M18 192c36-28 61-27 83-18" />
            </g>
            <g transform="translate(101 202)" fill="#607c69">
              <path d="M-3 30h6V-8h-6Z" />
              <ellipse cy="-15" rx="17" ry="30" />
              <ellipse cx="-13" cy="-3" rx="12" ry="19" />
              <ellipse cx="12" cy="-3" rx="12" ry="22" />
            </g>
            <g stroke="#e8eee1" strokeWidth="1" opacity=".55">
              <path d="M101 217v-38m0 28-9-10m9 3 8-13" fill="none" />
            </g>
            <g fill="#547363">
              <ellipse cx="412" cy="283" rx="15" ry="6" />
              <ellipse cx="421" cy="272" rx="9" ry="5" />
              <path d="M389 306c-3-19-1-34 4-45 4 14 4 27-4 45Z" />
            </g>
          </>
        )}

        {variant === "attention" && (
          <>
            <circle cx="351" cy="91" r="26" fill={palette.sun} opacity=".78" />
            <path
              d="M-20 215c64-21 111-88 184-63s92 28 156 10 110 23 183 51v122H-20Z"
              fill={palette.far}
            />
            <path
              d="M-20 255c60-43 121-49 193-31s84 4 139-16 123-16 191 20v107H-20Z"
              fill={palette.mid}
            />
            <path
              d="M-20 297c69-38 109-19 186-14s97-48 170-40 112 14 167 56v36H-20Z"
              fill={palette.near}
            />
            <g
              fill="none"
              stroke={palette.light}
              strokeWidth="1.3"
              opacity=".46"
            >
              <path d="M192 270c42-5 74-35 121-36 34-1 65 3 95 13" />
              <path d="M189 280c57-6 87-35 137-33 28 0 49 3 70 9" />
              <path d="M203 289c51-5 87-30 126-29 15 0 39 3 50 6" />
              <path d="M18 233c33-15 66-21 97-17" />
            </g>
            <g transform="translate(94 179)">
              <path d="M0 59V24a23 23 0 0 1 46 0v35Z" fill="#eee8d5" />
              <path d="M10 59V25a13 13 0 0 1 26 0v34Z" fill="#859575" />
              <path d="M-7 59h60v5H-7z" fill="#dbd4bf" />
              <path d="M7 71h34m-22 7h43" stroke="#ece5d0" strokeWidth="3" />
            </g>
            <g
              fill="none"
              stroke="#435f48"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M421 328c-5-34-1-66 8-104m-16 104c0-25-8-47-20-66" />
              <path
                d="m422 279-18-14m21-6 15-17m-9 62 12-14"
                strokeWidth="1.4"
              />
            </g>
            <g fill="#435f48">
              <path d="M428 244c-7-8-8-18 1-29 6 11 7 19-1 29Z" />
              <path d="M429 266c-1-14 5-23 18-25-1 12-6 20-18 25Z" />
              <path d="M418 282c-12-1-23-10-26-23 14 3 23 10 26 23Z" />
              <path d="M395 283c-12-1-20-11-19-23 12 5 18 12 19 23Z" />
              <path d="M430 308c1-11 9-19 22-19-5 12-12 18-22 19Z" />
            </g>
          </>
        )}
      </g>
    </svg>
  );
}
