import { useSupabaseClient } from "@/providers/SupabaseProvider";

import { Song } from "@/types";

const useLoadImage = (song: Song) => {
  const supabaseClient = useSupabaseClient();
  
  if (!song) {
    return null;
  }

  if (song.image_path.startsWith('/')) return song.image_path;

  const { data: imageData } = supabaseClient
    .storage
    .from('images')
    .getPublicUrl(song.image_path);

  return imageData.publicUrl;
};

export default useLoadImage;