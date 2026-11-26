"use client";
import { FiPlus, FiDisc } from "react-icons/fi";
import { Song } from "@/types";
import useUploadModal from "@/hooks/useUploadModal";
import { useUser } from "@/hooks/useUser";
import useAuthModal from "@/hooks/useAuthModal";
import useSubscribeModal from "@/hooks/useSubscribeModal";
import useOnPlay from "@/hooks/useOnPlay";
import MediaItem from "./MediaItem";
import Button from "./Button";
export default function Library({
  songs,
  onNavigate,
}: {
  songs: Song[];
  onNavigate?: () => void;
}) {
  const { user, subscription } = useUser(),
    upload = useUploadModal(),
    auth = useAuthModal(),
    subscribe = useSubscribeModal(),
    play = useOnPlay(songs);
  function add() {
    onNavigate?.();
    if (!user) return auth.onOpen();
    if (
      !subscription &&
      !user.app_metadata.demo &&
      !user.app_metadata.groups?.includes("admin")
    )
      return subscribe.onOpen();
    upload.onOpen();
  }
  return (
    <div className="library-content">
      <div className="library-toolbar">
        <span className="eyebrow">
          {String(songs.length).padStart(2, "0")} RECORDS
        </span>
        <Button variant="secondary" aria-label="Upload a song" onClick={add}>
          <FiPlus /> Add a record
        </Button>
      </div>
      {songs.length ? (
        <div className="library-records">
          {songs.map((song) => (
            <MediaItem
              key={song.id}
              data={song}
              onClick={(id) => {
                play(id);
                onNavigate?.();
              }}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <FiDisc size={34} />
          <h3>
            A collection begins
            <br />
            with one record.
          </h3>
          <p>
            {user
              ? "Add your own music and keep it close."
              : "Sign in to make a little space for your music."}
          </p>
          <Button onClick={add}>
            {user ? "Upload your first record" : "Sign in to begin"}
            <FiPlus />
          </Button>
        </div>
      )}
    </div>
  );
}
