import { useEffect, useMemo, useState } from "react";

import { Song } from "@/types";
import { useSessionContext } from '@/providers/SupabaseProvider';
import { toast } from 'react-hot-toast';


const useSongById = (id?: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [song, setSong] = useState<Song | undefined>(undefined);
  const { supabaseClient } = useSessionContext();

  useEffect(() => {
    if (!id) {
      return;
    }

    setIsLoading(true);

    const fetchSong = async () => {
      const { data, error } = await supabaseClient
        .from('songs')
        .select('*')
        .eq('id', Number(id))
        .single();

      if (error) {
        setIsLoading(false);
        return toast.error(error.message);
      }
      
      setSong({...data, id: String(data.id)} as Song);
      setIsLoading(false);
    }

    fetchSong();
  }, [id, supabaseClient]);

  return useMemo(() => ({
    isLoading,
    song
  }), [isLoading, song]);
};

export default useSongById;