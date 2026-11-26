"use client";
import Link from "next/link";
import Image from "next/image";
import { FiArrowDownRight, FiArrowUpRight, FiPlay } from "react-icons/fi";
import { Song } from "@/types";
import useLoadImage from "@/hooks/useLoadImage";
import useOnPlay from "@/hooks/useOnPlay";
import CatalogExplorer from "./CatalogExplorer";
export default function ListeningRoom({ songs }: { songs: Song[] }) {
  const play = useOnPlay(songs),
    featured = songs[0],
    image = useLoadImage(featured);
  return (
    <div className="home-page">
      <section className="listening-hero">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="tiny-sun" /> AN INDEPENDENT LISTENING ROOM
          </p>
          <h1>
            Listen,
            <br />
            <em>unhurried.</em>
          </h1>
          <p className="hero-description">
            A space for music worth staying with.
            <br className="desktop-break" /> Find a record. Let the rest wait.
          </p>
          <div className="hero-actions">
            <button
              className="button button-primary"
              disabled={!featured}
              onClick={() => featured && play(featured.id)}
            >
              <FiPlay size={15} />
              Start listening
            </button>
            <a href="#collection" className="text-link">
              Explore the collection <FiArrowDownRight />
            </a>
          </div>
          <div className="hero-footnote">
            <span className="mini-record" />
            <span>
              YOURS TO DISCOVER.
              <br />
              <b>YOURS TO RETURN TO.</b>
            </span>
          </div>
        </div>
        <div className="record-scene">
          <div className="scene-label">
            <span className="eyebrow">FROM THE COLLECTION</span>
            <span className="edition-number">SELECTED LISTEN</span>
          </div>
          <div className="vinyl-composition">
            <div className="vinyl-disc">
              <div className="vinyl-label">
                <span>VOIB</span>
                <i />
                <small>VOIB SELECTS</small>
              </div>
            </div>
            <button
              className="hero-sleeve"
              onClick={() => featured && play(featured.id)}
              aria-label={
                featured ? "Play " + featured.title : "No record available"
              }
              disabled={!featured}
            >
              {image ? (
                <Image
                  src={image}
                  alt={featured.title + " sleeve"}
                  fill
                  sizes="(max-width:700px) 65vw, 360px"
                  priority
                />
              ) : (
                <div className="sleeve-placeholder">voib.</div>
              )}
              <span className="sleeve-play">
                <FiPlay />
              </span>
            </button>
          </div>
          <div className="scene-caption">
            <div>
              <span className="eyebrow">ON THE TURNTABLE</span>
              <p>{featured?.title || "Your next discovery"}</p>
              <small>
                {featured?.author || "The collection is coming soon."}
              </small>
            </div>
            <span className="scene-seal" aria-hidden="true">
              v.
            </span>
          </div>
        </div>
      </section>
      <CatalogExplorer songs={songs} />
      <section className="listening-note">
        <span className="eyebrow">A NOTE FROM THE ROOM</span>
        <p>
          Less scrolling.
          <br />
          <em>More listening.</em>
        </p>
        <div>
          <span className="note-rule" />
          <p>No noise. No rush. Just a collection you can make your own.</p>
          <Link className="text-link" href="/liked">
            Find your favourites <FiArrowUpRight />
          </Link>
        </div>
      </section>
    </div>
  );
}
