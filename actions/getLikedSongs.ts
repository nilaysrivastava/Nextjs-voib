import { Song } from "@/types";
import {createClient} from "@/libs/supabase/server";

const getLikedSongs = async (): Promise<Song[]> => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];
  const { data } = await supabase 
    .from('liked_songs')
    .select('*, songs(*)')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  if (!data) return [];

  return data.map((item) => ({
    ...item.songs, id: String(item.songs.id)
  })) as Song[]
};

export default getLikedSongs;