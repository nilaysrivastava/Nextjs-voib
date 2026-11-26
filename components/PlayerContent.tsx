"use client";
import { useEffect, useRef, useState } from "react";
import {
  FiPlay,
  FiPause,
  FiSkipBack,
  FiSkipForward,
  FiVolume2,
  FiVolumeX,
} from "react-icons/fi";
import { toast } from "react-hot-toast";
import type { Song } from "@/types";
import usePlayer from "@/hooks/usePlayer";
import LikeButton from "./LikeButton";
import MediaItem from "./MediaItem";
import Slider from "./Slider";
export default function PlayerContent({
  song,
  songUrl,
}: {
  song: Song;
  songUrl: string;
}) {
  const player = usePlayer(),
    audio = useRef<HTMLAudioElement>(null),
    lastVolume = useRef(0.7),
    [volume, setVolume] = useState(0.7),
    [playing, setPlaying] = useState(false),
    [time, setTime] = useState(0),
    [duration, setDuration] = useState(0);
  function move(direction: number) {
    const i = player.ids.indexOf(player.activeId!);
    if (player.ids.length)
      player.setId(
        player.ids[(i + direction + player.ids.length) % player.ids.length],
      );
  }
  useEffect(() => {
    const a = audio.current;
    if (!a) return;
    a.load();
    a.play().catch(() => setPlaying(false));
  }, [songUrl]);
  useEffect(() => {
    if (audio.current) audio.current.volume = volume;
    if (volume) lastVolume.current = volume;
  }, [volume, songUrl]);
  function toggle() {
    const a = audio.current;
    if (!a) return;
    if (a.paused)
      a.play().catch(() => toast.error("Press play to start the record."));
    else a.pause();
  }
  const stamp = (s: number) =>
    `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  return (
    <div className="player-content">
      <audio
        ref={audio}
        src={songUrl}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false);
          move(1);
        }}
        onLoadedMetadata={() => setDuration(audio.current?.duration || 0)}
        onTimeUpdate={() => setTime(audio.current?.currentTime || 0)}
        onError={() =>
          toast.error("This record could not be loaded. Try another.")
        }
      />
      <div className="player-record">
        <MediaItem data={song} />
        <LikeButton songId={song.id} />
      </div>
      <div className="player-centre">
        <div className="transport">
          <button
            className="player-icon"
            aria-label="Previous song"
            onClick={() => move(-1)}
          >
            <FiSkipBack size={18} />
          </button>
          <button
            className="transport-play"
            aria-label={playing ? "Pause" : "Play"}
            onClick={toggle}
          >
            {playing ? <FiPause size={20} /> : <FiPlay size={20} />}
          </button>
          <button
            className="player-icon"
            aria-label="Next song"
            onClick={() => move(1)}
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
            value={Math.min(time, duration || 1)}
            style={
              {
                "--progress": (duration ? (time / duration) * 100 : 0) + "%",
              } as React.CSSProperties
            }
            onChange={(e) => {
              if (audio.current)
                audio.current.currentTime = Number(e.target.value);
            }}
          />
          <span>{stamp(duration)}</span>
        </div>
      </div>
      <div className="player-volume">
        <span className="eyebrow">NOW SPINNING</span>
        <button
          className="player-icon"
          aria-label={volume ? "Mute" : "Unmute"}
          onClick={() => setVolume(volume ? 0 : lastVolume.current)}
        >
          {volume ? <FiVolume2 size={19} /> : <FiVolumeX size={19} />}
        </button>
        <div className="volume-slider">
          <Slider value={volume} onChange={setVolume} />
        </div>
      </div>
    </div>
  );
}
