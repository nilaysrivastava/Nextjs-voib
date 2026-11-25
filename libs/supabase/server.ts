import 'server-only';
import {createServerClient} from '@supabase/ssr';
import {cookies, headers} from 'next/headers';
import type {Database} from '@/types_db';
export async function createClient() {
  const jar = await cookies();
  const requestHeaders = await headers();
  const authorization = requestHeaders.get('authorization');
  return createServerClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    ...(authorization?.startsWith('Bearer ') ? {global:{headers:{Authorization:authorization}}} : {}),
    cookies: {getAll: () => jar.getAll(), setAll: (values) => {try {values.forEach(({name,value,options}) => jar.set(name,value,options));} catch {/* Proxy writes refresh cookies for Server Components. */}}}
  });
}
