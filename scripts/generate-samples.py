"""Create three original instrumental demo loops (no external music).
This creates an original upload-test fixture; commercial recordings stay on YouTube."""
from pathlib import Path
import math, wave, struct, subprocess
out=Path(__file__).resolve().parents[1]/'tests'/'fixtures';out.mkdir(parents=True,exist_ok=True)
tracks=[('sample','Upload test',[220,261.63,329.63,293.66])]
for slug,title,notes in tracks:
 wav=out/(slug+'.wav');rate=22050;duration=24
 with wave.open(str(wav),'wb') as stream:
  stream.setnchannels(1);stream.setsampwidth(2);stream.setframerate(rate)
  samples=[]
  for i in range(rate*duration):
   t=i/rate;beat=t%0.5;freq=notes[int(t/0.5)%len(notes)];env=(1-math.exp(-beat*45))*math.exp(-beat*5)
   melody=env*(math.sin(2*math.pi*freq*t)+0.22*math.sin(2*math.pi*freq*2*t))
   bass=0.25*math.sin(2*math.pi*(notes[int(t/4)%4]/2)*t)*(0.7+0.3*math.cos(2*math.pi*t/4))
   pad=0.12*(math.sin(2*math.pi*notes[0]*t)+math.sin(2*math.pi*notes[2]*t))
   fade=min(1,t/1.5,(duration-t)/2);samples.append(struct.pack('<h',int(max(-1,min(1,(melody+bass+pad)*0.3*fade))*32767)))
  stream.writeframes(b''.join(samples))
 subprocess.run(['ffmpeg','-loglevel','error','-y','-i',str(wav),'-codec:a','libmp3lame','-b:a','96k',str(out/(slug+'.mp3'))],check=True);wav.unlink()
 print(slug)
