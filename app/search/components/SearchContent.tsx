"use client";
import { Song } from "@/types";
import TrackList from "@/components/TrackList";
export default function SearchContent({ songs }: { songs: Song[] }) {
  return <TrackList songs={songs} />;
}
