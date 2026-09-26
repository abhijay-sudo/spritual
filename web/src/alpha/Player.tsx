import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { Content } from "./types";
import { useAlpha } from "./context";
const stamp = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
export default function Player({
  content,
  cohortId,
  sample = false,
}: {
  content: Content;
  cohortId?: string;
  sample?: boolean;
}) {
  const { actor, dispatch, prefs, localNotice } = useAlpha();
  const navigate = useNavigate();
  const audio = useRef<HTMLAudioElement>(null);
  const restored = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(content.seconds);
  const [ready, setReady] = useState(false);
  const [ended, setEnded] = useState(false);
  const [problem, setProblem] = useState("");
  const [buffering, setBuffering] = useState(false);
  const [reload, setReload] = useState(0);
  const [source, setSource] = useState(content.audioUrl);
  const [download, setDownload] = useState("");
  const [saving, setSaving] = useState(false);
  const positionKey = `spritual_alpha_playback_${sample ? "sample" : actor.id}_${content.id}`;
  const cacheName = `spritual-alpha-media-${actor.id}`;
  const cacheKey = new URL(
    `/alpha-media/${content.id}-v${content.version}`,
    location.origin,
  ).href;
  useEffect(() => {
    let cancelled = false;
    let objectUrl = "";
    let expiryTimer: ReturnType<typeof setTimeout> | undefined;
    setSource(content.audioUrl);
    setDownload("");
    setProblem("");
    restored.current = false;
    setReady(false);
    setPlaying(false);
    setEnded(false);
    setPosition(0);
    if (!sample && "caches" in window)
      caches
        .open(cacheName)
        .then(async (cache) => {
          const response = await cache.match(cacheKey);
          if (!response) return;
          const until = Number(response.headers.get("x-alpha-valid-until"));
          if (!Number.isFinite(until) || until <= Date.now()) {
            await cache.delete(cacheKey);
            return;
          }
          const blob = await response.blob();
          if (cancelled) return;
          objectUrl = URL.createObjectURL(blob);
          setSource(objectUrl);
          expiryTimer = setTimeout(() => { audio.current?.pause(); setReload(n => n + 1); }, Math.min(until - Date.now(), 86400000));
          setDownload(
            `Saved on this device until ${new Date(until).toLocaleString()}.`,
          );
        })
        .catch(() =>
          setDownload(
            "Offline storage is unavailable; online playback still works.",
          ),
        );
    return () => {
      cancelled = true;
      if (expiryTimer) clearTimeout(expiryTimer);
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [
    content.id,
    content.version,
    content.audioUrl,
    cacheName,
    cacheKey,
    sample,
    reload,
  ]);
  useEffect(() => {
    const element = audio.current;
    const pause = () => {
      if (document.hidden) element?.pause();
    };
    document.addEventListener("visibilitychange", pause);
    return () => {
      element?.pause();
      document.removeEventListener("visibilitychange", pause);
    };
  }, []);
  const savePosition = () => {
    const a = audio.current;
    if (!a || !restored.current) return;
    setPosition(a.currentTime);
    try {
      localStorage.setItem(positionKey, String(a.currentTime));
    } catch {
      localNotice(
        "Playback works, but this browser could not save your position.",
      );
    }
  };
  const toggle = async () => {
    const a = audio.current;
    if (!a) return;
    if (!a.paused) {
      a.pause();
      return;
    }
    try {
      setProblem("");
      await a.play();
    } catch {
      setProblem(
        "Playback could not start. Check your connection and try again.",
      );
    }
  };
  const seek = (n: number) => {
    if (audio.current && Number.isFinite(n)) {
      audio.current.currentTime = Math.max(0, Math.min(n, duration));
      savePosition();
    }
  };
  const downloadAudio = async () => {
    setSaving(true);
    try {
      if (!("caches" in window))
        throw Error("This browser does not support offline storage.");
      if (content.audioUrl !== "/audio/alpha-sound-check.wav")
        throw Error("This media has not been authorized for demo download.");
      const response = await fetch(content.audioUrl, {
        credentials: "same-origin",
      });
      if (!response.ok) throw Error("Audio download failed.");
      const blob = await response.blob();
      if (blob.size > 2_000_000 || !blob.type.startsWith("audio/"))
        throw Error("The audio file is not a supported size or type.");
      const until = Math.min(
        Date.now() + 86400000,
        Date.parse(content.rights.expiresAt),
      );
      const cache = await caches.open(cacheName);
      await cache.put(
        cacheKey,
        new Response(blob, {
          headers: {
            "content-type": blob.type,
            "x-alpha-valid-until": String(until),
          },
        }),
      );
      setDownload(
        `Saved on this device until ${new Date(until).toLocaleString()}.`,
      );
    } catch (e) {
      setDownload(
        e instanceof Error ? e.message : "Download failed. Please retry.",
      );
    } finally {
      setSaving(false);
    }
  };
  const removeDownload = async () => {
    try {
      await caches.open(cacheName).then((c) => c.delete(cacheKey));
      audio.current?.pause();
      setReload((n) => n + 1);
      setDownload("Download removed.");
    } catch {
      setDownload("Could not remove the download. Please retry.");
    }
  };
  const finish = () => {
    audio.current?.pause();
    if (sample) {
      navigate("/alpha/sample-complete");
      return;
    }
    if (
      cohortId &&
      dispatch({
        type: "complete",
        contentId: content.id,
        cohortId,
        timeZone: prefs.timeZone,
      })
    )
      navigate(`/alpha/complete/${content.id}`);
  };
  return (
    <div className="alpha-reader alpha-stack">
      <Link className="alpha-back" to={sample ? "/alpha" : "/alpha/circle"}>
        ← {sample ? "Back to welcome" : "Back to my community"}
      </Link>
      <header>
        <p className="alpha-kicker">
          {sample ? "TRY WITHOUT AN ACCOUNT" : "YOUR PROGRAM"} · {content.audioUrl ? "AUDIO FIXTURE" : "READING PRACTICE"}
        </p>
        <h1>{content.title}</h1>
        <p className="alpha-lead">{content.purpose}</p>
      </header>
      {content.audioUrl ? <section className="alpha-player" aria-label="Audio player">
        <div className="alpha-sound-art" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
        <span className="alpha-badge">
          20-second sound check · no spoken teaching
        </span>
        <audio
          key={`${content.id}-${source}-${reload}`}
          ref={audio}
          src={source}
          preload="metadata"
          onLoadedMetadata={() => {
            const a = audio.current!;
            if (Number.isFinite(a.duration)) {
              setDuration(a.duration);
              try {
                const n = Number(localStorage.getItem(positionKey));
                if (n > 0 && n < a.duration) a.currentTime = n;
              } catch {
                /* optional persistence */
              }
            }
            restored.current = true;
            setPosition(a.currentTime);
            setReady(true);
            setBuffering(false);
          }}
          onTimeUpdate={savePosition}
          onPlay={() => setPlaying(true)}
          onPause={() => {
            setPlaying(false);
            savePosition();
          }}
          onWaiting={() => setBuffering(true)}
          onPlaying={() => setBuffering(false)}
          onEnded={() => {
            setEnded(true);
            setPlaying(false);
          }}
          onError={() => {
            setReady(false);
            setPlaying(false);
            setProblem(
              "This audio is unavailable. You can read the complete text below, or retry.",
            );
          }}
        />
        <h2 className="alpha-player-title">A little space to begin</h2>
        <button
          className="alpha-play"
          onClick={toggle}
          aria-label={playing ? "Pause audio" : "Play audio"}
          disabled={!!problem}
        >
          {playing ? (
            <span aria-hidden="true">Ⅱ</span>
          ) : (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="m8 5 11 7-11 7z" />
            </svg>
          )}
        </button>
        <label className="alpha-seek">
          Playback position
          <input
            type="range"
            min="0"
            max={duration}
            step=".1"
            value={position}
            disabled={!ready}
            aria-valuetext={`${stamp(position)} of ${stamp(duration)}`}
            onChange={(e) => seek(Number(e.target.value))}
          />
        </label>
        <div className="alpha-row alpha-time">
          <span>{stamp(position)}</span>
          <span>{stamp(duration)}</span>
        </div>
        <div className="alpha-row alpha-player-actions">
          <button
            className="alpha-text-button"
            disabled={!ready}
            onClick={() => seek(position - 5)}
          >
            Back 5 seconds
          </button>
          <button
            className="alpha-text-button"
            disabled={!ready}
            onClick={() => seek(0)}
          >
            Start again
          </button>
        </div>
        <p role="status" className="alpha-muted">
          {buffering
            ? "Buffering…"
            : ended
              ? "Audio ended. Choose when to mark your practice complete."
              : playing
                ? "Playing"
                : "Paused · begin when you are ready"}
        </p>
        {problem && (
          <div role="alert" className="alpha-error">
            <p>{problem}</p>
            <button
              className="alpha-secondary"
              onClick={() => setReload((n) => n + 1)}
            >
              Retry audio
            </button>
          </div>
        )}
      </section> : <p className="alpha-panel">This practice is for reading. No recording has been supplied.</p>}
      <section className="alpha-transcript">
        <p className="alpha-kicker">THE PRACTICE TEXT</p>
        <h2>Read at your own pace.</h2>
        <p className="alpha-reading-text">{content.transcript}</p>
      </section>
      <details className="alpha-disclosure">
        <summary>Source & content status</summary>
        <p>{content.source}</p>
        <p>
          Original non-doctrinal development fixture. {content.audioUrl ? "The audio contains three synthesized tones, not a teacher’s voice." : "No audio recording is supplied."} Demo workflow approval is not a human teaching attestation.
        </p>
        <p>
          Version {content.version} · {content.status.replace("_", " ")} ·{" "}
          {content.rights.language}
        </p>
      </details>
      {!sample && content.audioUrl && (
        <details className="alpha-disclosure">
          <summary>Keep this audio for offline testing</summary>
          <p>
            Download only this authorized fixture. Valid for up to 24 hours;
            browser storage can be removed by the device. Offline copies cannot
            learn of later withdrawals until reconnection. This is not DRM.
          </p>
          <div className="alpha-row">
            <button
              className="alpha-secondary"
              disabled={saving}
              onClick={downloadAudio}
            >
              {saving ? "Saving audio…" : "Download audio fixture"}
            </button>
            <button className="alpha-text-button" onClick={removeDownload}>
              Remove download
            </button>
          </div>
          <p role="status">{download}</p>
        </details>
      )}
      <button className="alpha-button" onClick={finish}>
        {sample ? "Finish the sample" : "Mark my practice complete"}
      </button>
      <p className="alpha-muted alpha-center">
        Listening is optional. Completion is your choice, not a score.
      </p>
    </div>
  );
}
