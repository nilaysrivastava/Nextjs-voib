import {createClient} from "@/libs/supabase/server";

import { Song } from "@/types";

const getSongs = async (): Promise<Song[]> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('songs')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.log(error.message);
  }

  return (data || []).map(song=>({...song,id:String(song.id)})) as Song[];
};

export default getSongs;