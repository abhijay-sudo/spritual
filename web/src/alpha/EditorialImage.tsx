import { useState } from "react";
import media from "./mediaManifest.json";
import "./editorial-image.css";

export type EditorialAssetId = keyof typeof media;

export function EditorialImage({ asset, language = "en", decorative = false, priority = false, className = "" }: {
  asset: EditorialAssetId;
  language?: "en" | "hi";
  decorative?: boolean;
  priority?: boolean;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const item = media[asset];
  const retry = () => { setFailed(false); setAttempt(previous => previous + 1); };
  const src = attempt ? `${item.src}?retry=${attempt}` : item.src;
  const small = attempt ? `${item.small}?retry=${attempt}` : item.small;
  return <span className={`editorial-image ${className}${failed ? " editorial-image--failed" : ""}`} style={{ backgroundColor: item.fallback, aspectRatio: `${item.width} / ${item.height}` }}>
    {failed ? <span className="editorial-image-fallback" aria-hidden={decorative} role={decorative ? undefined : "img"} aria-label={decorative ? undefined : item.alt[language]}>
      {!decorative && <button type="button" onClick={retry}>{language === "hi" ? "चित्र फिर खोलें" : "Retry image"}</button>}
    </span> : <img
      src={src}
      srcSet={`${small} 480w, ${src} ${item.width}w`}
      sizes={priority ? "(max-width: 600px) 100vw, 850px" : "(max-width: 600px) 45vw, 360px"}
      width={item.width}
      height={item.height}
      alt={decorative ? "" : item.alt[language]}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      style={{ objectPosition: item.focal }}
      onError={() => { console.error(`Spritual media failed: ${asset}`); setFailed(true); }}
    />}
  </span>;
}
