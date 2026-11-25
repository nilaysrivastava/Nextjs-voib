import {isAdministrator,validSongPatch} from '@/libs/access.cjs';
import {getVerifiedUser} from '@/libs/server-user';
async function authorize(request:Request,id:string){
 const origin=request.headers.get('origin');if(origin&&origin!==new URL(process.env.NEXT_PUBLIC_SITE_URL!).origin)return {error:Response.json({error:'Invalid origin'},{status:403})};
 const {client,user}=await getVerifiedUser();if(!user)return {error:Response.json({error:'Sign in required'},{status:401})};
 if(!isAdministrator(user))return {error:Response.json({error:'Administrator access required'},{status:403})};
 if(!/^\d+$/.test(id))return {error:Response.json({error:'Invalid song ID'},{status:400})};
 const {data:song}=await client.from('songs').select('*').eq('id',Number(id)).maybeSingle();if(!song)return {error:Response.json({error:'Song not found'},{status:404})};
 if(user.app_metadata.demo && !song.is_demo)return {error:Response.json({error:'Demo administrators can only manage sample uploads'},{status:403})};
 return {client,song};
}
export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){const {id}=await params;const result=await authorize(request,id);if(result.error)return result.error;const body=await request.json().catch(()=>null);const patch=validSongPatch(body);if(!patch)return Response.json({error:'Enter a title and artist within the length limits'},{status:400});const {error}=await result.client!.from('songs').update(patch).eq('id',Number(id));return error?Response.json({error:'Update failed'},{status:400}):Response.json({success:true});}
export async function DELETE(request:Request,{params}:{params:Promise<{id:string}>}){const {id}=await params;const result=await authorize(request,id);if(result.error)return result.error;const {error}=await result.client!.from('songs').delete().eq('id',Number(id));if(error)return Response.json({error:'Delete failed'},{status:400});for(const [bucket,path] of [['songs',result.song!.song_path],['images',result.song!.image_path]])if(path&&!path.startsWith('/'))await result.client!.storage.from(bucket!).remove([path]);return Response.json({success:true});}
