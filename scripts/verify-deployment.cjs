const fs=require('node:fs');const path=require('node:path');require(path.resolve('node_modules/@next/env')).loadEnvConfig(process.cwd());
const base=process.env.VOIB_TEST_URL||'http://localhost:3346',url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;const checks=[];let user,admin,uploadedSong,uploadedImage,rowId;
const check=(name,pass)=>{checks.push({name,pass:!!pass});if(!pass)throw new Error(name);};
async function req(url,{method='GET',token,body,raw,type='application/json',supabase=false}={}){const r=await fetch(url,{method,redirect:'manual',headers:{...(token?{Authorization:'Bearer '+token}:{}),...(supabase?{apikey:key}:{}),'Content-Type':type},body:raw??(body===undefined?undefined:JSON.stringify(body)),signal:AbortSignal.timeout(60000)});const text=await r.text();let data;try{data=JSON.parse(text);}catch{data=text;}return {status:r.status,data,headers:r.headers};}
const db=(route,opt={})=>req(url+route,{...opt,supabase:true});
async function login(email,password){const r=await db('/auth/v1/token?grant_type=password',{method:'POST',body:{email,password}});check('Login '+email,r.status===200);return {token:r.data.access_token,id:r.data.user.id};}
(async()=>{
 for(const route of ['/','/search?title=Neon','/api/health','/demo/neon-drift.mp3','/demo/neon-drift.svg'])check('HTTP '+route,(await req(base+route)).status===200);
 for(const route of ['/auth/confirm','/auth/callback']){const r=await req(base+route);check('Auth redirects stay on public origin '+route,r.status===307&&new URL(r.headers.get('location')).origin===new URL(base).origin);}
 const anon=await db('/rest/v1/songs?select=id,is_seed,is_demo');check('Anonymous catalog hides demo uploads',anon.status===200&&anon.data.filter(x=>x.is_seed).length===3&&anon.data.every(x=>!x.is_demo));
 user=await login('demo.user@voib.example','VoibListener!2026');admin=await login('demo.admin@voib.example','VoibAdmin!2026');
 check('Admin page renders for demo administrator',(await req(base+'/admin',{token:admin.token})).status===200);
 check('Anonymous admin API denied',(await req(base+'/api/admin/songs/1',{method:'PATCH',body:{title:'forged',author:'forged'}})).status===401);
 check('Listener admin API denied',(await req(base+'/api/admin/songs/1',{method:'PATCH',token:user.token,body:{title:'forged',author:'forged'}})).status===403);
 check('Demo administrator cannot change seed tracks',(await req(base+'/api/admin/songs/1',{method:'PATCH',token:admin.token,body:{title:'forged',author:'forged'}})).status===403);
 const id=Date.now();uploadedSong=`${user.id}/verification-${id}.mp3`;uploadedImage=`${user.id}/verification-${id}.png`;
 check('Owner audio upload',(await db('/storage/v1/object/songs/'+uploadedSong,{method:'POST',token:user.token,type:'audio/mpeg',raw:fs.readFileSync('public/demo/neon-drift.mp3')})).status===200);
 check('Owner cover upload',(await db('/storage/v1/object/images/'+uploadedImage,{method:'POST',token:user.token,type:'image/png',raw:fs.readFileSync('public/images/liked.png')})).status===200);
 check('Cross-user upload denied',(await db('/storage/v1/object/songs/'+admin.id+'/forged.mp3',{method:'POST',token:user.token,type:'audio/mpeg',raw:fs.readFileSync('public/demo/neon-drift.mp3')})).status>=400);
 const song=await db('/rest/v1/songs',{method:'POST',token:user.token,body:{user_id:user.id,title:'Voib verification upload',author:'Voib Test',song_path:uploadedSong,image_path:uploadedImage}});check('Create owned demo song',song.status===201);
 const owned=await db('/rest/v1/songs?select=*&song_path=eq.'+encodeURIComponent(uploadedSong),{token:user.token});rowId=owned.data[0]?.id;check('Demo flag enforced by database',rowId&&owned.data[0].is_demo===true);
 check('Uploaded audio streams publicly',(await req(url+'/storage/v1/object/public/songs/'+uploadedSong)).status===200);
 check('Like song',(await db('/rest/v1/liked_songs',{method:'POST',token:user.token,body:{user_id:user.id,song_id:rowId}})).status===201);
 const otherLikes=await db('/rest/v1/liked_songs?select=*&user_id=eq.'+user.id,{token:admin.token});check('Likes remain private',otherLikes.status===200&&otherLikes.data.length===0);
 const update=await req(base+'/api/admin/songs/'+rowId,{method:'PATCH',token:admin.token,body:{title:'Verified demo moderation',author:'Voib Test'}});check('Demo administrator moderates demo upload',update.status===200);
 check('Anonymous checkout denied',(await req(base+'/api/create-checkout-session',{method:'POST',body:{price:{id:'forged'}}})).status===401);
 check('Demo account cannot open billing',(await req(base+'/api/create-checkout-session',{method:'POST',token:user.token,body:{price:{id:'forged'}}})).status===400);
 check('Unsigned webhook rejected',(await req(base+'/api/webhooks',{method:'POST',body:{type:'customer.subscription.created'}})).status===400);
 const password=await db('/auth/v1/user',{method:'PUT',token:user.token,body:{password:'ShouldNotChange!2026'}});check('Public demo password protected',password.status>=400);
 await login('demo.user@voib.example','VoibListener!2026');
 check('Demo administrator deletes demo upload',(await req(base+'/api/admin/songs/'+rowId,{method:'DELETE',token:admin.token})).status===200);
 for(const [bucket,name] of [['songs',uploadedSong],['images',uploadedImage]]){const remaining=await db('/storage/v1/object/list/'+bucket,{method:'POST',token:user.token,body:{prefix:user.id,search:name.split('/').pop(),limit:100}});check('Moderation removes uploaded '+bucket,remaining.status===200&&remaining.data.length===0);}
 const seed=await db('/rest/v1/songs?select=title&id=eq.1');check('Seed song unchanged',seed.data[0]?.title&&seed.data[0]?.title!=='forged');
 const report={verifiedAt:new Date().toISOString(),url:base,allPassed:checks.every(x=>x.pass),checks};if(process.env.VOIB_TEST_REPORT)fs.writeFileSync(process.env.VOIB_TEST_REPORT,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
})().catch(error=>{console.log(JSON.stringify({error:error.message,checks},null,2));process.exitCode=1;}).finally(async()=>{if(user){if(rowId)await db('/rest/v1/songs?id=eq.'+rowId,{method:'DELETE',token:user.token});for(const [bucket,name] of [['songs',uploadedSong],['images',uploadedImage]])if(name)await db('/storage/v1/object/'+bucket,{method:'DELETE',token:user.token,body:{prefixes:[name]}});}});
