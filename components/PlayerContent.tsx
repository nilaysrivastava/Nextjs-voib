"use client";
import {useEffect,useRef,useState} from 'react';
import {BsPauseFill,BsPlayFill} from 'react-icons/bs';
import {HiSpeakerWave,HiSpeakerXMark} from 'react-icons/hi2';
import {AiFillStepBackward,AiFillStepForward} from 'react-icons/ai';
import {toast} from 'react-hot-toast';
import type {Song} from '@/types';
import usePlayer from '@/hooks/usePlayer';
import LikeButton from './LikeButton';
import MediaItem from './MediaItem';
import Slider from './Slider';
export default function PlayerContent({song,songUrl}:{song:Song;songUrl:string}){
 const player=usePlayer(),audio=useRef<HTMLAudioElement>(null);
 const [volume,setVolume]=useState(0.7),[playing,setPlaying]=useState(false),[time,setTime]=useState(0),[duration,setDuration]=useState(0);
 const move=(direction:number)=>{const index=player.ids.indexOf(player.activeId!);if(player.ids.length)player.setId(player.ids[(index+direction+player.ids.length)%player.ids.length]);};
 useEffect(()=>{const element=audio.current;if(!element)return;element.load();element.play().catch(()=>setPlaying(false));},[songUrl]);
 useEffect(()=>{if(audio.current)audio.current.volume=volume;},[volume,songUrl]);
 const toggle=()=>{if(!audio.current)return;if(audio.current.paused)audio.current.play().catch(()=>toast.error('Press play to start audio.'));else audio.current.pause();};
 const stamp=(s:number)=>`${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`;
 const Icon=playing?BsPauseFill:BsPlayFill,VolumeIcon=volume?HiSpeakerWave:HiSpeakerXMark;
 return <div className="grid h-full grid-cols-[1fr_auto] items-center gap-3 md:grid-cols-[1fr_1.5fr_1fr]">
  <audio ref={audio} src={songUrl} preload="metadata" onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)} onEnded={()=>{setPlaying(false);move(1);}} onLoadedMetadata={()=>setDuration(audio.current?.duration||0)} onTimeUpdate={()=>setTime(audio.current?.currentTime||0)} onError={()=>toast.error('This track could not be loaded. Try another song.')}/>
  <div className="flex min-w-0 items-center gap-2"><MediaItem data={song}/><LikeButton songId={song.id}/></div>
  <div className="flex flex-col items-center gap-1"><div className="flex items-center gap-5"><button aria-label="Previous song" onClick={()=>move(-1)}><AiFillStepBackward size={26}/></button><button aria-label={playing?'Pause':'Play'} onClick={toggle} className="rounded-full bg-white p-1 text-black"><Icon size={30}/></button><button aria-label="Next song" onClick={()=>move(1)}><AiFillStepForward size={26}/></button></div><div className="hidden w-full items-center gap-2 text-[10px] text-neutral-400 md:flex"><span>{stamp(time)}</span><input aria-label="Seek" type="range" className="w-full accent-pink-500" min={0} max={duration||1} step={0.1} value={Math.min(time,duration||1)} onChange={e=>{if(audio.current)audio.current.currentTime=Number(e.target.value);}}/><span>{stamp(duration)}</span></div></div>
  <div className="hidden items-center justify-end gap-2 md:flex"><button aria-label={volume?'Mute':'Unmute'} onClick={()=>setVolume(volume?0:0.7)}><VolumeIcon size={25}/></button><div className="w-24"><Slider value={volume} onChange={setVolume}/></div></div>
 </div>;
}
