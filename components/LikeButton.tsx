"use client";
import {useEffect,useState} from 'react';
import {AiOutlineHeart,AiFillHeart} from 'react-icons/ai';
import {useRouter} from 'next/navigation';
import {toast} from 'react-hot-toast';
import {useSessionContext} from '@/providers/SupabaseProvider';
import {useUser} from '@/hooks/useUser';
import useAuthModal from '@/hooks/useAuthModal';
export default function LikeButton({songId}:{songId:string}){
 const router=useRouter(),{supabaseClient}=useSessionContext(),auth=useAuthModal(),{user}=useUser();const [liked,setLiked]=useState(false),[busy,setBusy]=useState(false);
 useEffect(()=>{let active=true;setLiked(false);if(user?.id)supabaseClient.from('liked_songs').select('song_id').eq('user_id',user.id).eq('song_id',Number(songId)).maybeSingle().then(({data,error})=>{if(active&&!error)setLiked(!!data);});return()=>{active=false;};},[songId,supabaseClient,user?.id]);
 async function toggle(){if(!user)return auth.onOpen();if(busy)return;setBusy(true);try{const result=liked?await supabaseClient.from('liked_songs').delete().eq('user_id',user.id).eq('song_id',Number(songId)):await supabaseClient.from('liked_songs').insert({song_id:Number(songId),user_id:user.id});if(result.error)throw result.error;setLiked(!liked);if(!liked)toast.success('A record to return to. Saved.');router.refresh();}catch(e){toast.error(e instanceof Error?e.message:'Could not save this record. Please try again.');}finally{setBusy(false);}}
 const Icon=liked?AiFillHeart:AiOutlineHeart;return <button aria-label={liked?'Unlike song':'Like song'} aria-pressed={liked} disabled={busy} className={'like-button'+(liked?' is-liked':'')} onClick={toggle}><Icon size={21}/></button>;
}
