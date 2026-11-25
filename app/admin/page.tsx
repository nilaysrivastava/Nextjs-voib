import {isAdministrator} from '@/libs/access.cjs';
import {redirect} from 'next/navigation';
import {getVerifiedUser} from '@/libs/server-user';
import Header from '@/components/Header';
import AdminSongs from './AdminSongs';
export const dynamic='force-dynamic';
export default async function Admin(){const {client,user}=await getVerifiedUser();if(!user||!isAdministrator(user))redirect('/?admin=required');let query=client.from('songs').select('*').order('created_at',{ascending:false});if(user.app_metadata.demo)query=query.eq('is_demo',true);const {data}=await query;return <section className="h-full w-full overflow-y-auto rounded-lg bg-neutral-900 text-white"><Header><h1 className="text-3xl font-bold">Voib Admin</h1><p className="mt-2 text-neutral-300">{user.app_metadata.demo?'Manage shared demo tracks. Live songs and accounts stay protected.':'Manage the music catalog.'}</p></Header><AdminSongs songs={(data||[]).map(s=>({...s,id:String(s.id)}))}/></section>;}
