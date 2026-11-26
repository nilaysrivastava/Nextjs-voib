import { Song } from "@/types";
import usePlayer from "./usePlayer";
import useAuthModal from "./useAuthModal";
import { useUser } from "./useUser";
export default function useOnPlay(songs: Song[]) {
  const player = usePlayer(),
    auth = useAuthModal(),
    { user } = useUser();
  return (id: string) => {
    const record = songs.find((s) => s.id === id);
    if (!user && record?.source_type !== "youtube" && !record?.is_seed)
      return auth.onOpen();
    player.setId(id);
    player.setIds(songs.map((s) => s.id));
  };
}
