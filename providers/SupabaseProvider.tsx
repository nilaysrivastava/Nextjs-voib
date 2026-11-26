"use client";
import {createContext, useContext, useEffect, useState, type ReactNode} from 'react';
import type {Session, SupabaseClient, User as AuthUser} from '@supabase/supabase-js';
import {createClient} from '@/libs/supabase/client';
import type {Database} from '@/types_db';
export type User = AuthUser;
const Context = createContext<{session:Session|null;isLoading:boolean;supabaseClient:SupabaseClient<Database>}|null>(null);
export function useSessionContext() {const value=useContext(Context);if(!value) throw new Error('SupabaseProvider is missing');return value;}
export function useSupabaseClient() {return useSessionContext().supabaseClient;}
export function useUser() {return useSessionContext().session?.user || null;}
export default function SupabaseProvider({children}:{children:ReactNode}) {
  const [supabaseClient] = useState(createClient);
  const [session,setSession]=useState<Session|null>(null);
  const [isLoading,setLoading]=useState(true);
  useEffect(()=>{
    let active=true;
    supabaseClient.auth.getSession().then(async({data})=>{const session=data.session;if(!session){if(active){setSession(null);setLoading(false);}return;}const verified=await supabaseClient.auth.getUser();if(active){setSession(verified.data.user?{...session,user:verified.data.user}:null);setLoading(false);}});
    const {data}=supabaseClient.auth.onAuthStateChange((_event,next)=>{setSession(next);setLoading(false);});
    return ()=>{active=false;data.subscription.unsubscribe();};
  },[supabaseClient]);
  return <Context.Provider value={{session,isLoading,supabaseClient}}>{children}</Context.Provider>;
}
