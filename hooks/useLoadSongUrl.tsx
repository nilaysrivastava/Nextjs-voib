import { useSupabaseClient } from "@/providers/SupabaseProvider";

import { Song } from "@/types";

const useLoadSongUrl = (song: Song) => {
  const supabaseClient = useSupabaseClient();

  if (!song) {
    return '';
  }

  if (song.song_path.startsWith('/')) return song.song_path;

  const { data: songData } = supabaseClient
  .storage
  .from('songs')
  .getPublicUrl(song.song_path);

  return songData.publicUrl;
};

export default useLoadSongUrl;