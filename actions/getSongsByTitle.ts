import {createClient} from "@/libs/supabase/server";

import { Song } from "@/types";

import getSongs from "./getSongs";

const getSongsByTitle = async (title: string): Promise<Song[]> => {
  const supabase = await createClient();

  if (!title) {
    const allSongs = await getSongs();
    return allSongs;
  }

  const { data, error } = await supabase
    .from('songs')
    .select('*')
    .ilike('title', `%${title}%`)
    .order('created_at', { ascending: false })

  if (error) {
    console.log(error.message);
  }

  return (data || []).map(song=>({...song,id:String(song.id)})) as Song[];
};

export default getSongsByTitle;