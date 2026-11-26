"use client";
import { useEffect, useRef, useState } from "react";
import {
  FiExternalLink,
  FiPause,
  FiPlay,
  FiSkipBack,
  FiSkipForward,
  FiVolume2,
  FiVolumeX,
  FiX,
} from "react-icons/fi";
import { Song } from "@/types";
import usePlayer from "@/hooks/usePlayer";
import { loadYouTube, type YouTubePlayer } from "@/libs/youtube";
import MediaItem from "./MediaItem";
import LikeButton from "./LikeButton";
import Slider from "./Slider";
function advance(direction: number) {
  const queue = usePlayer.getState();
  const i = queue.ids.indexOf(queue.activeId!);
  if (queue.ids.length)
    queue.setId(
      queue.ids[(i + direction + queue.ids.length) % queue.ids.length],
    );
}
export default function YouTubePlayerContent({ song }: { song: Song }) {
  const queue = usePlayer(),
    host = useRef<HTMLDivElement>(null),
    video = useRef<YouTubePlayer | null>(null),
    lastVolume = useRef(70);
  const [ready, setReady] = useState(false),
    [playing, setPlaying] = useState(false),
    [error, setError] = useState(""),
    [time, setTime] = useState(0),
    [duration, setDuration] = useState(0),
    [volume, setVolume] = useState(0.7),
    [hint, setHint] = useState("Opening the official player…");
  useEffect(() => {
    let alive = true;
    const timeout = window.setTimeout(() => {
      if (alive && !video.current?.getDuration?.())
        setError(
          "The player is taking a little longer. You can open the official recording on YouTube.",
        );
    }, 15000);
    loadYouTube()
      .then((api) => {
        if (!alive || !host.current) return;
        const mount = document.createElement("div");
        host.current.appendChild(mount);
        video.current = new api.Player(mount, {
          videoId: song.youtube_id!,
          width: "100%",
          height: "100%",
          playerVars: {
            autoplay: 1,
            playsinline: 1,
            origin: window.location.origin,
            rel: 0,
          },
          events: {
            onReady: ({ target }) => {
              if (!alive) return;
              clearTimeout(timeout);
              setReady(true);
              setHint("Official recording · YouTube");
              const iframe = target.getIframe();
              iframe.title = song.title + " — official YouTube player";
              iframe.referrerPolicy = "strict-origin-when-cross-origin";
              target.setVolume(70);
              target.playVideo();
            },
            onStateChange: ({ data }) => {
              if (!alive) return;
              setPlaying(data === 1);
              if (data === 1) setError("");
              if (data === 0) advance(1);
            },
            onError: () => {
              if (alive) {
                clearTimeout(timeout);
                setPlaying(false);
                setError(
                  "This recording cannot play in the embedded player. Open the official video on YouTube.",
                );
              }
            },
            onAutoplayBlocked: () => {
              if (alive) {
                setPlaying(false);
                setHint("Press play in the video to begin.");
              }
            },
          },
        });
      })
      .catch(() => {
        if (alive)
          setError(
            "YouTube could not connect. Open the official video to continue.",
          );
      });
    const poll = window.setInterval(() => {
      const p = video.current;
      if (!p) return;
      try {
        setTime(p.getCurrentTime() || 0);
        setDuration(p.getDuration() || 0);
        const v = p.isMuted() ? 0 : p.getVolume();
        if (Number.isFinite(v)) {
          setVolume(v / 100);
          if (v) lastVolume.current = v;
        }
      } catch {
        /* The iframe is still connecting. */
      }
    }, 500);
    const pauseForVisibility = () => {
      if (document.hidden) video.current?.pauseVideo();
    };
    document.addEventListener("visibilitychange", pauseForVisibility);
    const observer = new MutationObserver(() => {
      if (
        document.querySelector(
          '.modal-panel[data-state="open"],.library-drawer[data-state="open"],.mobile-navigation[data-state="open"]',
        )
      )
        video.current?.pauseVideo();
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["data-state"],
    });
    return () => {
      alive = false;
      clearTimeout(timeout);
      clearInterval(poll);
      observer.disconnect();
      document.removeEventListener("visibilitychange", pauseForVisibility);
      video.current?.destroy();
      video.current = null;
    };
  }, [song.youtube_id, song.title]);
  function changeVolume(v: number) {
    if (!ready) return;
    if (v) video.current?.unMute();
    else video.current?.mute();
    video.current?.setVolume(v * 100);
    setVolume(v);
    if (v) lastVolume.current = v * 100;
  }
  const stamp = (s: number) =>
    `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  return (
    <>
      <section
        className="official-player-panel"
        aria-label="Official YouTube music video"
      >
        <div className="official-player-heading">
          <div>
            <span className="eyebrow">OFFICIAL YOUTUBE PLAYER</span>
            <p>{song.title}</p>
          </div>
          <button
            className="player-icon"
            aria-label="Stop playback"
            onClick={queue.reset}
          >
            <FiX size={19} />
          </button>
        </div>
        <div className="official-video-frame" ref={host} />
        {error ? (
          <p className="official-player-message" role="status">
            {error}
          </p>
        ) : (
          <p className="official-player-hint" role="status">
            {hint}
          </p>
        )}
        <div className="official-source">
          <a
            href={"https://www.youtube.com/watch?v=" + song.youtube_id}
            target="_blank"
            rel="noopener"
          >
            Watch on YouTube <FiExternalLink />
          </a>
          <span>{song.source_channel}</span>
        </div>
      </section>
      <div className="player-content">
        <div className="player-record">
          <MediaItem data={song} />
          <LikeButton songId={song.id} />
        </div>
        <div className="player-centre">
          <div className="transport">
            <button
              className="player-icon"
              aria-label="Previous song"
              onClick={() => advance(-1)}
            >
              <FiSkipBack size={18} />
            </button>
            <button
              className="transport-play"
              aria-label={playing ? "Pause" : "Play"}
              disabled={!ready || !!error}
              onClick={() =>
                playing
                  ? video.current?.pauseVideo()
                  : video.current?.playVideo()
              }
            >
              {playing ? <FiPause size={20} /> : <FiPlay size={20} />}
            </button>
            <button
              className="player-icon"
              aria-label="Next song"
              onClick={() => advance(1)}
            >
              <FiSkipForward size={18} />
            </button>
          </div>
          <div className="seek-control">
            <span>{stamp(time)}</span>
            <input
              aria-label="Seek"
              type="range"
              min={0}
              max={duration || 1}
              step={0.1}
              disabled={!ready || !!error}
              value={Math.min(time, duration || 1)}
              style={
                {
                  "--progress": (duration ? (time / duration) * 100 : 0) + "%",
                } as React.CSSProperties
              }
              onChange={(e) => {
                const next = Number(e.target.value);
                video.current?.seekTo(next, true);
                setTime(next);
              }}
            />
            <span>{stamp(duration)}</span>
          </div>
        </div>
        <div className="player-volume">
          <span className="eyebrow">VIA YOUTUBE</span>
          <button
            className="player-icon"
            aria-label={volume ? "Mute" : "Unmute"}
            disabled={!ready}
            onClick={() => changeVolume(volume ? 0 : lastVolume.current / 100)}
          >
            {volume ? <FiVolume2 size={19} /> : <FiVolumeX size={19} />}
          </button>
          <div className="volume-slider">
            <Slider
              value={volume}
              onChange={changeVolume}
              disabled={!ready || !!error}
            />
          </div>
        </div>
      </div>
    </>
  );
}
