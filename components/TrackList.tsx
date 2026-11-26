"use client";
import Link from "next/link";
import { FiArrowUpRight, FiDisc } from "react-icons/fi";
import { Song } from "@/types";
import useOnPlay from "@/hooks/useOnPlay";
import MediaItem from "./MediaItem";
import LikeButton from "./LikeButton";
export default function TrackList({
  songs,
  emptyTitle = "Nothing here, just yet.",
  emptyText = "Try another title, or take a look around the collection.",
}: {
  songs: Song[];
  emptyTitle?: string;
  emptyText?: string;
}) {
  const play = useOnPlay(songs);
  if (!songs.length)
    return (
      <div className="empty-state">
        <FiDisc size={32} />
        <h3>{emptyTitle}</h3>
        <p>{emptyText}</p>
        <Link className="text-link" href="/">
          Explore the collection <FiArrowUpRight />
        </Link>
      </div>
    );
  return (
    <div className="track-list">
      <div className="track-list-heading eyebrow">
        <span>Nº</span>
        <span>RECORD / ARTIST</span>
        <span>SAVE</span>
      </div>
      {songs.map((song, index) => (
        <div className="track-row" key={song.id}>
          <span className="track-index">
            {String(index + 1).padStart(2, "0")}
          </span>
          <MediaItem data={song} onClick={play} />
          <LikeButton songId={song.id} />
        </div>
      ))}
    </div>
  );
}
