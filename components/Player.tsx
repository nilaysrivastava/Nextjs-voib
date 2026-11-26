"use client";
import { FiDisc } from "react-icons/fi";
import usePlayer from "@/hooks/usePlayer";
import useLoadSongUrl from "@/hooks/useLoadSongUrl";
import useGetSongById from "@/hooks/useGetSongById";
import PlayerContent from "./PlayerContent";
import YouTubePlayerContent from "./YouTubePlayerContent";
export default function Player() {
  const player = usePlayer(),
    { song } = useGetSongById(player.activeId),
    url = useLoadSongUrl(song!);
  return (
    <aside
      className={
        "player-dock" +
        (!song || (!url && song.source_type !== "youtube") || !player.activeId
          ? " player-idle"
          : "")
      }
      aria-label="Music player"
    >
      {song &&
      song.source_type === "youtube" &&
      song.youtube_id &&
      player.activeId ? (
        <YouTubePlayerContent key={song.youtube_id} song={song} />
      ) : song && url && player.activeId ? (
        <PlayerContent key={url} song={song} songUrl={url} />
      ) : (
        <div className="player-idle-content">
          <FiDisc size={28} />
          <div>
            <span className="eyebrow">THE TURNTABLE IS YOURS</span>
            <p>Choose a record. Settle in.</p>
          </div>
          <span className="idle-note">
            A little less noise. A little more music.
          </span>
        </div>
      )}
    </aside>
  );
}
