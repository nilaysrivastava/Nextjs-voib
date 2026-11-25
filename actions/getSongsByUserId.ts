import {createClient} from "@/libs/supabase/server";

import { Song } from "@/types";

const getSongsByUserId = async (): Promise<Song[]> => {
  const supabase = await createClient();

  const { data: sessionData, error: sessionError } = await supabase.auth.getUser();

  if (!sessionData.user || sessionError) {
    if(sessionError) console.log(sessionError.message);
    return [];
  }

  const { data, error } = await supabase
    .from('songs')
    .select('*')
    .eq('user_id', sessionData.user!.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.log(error.message);
  }

  return (data || []).map(song=>({...song,id:String(song.id)})) as Song[];
};

export default getSongsByUserId;