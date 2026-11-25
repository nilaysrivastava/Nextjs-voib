import {createClient} from '@/libs/supabase/server';
import {NextResponse} from 'next/server';
export async function GET(request:Request) {
 const url=new URL(request.url),token_hash=url.searchParams.get('token_hash');
 if(token_hash){const client=await createClient();const {error}=await client.auth.verifyOtp({token_hash,type:'email'});if(!error)return NextResponse.redirect(new URL('/',url.origin));}
 return NextResponse.redirect(new URL('/?auth_error=confirmation',url.origin));
}
