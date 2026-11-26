"use client";
import {useState,type FormEvent} from 'react';
import {useRouter} from 'next/navigation';
import {useUser} from '@/hooks/useUser';
import {useSupabaseClient} from '@/providers/SupabaseProvider';
import Header from '@/components/Header';
import Input from '@/components/Input';
import Button from '@/components/Button';
export default function ResetPassword(){
 const {user,isLoading}=useUser(),client=useSupabaseClient(),router=useRouter();
 const [password,setPassword]=useState(''),[confirmation,setConfirmation]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 async function submit(event:FormEvent){event.preventDefault();setError('');if(password!==confirmation){setError('Passwords must match.');return;}setBusy(true);const {error}=await client.auth.updateUser({password});setBusy(false);if(error){setError(error.message);return;}setPassword('');setConfirmation('');router.replace('/account');router.refresh();}
 return <div className="h-full w-full overflow-y-auto rounded-lg bg-neutral-900"><Header><h1 className="text-2xl font-bold">Reset your password</h1></Header><div className="max-w-md p-6">{isLoading?<p>Checking your session…</p>:!user?<p>Open the password reset link from your email to continue.</p>:user.app_metadata.demo?<p>Public demo passwords are fixed. Use a personal account to reset your password.</p>:<form onSubmit={submit} className="space-y-4"><Input aria-label="New password" type="password" autoComplete="new-password" minLength={8} required placeholder="New password" value={password} onChange={e=>setPassword(e.target.value)}/><Input aria-label="Confirm new password" type="password" autoComplete="new-password" minLength={8} required placeholder="Confirm new password" value={confirmation} onChange={e=>setConfirmation(e.target.value)}/>{error&&<p role="alert" className="text-rose-300">{error}</p>}<Button type="submit" disabled={busy}>{busy?'Saving…':'Save password'}</Button></form>}</div></div>;
}
