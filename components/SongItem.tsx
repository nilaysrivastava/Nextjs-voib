"use client";
import Image from "next/image";
import { FiArrowUpRight, FiPlay } from "react-icons/fi";
import { Song } from "@/types";
import useLoadImage from "@/hooks/useLoadImage";
export default function SongItem({
  data,
  onClick,
  index = 0,
}: {
  data: Song;
  onClick: (id: string) => void;
  index?: number;
}) {
  const image = useLoadImage(data);
  return (
    <article className="record-card">
      <button
        className="record-art"
        onClick={() => onClick(data.id)}
        aria-label={"Play " + data.title}
      >
        <Image
          src={image || "/images/record-sleeve.svg"}
          fill
          sizes="(max-width:640px) 88vw, (max-width:1000px) 42vw, 30vw"
          alt={data.title + " cover art"}
        />
        <span className="record-play">
          <FiPlay size={22} />
        </span>
        <span className="record-number">
          {String(index + 1).padStart(2, "0")}
        </span>
      </button>
      <div className="record-caption">
        <div>
          <button onClick={() => onClick(data.id)} className="record-title">
            {data.title}
          </button>
          <p>{data.author}</p>
        </div>
        <button
          className="record-open"
          aria-label={"Listen to " + data.title}
          onClick={() => onClick(data.id)}
        >
          <FiArrowUpRight size={24} />
        </button>
      </div>
    </article>
  );
}
