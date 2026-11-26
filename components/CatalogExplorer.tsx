"use client";
import { useMemo, useState } from "react";
import { FiArrowDown, FiArrowUpRight, FiX } from "react-icons/fi";
import { Song } from "@/types";
import useOnPlay from "@/hooks/useOnPlay";
import SongItem from "./SongItem";
import Button from "./Button";
const GENRES = [
  { name: "Bollywood", note: "Stories you know by heart." },
  { name: "Pop & R&B", note: "Familiar voices. Lasting hooks." },
  { name: "Ghazals", note: "Poetry, given a voice." },
  { name: "Alternative", note: "A different kind of feeling." },
];
const ARTISTS = [
  "KK",
  "Pritam",
  "Arijit Singh",
  "The Weeknd",
  "Charlie Puth",
  "One Direction",
  "Michael Jackson",
  "Jal",
  "Jagjit Singh",
  "Ghulam Ali",
  "Mehdi Hasan",
  "Farida Khanum",
];
export default function CatalogExplorer({ songs }: { songs: Song[] }) {
  const [genre, setGenre] = useState(""),
    [artist, setArtist] = useState(""),
    [collection, setCollection] = useState(""),
    [limit, setLimit] = useState(6);
  const filtered = useMemo(
    () =>
      songs.filter(
        (s) =>
          (!genre || s.genres?.includes(genre)) &&
          (!artist || s.artists?.includes(artist)) &&
          (!collection || s.collections?.includes(collection)),
      ),
    [songs, genre, artist, collection],
  );
  const play = useOnPlay(filtered);
  function chooseGenre(next: string) {
    setGenre(genre === next ? "" : next);
    setArtist("");
    setCollection("");
    setLimit(6);
  }
  function chooseArtist(next: string) {
    setArtist(artist === next ? "" : next);
    setGenre("");
    setCollection("");
    setLimit(6);
  }
  function reset() {
    setGenre("");
    setArtist("");
    setCollection("");
    setLimit(6);
  }
  return (
    <section id="collection" className="collection-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">FIND A FEELING. STAY A WHILE.</p>
          <h2>
            A room for every mood<span>.</span>
          </h2>
        </div>
        <span className="catalogue-total">{songs.length} recordings</span>
      </div>
      <div className="genre-grid" aria-label="Browse genres">
        {GENRES.map((g, i) => (
          <button
            key={g.name}
            className={
              "genre-card genre-" + i + (genre === g.name ? " selected" : "")
            }
            aria-pressed={genre === g.name}
            onClick={() => chooseGenre(g.name)}
          >
            <span className="eyebrow">
              0{i + 1} /{" "}
              {songs.filter((s) => s.genres?.includes(g.name)).length} RECORDS
            </span>
            <strong>{g.name}</strong>
            <small>{g.note}</small>
            <FiArrowUpRight />
          </button>
        ))}
      </div>
      <div className="artist-section">
        <p className="eyebrow">ARTISTS & COMPOSERS</p>
        <div className="artist-links">
          <button
            className={!artist && !collection && !genre ? "active" : ""}
            onClick={reset}
          >
            All recordings
          </button>
          {ARTISTS.filter((a) => songs.some((s) => s.artists?.includes(a))).map(
            (a) => (
              <button
                className={artist === a ? "active" : ""}
                aria-pressed={artist === a}
                onClick={() => chooseArtist(a)}
                key={a}
              >
                {a}
              </button>
            ),
          )}
          <button
            className={collection === "Emraan Hashmi" ? "active" : ""}
            aria-pressed={collection === "Emraan Hashmi"}
            onClick={() => {
              setCollection(collection ? "" : "Emraan Hashmi");
              setArtist("");
              setGenre("");
              setLimit(6);
            }}
          >
            Emraan Hashmi <span>FILM COLLECTION</span>
          </button>
        </div>
      </div>
      <div className="catalogue-filter-heading">
        <div>
          <p className="eyebrow">
            {genre || artist || collection || "THE COLLECTION"}
          </p>
          <span>
            {filtered.length}{" "}
            {filtered.length === 1 ? "recording" : "recordings"}
          </span>
        </div>
        {(genre || artist || collection) && (
          <button className="clear-filter" onClick={reset}>
            Clear filter <FiX />
          </button>
        )}
      </div>
      <div className="record-grid catalog-records">
        {filtered.slice(0, limit).map((song, index) => (
          <SongItem data={song} key={song.id} index={index} onClick={play} />
        ))}
      </div>
      {!filtered.length && (
        <div className="empty-state">
          <h3>A quiet corner.</h3>
          <p>Try a different artist or genre.</p>
          <Button variant="secondary" onClick={reset}>
            View all recordings
          </Button>
        </div>
      )}
      {filtered.length > limit && (
        <div className="load-records">
          <Button variant="secondary" onClick={() => setLimit(limit + 6)}>
            More from this collection <FiArrowDown />
          </Button>
          <span>
            Showing {Math.min(limit, filtered.length)} of {filtered.length}
          </span>
        </div>
      )}
      <p className="catalogue-source-note">
        Official recordings play through YouTube. Availability may vary by
        region; every record includes a direct link to its official source.
      </p>
    </section>
  );
}
