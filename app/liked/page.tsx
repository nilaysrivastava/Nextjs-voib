import getLikedSongs from "@/actions/getLikedSongs";
import Header from "@/components/Header";
import LikedContent from "./components/LikedContent";
export const revalidate = 0;
export default async function Liked() {
  const songs = await getLikedSongs();
  return (
    <div className="interior-page">
      <Header>
        <p className="eyebrow">YOUR PERSONAL SELECTION</p>
        <h1>
          The ones you <em>keep.</em>
        </h1>
        <p className="page-description">
          Your favourite records, always within reach.
        </p>
      </Header>
      <LikedContent songs={songs} />
    </div>
  );
}
