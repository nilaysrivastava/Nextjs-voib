"use client";
import {useState} from 'react';
import {useSupabaseClient} from '@/providers/SupabaseProvider';
import {useForm,type FieldValues,type SubmitHandler} from 'react-hook-form';
import {toast} from 'react-hot-toast';
import {useRouter} from 'next/navigation';
import useUploadModal from '@/hooks/useUploadModal';
import {useUser} from '@/hooks/useUser';
import Modal from './Modal';import Input from './Input';import Button from './Button';
export default function UploadModal(){
 const [busy,setBusy]=useState(false);const modal=useUploadModal(),client=useSupabaseClient(),{user}=useUser(),router=useRouter();
 const {register,handleSubmit,reset}=useForm<FieldValues>();
 const submit:SubmitHandler<FieldValues>=async(values)=>{
  if(!user)return;const song=values.song?.[0] as File|undefined,image=values.image?.[0] as File|undefined;
  if(!song||!image)return toast.error('Select an audio file and cover image.');
  if(song.size>10*1024*1024||image.size>2*1024*1024)return toast.error('Audio must be under 10 MB and cover art under 2 MB.');
  if(!['audio/mpeg','audio/mp3','audio/wav','audio/x-wav','audio/ogg'].includes(song.type)||!['image/jpeg','image/png','image/webp'].includes(image.type))return toast.error('Use MP3/WAV/OGG audio and a PNG/JPEG/WebP cover.');
  setBusy(true);const id=crypto.randomUUID(),songPath=`${user.id}/${id}.${song.name.split('.').pop()}`,imagePath=`${user.id}/${id}.${image.name.split('.').pop()}`;let audioUploaded=false,coverUploaded=false;
  try{
   const audio=await client.storage.from('songs').upload(songPath,song,{contentType:song.type});if(audio.error)throw audio.error;audioUploaded=true;
   const cover=await client.storage.from('images').upload(imagePath,image,{contentType:image.type});if(cover.error)throw cover.error;coverUploaded=true;
   const result=await client.from('songs').insert({user_id:user.id,title:String(values.title).trim(),author:String(values.author).trim(),song_path:songPath,image_path:imagePath});if(result.error)throw result.error;
   toast.success('Song added to your library');reset();modal.onClose();router.refresh();
  }catch(error){if(audioUploaded)await client.storage.from('songs').remove([songPath]);if(coverUploaded)await client.storage.from('images').remove([imagePath]);toast.error(error instanceof Error?error.message:'Upload failed. Please try again.');}finally{setBusy(false);}
 };
 return <Modal title="Add a song" description="Upload music you own or have permission to share. Audio: 10 MB maximum. Cover art: 2 MB maximum." isOpen={modal.isOpen} onChange={open=>{if(!open){modal.onClose();reset();}}}><form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4"><Input aria-label="Song title" placeholder="Song title" disabled={busy} maxLength={150} {...register('title',{required:true})}/><Input aria-label="Song author" placeholder="Song author" disabled={busy} maxLength={100} {...register('author',{required:true})}/><label>Audio file<Input aria-label="Audio file" type="file" accept="audio/mpeg,audio/wav,audio/ogg,.mp3,.wav,.ogg" disabled={busy} {...register('song',{required:true})}/></label><label>Cover image<Input aria-label="Cover image" type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} {...register('image',{required:true})}/></label><Button disabled={busy} type="submit">{busy?'Uploading…':'Create song'}</Button></form></Modal>;
}
