"""Create three original instrumental demo loops and vector covers (no external music)."""
from pathlib import Path
import math, wave, struct, subprocess
out=Path(__file__).resolve().parents[1]/'public'/'demo';out.mkdir(parents=True,exist_ok=True)
tracks=[('neon-drift','Neon Drift',[220,261.63,329.63,293.66],'#cc1964','#34205a'),('afterglow','Afterglow',[196,246.94,293.66,392],'#ee964b','#6c2148'),('quiet-orbit','Quiet Orbit',[174.61,220,261.63,349.23],'#44bba4','#14213d')]
for slug,title,notes,c1,c2 in tracks:
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
 svg=f'''<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600"><defs><linearGradient id="g" x2="1" y2="1"><stop stop-color="{c1}"/><stop offset="1" stop-color="{c2}"/></linearGradient></defs><rect width="600" height="600" fill="url(#g)"/><circle cx="390" cy="240" r="170" fill="none" stroke="#fff" stroke-opacity=".25" stroke-width="55"/><circle cx="260" cy="315" r="100" fill="#fff" fill-opacity=".12"/><path d="M0 430 Q170 220 350 410 T650 300" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width="3"/><text x="45" y="70" fill="white" font-family="sans-serif" font-size="20" letter-spacing="7">VOIB STUDIO</text><text x="45" y="520" fill="white" font-family="sans-serif" font-size="48" font-weight="700">{title}</text><text x="45" y="558" fill="white" font-family="sans-serif" font-size="18" letter-spacing="4">ORIGINAL DEMO LOOP</text></svg>'''
 (out/(slug+'.svg')).write_text(svg)
 print(slug)
