"use client";
import { useState } from "react";
import { FiArrowUpRight, FiMusic, FiImage } from "react-icons/fi";
import { useSupabaseClient } from "@/providers/SupabaseProvider";
import { useForm, type FieldValues, type SubmitHandler } from "react-hook-form";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import useUploadModal from "@/hooks/useUploadModal";
import { useUser } from "@/hooks/useUser";
import Modal from "./Modal";
import Input from "./Input";
import Button from "./Button";
export default function UploadModal() {
  const [busy, setBusy] = useState(false),
    modal = useUploadModal(),
    client = useSupabaseClient(),
    { user } = useUser(),
    router = useRouter(),
    { register, handleSubmit, reset } = useForm<FieldValues>();
  const submit: SubmitHandler<FieldValues> = async (values) => {
    if (!user) return;
    const song = values.song?.[0] as File | undefined,
      image = values.image?.[0] as File | undefined;
    if (!song || !image)
      return toast.error("Select an audio file and cover image.");
    if (song.size > 10 * 1024 * 1024 || image.size > 2 * 1024 * 1024)
      return toast.error("Audio must be under 10 MB and cover art under 2 MB.");
    if (
      ![
        "audio/mpeg",
        "audio/mp3",
        "audio/wav",
        "audio/x-wav",
        "audio/ogg",
      ].includes(song.type) ||
      !["image/jpeg", "image/png", "image/webp"].includes(image.type)
    )
      return toast.error("Use MP3/WAV/OGG audio and a PNG/JPEG/WebP cover.");
    setBusy(true);
    const id = crypto.randomUUID(),
      songPath = `${user.id}/${id}.${song.name.split(".").pop()}`,
      imagePath = `${user.id}/${id}.${image.name.split(".").pop()}`;
    let audioUploaded = false,
      coverUploaded = false;
    try {
      const audio = await client.storage
        .from("songs")
        .upload(songPath, song, { contentType: song.type });
      if (audio.error) throw audio.error;
      audioUploaded = true;
      const cover = await client.storage
        .from("images")
        .upload(imagePath, image, { contentType: image.type });
      if (cover.error) throw cover.error;
      coverUploaded = true;
      const result = await client
        .from("songs")
        .insert({
          user_id: user.id,
          title: String(values.title).trim(),
          author: String(values.author).trim(),
          song_path: songPath,
          image_path: imagePath,
        });
      if (result.error) throw result.error;
      toast.success("A new record in your library.");
      reset();
      modal.onClose();
      router.refresh();
    } catch (error) {
      if (audioUploaded) await client.storage.from("songs").remove([songPath]);
      if (coverUploaded)
        await client.storage.from("images").remove([imagePath]);
      toast.error(
        error instanceof Error
          ? error.message
          : "Upload failed. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal
      title="Make room for a record."
      description="Add music you own or have permission to share."
      isOpen={modal.isOpen}
      onChange={(open) => {
        if (!open && !busy) {
          modal.onClose();
          reset();
        }
      }}
    >
      <form onSubmit={handleSubmit(submit)} className="form-stack">
        <label className="field-label">
          Record title
          <Input
            aria-label="Song title"
            placeholder="Give it a name"
            disabled={busy}
            maxLength={150}
            {...register("title", { required: true })}
          />
        </label>
        <label className="field-label">
          Artist
          <Input
            aria-label="Song author"
            placeholder="Who is behind the music?"
            disabled={busy}
            maxLength={100}
            {...register("author", { required: true })}
          />
        </label>
        <label className="file-field">
          <span>
            <FiMusic /> Audio file <small>MP3, WAV or OGG · up to 10 MB</small>
          </span>
          <Input
            aria-label="Audio file"
            type="file"
            accept="audio/mpeg,audio/wav,audio/ogg,.mp3,.wav,.ogg"
            disabled={busy}
            {...register("song", { required: true })}
          />
        </label>
        <label className="file-field">
          <span>
            <FiImage /> Cover artwork{" "}
            <small>JPG, PNG or WebP · up to 2 MB</small>
          </span>
          <Input
            aria-label="Cover image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={busy}
            {...register("image", { required: true })}
          />
        </label>
        <Button className="button-full" disabled={busy} type="submit">
          {busy ? "Adding your record…" : "Add to your library"}
          <FiArrowUpRight />
        </Button>
        <p className="fine-print">
          Uploaded records are publicly playable. Please only share files you
          have permission to publish.
        </p>
      </form>
    </Modal>
  );
}
