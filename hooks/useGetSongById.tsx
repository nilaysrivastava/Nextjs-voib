import { useEffect, useMemo, useState } from "react";
import { Song } from "@/types";
import { useSessionContext } from "@/providers/SupabaseProvider";
import { toast } from "react-hot-toast";
export default function useSongById(id?: string) {
  const [isLoading, setLoading] = useState(false),
    [song, setSong] = useState<Song | undefined>(),
    { supabaseClient } = useSessionContext();
  useEffect(() => {
    let active = true;
    setSong(undefined);
    if (!id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    supabaseClient
      .from("songs")
      .select("*")
      .eq("id", Number(id))
      .maybeSingle()
      .then(({ data, error }) => {
        if (!active) return;
        setLoading(false);
        if (error || !data) {
          toast.error(
            "This record is no longer available. Try another from the collection.",
          );
          return;
        }
        setSong({ ...data, id: String(data.id) } as Song);
      });
    return () => {
      active = false;
    };
  }, [id, supabaseClient]);
  return useMemo(() => ({ isLoading, song }), [isLoading, song]);
}
