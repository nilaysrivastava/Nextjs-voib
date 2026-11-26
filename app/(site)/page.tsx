import getSongs from "@/actions/getSongs";
import ListeningRoom from "@/components/ListeningRoom";
export const revalidate = 0;
export default async function Home() {
  const songs = await getSongs();
  return <ListeningRoom songs={songs.filter((song) => !song.is_demo)} />;
}
