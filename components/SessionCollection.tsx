"use client";

import { FiPlay, FiArrowUpRight, FiHeadphones } from "react-icons/fi";
import { Song } from "@/types";
import sessions from "@/data/sessions.json";
import useOnPlay from "@/hooks/useOnPlay";
import usePlayer from "@/hooks/usePlayer";
import SongItem from "./SongItem";

export function orderSessions(songs: Song[]) {
  return sessions.flatMap((session) => {
    const song = songs.find(
      (record) => record.song_path === `/sessions/${session.slug}.mp3`,
    );
    return song ? [{ song, ...session }] : [];
  });
}

export default function SessionCollection({ songs }: { songs: Song[] }) {
  const records = orderSessions(songs);
  const play = useOnPlay(records.map((record) => record.song));
  const activeId = usePlayer((state) => state.activeId);
  if (!records.length) return null;
  return (
    <section
      className="sessions-section"
      id="collection"
      aria-labelledby="sessions-title"
    >
      <div className="sessions-intro">
        <div>
          <p className="eyebrow">
            <FiHeadphones /> VOIB SESSIONS / VOLUME 01
          </p>
          <h2 id="sessions-title">
            Made for
            <br />
            <em>this room.</em>
          </h2>
        </div>
        <div className="sessions-invitation">
          <p>Ten instrumentals. A little space to yourself.</p>
          <span>
            Warm keys, slow rhythms and quiet electronic studies. Play a record
            and make yourself at home.
          </span>
          <button
            className="button button-primary"
            onClick={() => play(records[0].song.id)}
          >
            <FiPlay /> Play the sessions <FiArrowUpRight />
          </button>
          <small>Plays here, in the player below. No sign-in needed.</small>
        </div>
      </div>
      <div className="sessions-rule">
        <span>THE ORIGINAL COLLECTION</span>
        <span>{records.length} RECORDS · LISTEN ON VOIB</span>
      </div>
      <div className="sessions-grid">
        {records.map(({ song, mood, duration }, index) => (
          <div
            key={song.id}
            className={
              "session-record" + (activeId === song.id ? " is-active" : "")
            }
          >
            <SongItem data={song} index={index} onClick={play} />
            <div className="session-details">
              <span>{activeId === song.id ? "On the turntable" : mood}</span>
              <span>
                {Math.floor(duration / 60)}:
                {String(duration % 60).padStart(2, "0")}
              </span>
            </div>
          </div>
        ))}
      </div>
      <p className="sessions-colophon">
        Original instrumental studies by Voib Studio. Select any cover to
        listen, then use the bottom player to pause, seek or move through the
        collection.
      </p>
    </section>
  );
}
