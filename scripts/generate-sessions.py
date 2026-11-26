from pathlib import Path
import subprocess,json,math,wave
import numpy as np
repo=Path.cwd(); out=repo/'public'/'sessions';out.mkdir(exist_ok=True)
tracks=[('velvet-hours','Velvet Hours','Late-night keys',72,196,'#544b40','#c8ac7e'),('afterglow','Afterglow','Warm electronic',24,196,'#865843','#e2c09c'),('neon-drift','Neon Drift','Electronic study',24,220,'#3e5651','#aac5b7'),('quiet-orbit','Quiet Orbit','Ambient study',24,174.61,'#48535d','#c0c9ce'),('blue-hour','Blue Hour','Slow piano',72,164.81,'#354f61','#a4bfc4'),('saffron-sky','Saffron Sky','Downtempo',72,146.83,'#9d7541','#eed6a3'),('paper-moon','Paper Moon','Floating keys',72,174.61,'#777b65','#dedac1'),('midnight-drive','Midnight Drive','Electronic pulse',72,130.81,'#3b414c','#a8adb5'),('still-water','Still Water','Ambient',72,123.47,'#49685e','#bdcbbd'),('last-light','Last Light','Piano & atmosphere',72,155.56,'#6e5153','#dfb8aa')]
for idx,(slug,title,mood,duration,root,c1,c2) in enumerate(tracks):
 if slug in ['neon-drift','afterglow','quiet-orbit']:
  (out/(slug+'.mp3')).write_bytes(subprocess.check_output(['git','show','a49bc14:public/demo/'+slug+'.mp3']))
 else:
  rate=22050;n=rate*duration;t=np.arange(n)/rate;mix=np.zeros(n);rng=np.random.default_rng(2103+idx)
  beat=60/(72+idx*2); progression=[0,5,9,7]; degrees=[0,3,7,10,14]; bar=beat*4
  for j,start in enumerate(np.arange(0,duration,bar)):
   chordroot=root*2**(progression[j%4]/12)
   for deg in [0,3,7,10]:
    end=min(n,int((start+bar*1.8)*rate));a=int(start*rate);tt=np.arange(end-a)/rate;freq=chordroot*2**(deg/12)
    env=(1-np.exp(-tt*2))*np.exp(-tt/(bar*1.3));mix[a:end]+=.055*env*(np.sin(2*np.pi*freq*tt)+.2*np.sin(2*np.pi*(freq*2+.4)*tt))
   for k in range(8):
    st=start+k*beat*.5;a=int(st*rate);end=min(n,a+int(2.8*rate))
    if a>=n:continue
    tt=np.arange(end-a)/rate;freq=chordroot*2**((degrees[(j*3+k+idx)%5]+12)/12);env=(1-np.exp(-tt*70))*np.exp(-tt*(1.8 if idx%2 else 2.5))
    mix[a:end]+=.13*env*(np.sin(2*np.pi*freq*tt)+.28*np.sin(2*np.pi*freq*2*tt)*np.exp(-tt*3)+.08*np.sin(2*np.pi*freq*3*tt))
   a=int(start*rate);end=min(n,a+int(bar*rate));tt=np.arange(end-a)/rate;mix[a:end]+=.075*np.sin(2*np.pi*(chordroot/2)*tt)*(1-np.exp(-tt*8))*np.exp(-tt/bar)
  if idx in [0,5,7]:
   for j,st in enumerate(np.arange(0,duration,beat)):
    a=int(st*rate);end=min(n,a+int(.22*rate));tt=np.arange(end-a)/rate;mix[a:end]+=.15*np.sin(2*np.pi*(44*tt+22*(1-np.exp(-tt*28))/28))*np.exp(-tt*22)
    if j%2:
     end=min(n,a+int(.08*rate));tt=np.arange(end-a)/rate;mix[a:end]+=.015*rng.normal(size=end-a)*np.exp(-tt*55)
  for delay,gain in [(0.19,.15),(.38,.08)]:
   d=int(delay*rate);mix[d:]+=mix[:-d].copy()*gain
  mix*=np.minimum(1,t/2)*np.minimum(1,(duration-t)/4);mix=np.tanh(mix*1.3)*.72
  wav=out/(slug+'.wav')
  with wave.open(str(wav),'wb') as f:f.setnchannels(1);f.setsampwidth(2);f.setframerate(rate);f.writeframes((mix*32767).astype('<i2').tobytes())
  subprocess.run(['ffmpeg','-loglevel','error','-y','-i',str(wav),'-codec:a','libmp3lame','-b:a','128k',str(out/(slug+'.mp3'))],check=True);wav.unlink()
 svg=f'''<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800"><rect width="800" height="800" fill="{c1}"/><g fill="none" stroke="{c2}" opacity=".55">'''+''.join(f'<ellipse cx="{440+idx*3}" cy="360" rx="{80+j*19}" ry="{110+j*22}" transform="rotate({idx*12+25} 440 360)"/>' for j in range(10))+f'''</g><path d="M60 70H740M60 650H740" stroke="{c2}" opacity=".55"/><text x="60" y="110" fill="{c2}" font-family="Georgia,serif" font-size="27">voib. / sessions</text><text x="740" y="110" text-anchor="end" fill="{c2}" font-family="Georgia,serif" font-size="24">{idx+1:02}</text><text x="60" y="712" fill="{c2}" font-family="Georgia,serif" font-size="55">{title}</text><text x="60" y="754" fill="{c2}" font-family="sans-serif" letter-spacing="4" font-size="16">ORIGINAL INSTRUMENTAL</text></svg>'''
 (out/(slug+'.svg')).write_text(svg)
items=[dict(slug=x[0],title=x[1],mood=x[2],duration=x[3]) for x in tracks]
(repo/'data/sessions.json').write_text(json.dumps(items,indent=2)+'\n')
q=lambda s:"'"+s.replace("'","''")+"'"
sql='-- Original instrumental studies, bundled with Voib. Safe to reapply.\nbegin;\n'
for i in items:
 path='/sessions/'+i['slug']+'.mp3';sql+='insert into public.songs(title,author,song_path,image_path,is_seed,source_type,artists,genres,collections) select '+','.join([q(i['title']),q('Voib Studio'),q(path),q('/sessions/'+i['slug']+'.svg'),'true',q('upload'),"array['Voib Studio']::text[]","array['Instrumental']::text[]","array['Voib Sessions']::text[]"])+ ' where not exists(select 1 from public.songs where song_path='+q(path)+');\n'
sql+='commit;\n';(repo/'supabase/sql/sessions.sql').write_text(sql)
print('Created',len(items),'original tracks')
