"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiPlus, FiCheck, FiTrash2 } from "react-icons/fi";
import { toast } from "react-hot-toast";
import useUploadModal from "@/hooks/useUploadModal";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Modal from "@/components/Modal";
type RecordEntry = { id: string; title: string | null; author: string | null };
export default function AdminSongs({ songs }: { songs: RecordEntry[] }) {
  const [busy, setBusy] = useState(""),
    [deleting, setDeleting] = useState<RecordEntry | null>(null),
    router = useRouter(),
    upload = useUploadModal();
  async function update(id: string, method: string, body?: unknown) {
    setBusy(id);
    try {
      const r = await fetch("/api/admin/songs/" + id, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      const b = await r.json();
      if (!r.ok) throw new Error(b.error);
      toast.success(
        method === "DELETE"
          ? "Record removed from the collection."
          : "Record details saved.",
      );
      setDeleting(null);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Please try again.");
    } finally {
      setBusy("");
    }
  }
  return (
    <section className="studio-section">
      <div className="studio-toolbar">
        <div>
          <p className="eyebrow">THE CATALOGUE</p>
          <p>
            {songs.length} {songs.length === 1 ? "record" : "records"} in this
            collection
          </p>
        </div>
        <Button onClick={upload.onOpen}>
          <FiPlus />
          Upload a track
        </Button>
      </div>
      <div className="studio-records">
        {songs.map((song, i) => (
          <form
            key={song.id}
            className="studio-row"
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              update(song.id, "PATCH", {
                title: f.get("title"),
                author: f.get("author"),
              });
            }}
          >
            <span className="track-index">
              {String(i + 1).padStart(2, "0")}
            </span>
            <label className="field-label">
              Record title
              <Input
                aria-label={"Title for " + song.id}
                name="title"
                defaultValue={song.title || ""}
                required
                maxLength={150}
              />
            </label>
            <label className="field-label">
              Artist
              <Input
                aria-label={"Artist for " + song.id}
                name="author"
                defaultValue={song.author || ""}
                required
                maxLength={100}
              />
            </label>
            <div className="studio-actions">
              <Button
                variant="secondary"
                type="submit"
                disabled={busy === song.id}
              >
                <FiCheck />
                {busy === song.id ? "Saving…" : "Save"}
              </Button>
              <button
                className="icon-button delete-button"
                aria-label={"Delete " + song.title}
                type="button"
                disabled={busy === song.id}
                onClick={() => setDeleting(song)}
              >
                <FiTrash2 size={18} />
              </button>
            </div>
          </form>
        ))}
      </div>
      {!songs.length && (
        <div className="empty-state">
          <h3>A blank sleeve.</h3>
          <p>Upload the first record to start this collection.</p>
        </div>
      )}
      <Modal
        isOpen={!!deleting}
        onChange={(open) => {
          if (!open && !busy) setDeleting(null);
        }}
        title="Remove this record?"
        description={
          "“" +
          (deleting?.title || "This record") +
          "” and its uploaded media will be permanently removed."
        }
      >
        <div className="confirmation-actions">
          <Button
            variant="secondary"
            disabled={!!busy}
            onClick={() => setDeleting(null)}
          >
            Keep record
          </Button>
          <Button
            variant="danger"
            disabled={!!busy}
            onClick={() => deleting && update(deleting.id, "DELETE")}
          >
            {busy ? "Removing…" : "Delete record"}
          </Button>
        </div>
      </Modal>
    </section>
  );
}
