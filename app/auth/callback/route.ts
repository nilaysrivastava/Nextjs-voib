import {createClient} from '@/libs/supabase/server';
import {NextResponse} from 'next/server';
export async function GET(request:Request) {
 const url=new URL(request.url);const code=url.searchParams.get('code');
 const origin=new URL(process.env.NEXT_PUBLIC_SITE_URL||request.url).origin;
 if(code){const client=await createClient();const {error}=await client.auth.exchangeCodeForSession(code);if(!error)return NextResponse.redirect(new URL('/',origin));}
 return NextResponse.redirect(new URL('/?auth_error=callback',origin));
}
