"use client";
import { Song } from "@/types";
import SongItem from "@/components/SongItem";
import useOnPlay from "@/hooks/useOnPlay";
export default function PageContent({ songs }: { songs: Song[] }) {
  const play = useOnPlay(songs);
  return songs.length ? (
    <div className="record-grid">
      {songs.map((song, index) => (
        <SongItem key={song.id} data={song} index={index} onClick={play} />
      ))}
    </div>
  ) : (
    <div className="empty-state">
      <h3>A quiet room, for now.</h3>
      <p>New records will appear here as they are added.</p>
    </div>
  );
}
