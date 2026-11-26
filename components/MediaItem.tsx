"use client";
import Image from "next/image";
import { FiPlay } from "react-icons/fi";
import useLoadImage from "@/hooks/useLoadImage";
import usePlayer from "@/hooks/usePlayer";
import { Song } from "@/types";
export default function MediaItem({
  data,
  onClick,
}: {
  data: Song;
  onClick?: (id: string) => void;
}) {
  const player = usePlayer(),
    image = useLoadImage(data);
  return (
    <button
      className="media-item"
      aria-label={"Play " + data.title + " by " + data.author}
      onClick={() => (onClick ? onClick(data.id) : player.setId(data.id))}
    >
      <span className="media-cover">
        <Image
          src={image || "/images/record-sleeve.svg"}
          fill
          sizes="56px"
          alt=""
        />
        <span>
          <FiPlay />
        </span>
      </span>
      <span className="media-copy">
        <strong>{data.title}</strong>
        <small>{data.author}</small>
      </span>
    </button>
  );
}
