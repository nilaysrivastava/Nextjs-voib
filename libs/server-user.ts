import {headers} from 'next/headers';
import {createClient} from '@/libs/supabase/server';
export async function getVerifiedUser(){const client=await createClient();const authorization=(await headers()).get('authorization');const token=authorization?.startsWith('Bearer ')?authorization.slice(7):undefined;const {data,error}=await client.auth.getUser(token);return {client,user:error?null:data.user};}
