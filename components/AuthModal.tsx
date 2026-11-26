"use client";
import {useEffect,useState,type FormEvent} from 'react';
import {useRouter} from 'next/navigation';
import {useSessionContext,useSupabaseClient} from '@/providers/SupabaseProvider';
import useAuthModal from '@/hooks/useAuthModal';
import Modal from './Modal';
import Input from './Input';
import Button from './Button';
import {DemoLogins} from './DemoLogins';
export default function AuthModal(){
 const {session}=useSessionContext(),client=useSupabaseClient(),router=useRouter();
 const {onClose,isOpen}=useAuthModal();
 const [mode,setMode]=useState<'login'|'signup'|'confirm'|'magic'|'forgot'>('login');
 const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[name,setName]=useState(''),[code,setCode]=useState('');
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
 useEffect(()=>{if(session){onClose();router.refresh();}},[session,onClose,router]);
 async function submit(event:FormEvent){event.preventDefault();setBusy(true);setError('');setNotice('');try{
  if(mode==='login'){const {error}=await client.auth.signInWithPassword({email,password});if(error)throw error;}
  if(mode==='signup'){const {error}=await client.auth.signUp({email,password,options:{data:{full_name:name},emailRedirectTo:window.location.origin+'/auth/callback'}});if(error)throw error;setMode('confirm');setNotice('Check your email for the verification code.');}
  if(mode==='confirm'){const {error}=await client.auth.verifyOtp({email,token:code,type:'email'});if(error)throw error;}
  if(mode==='magic'){const {error}=await client.auth.signInWithOtp({email,options:{shouldCreateUser:false,emailRedirectTo:window.location.origin+'/auth/callback'}});if(error)throw error;setNotice('Check your email for a sign-in link.');}
  if(mode==='forgot'){const {error}=await client.auth.resetPasswordForEmail(email);if(error)throw error;setNotice('If this email has an account, a password reset link will arrive shortly.');}
 }catch(caught){setError(caught instanceof Error?caught.message:'Sign-in failed. Please try again.');}finally{setBusy(false);}}
 return <Modal title={mode==='signup'?'Create your Voib account':mode==='confirm'?'Verify your email':'Welcome to Voib'} description="Your music, your library." isOpen={isOpen} onChange={open=>{if(!open)onClose();}}>
 <div className="mb-4 flex gap-3"><button onClick={()=>{setMode('login');setError('');}} className="text-sm">Log in</button><button onClick={()=>{setMode('signup');setError('');}} className="text-sm">Sign up</button></div>
 <form onSubmit={submit} className="flex flex-col gap-3">
 {mode==='signup'&&<Input aria-label="Full name" placeholder="Full name" value={name} onChange={e=>setName(e.target.value)} required maxLength={100}/>}
 <Input aria-label="Email" placeholder="Email" type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} required/>
 {(mode==='login'||mode==='signup')&&<Input aria-label="Password" placeholder="Password" type="password" autoComplete={mode==='signup'?'new-password':'current-password'} minLength={8} value={password} onChange={e=>setPassword(e.target.value)} required/>}
 {mode==='confirm'&&<Input aria-label="Verification code" placeholder="Email verification code" inputMode="numeric" value={code} onChange={e=>setCode(e.target.value)} required/>}
 {error&&<p role="alert" className="text-sm text-rose-300">{error}</p>}{notice&&<p role="status" className="text-sm text-pink-200">{notice}</p>}
 <Button disabled={busy} type="submit">{busy?'Please wait…':mode==='signup'?'Create account':mode==='confirm'?'Verify email':mode==='magic'?'Email me a sign-in link':mode==='forgot'?'Email me a reset link':'Log in'}</Button>
 </form>
 {mode==='login'&&<div className="mt-3 flex flex-col items-start gap-2 text-sm text-neutral-300"><button onClick={()=>{setMode('magic');setNotice('');setError('');}}>Sign in with an email link</button><button onClick={()=>{setMode('forgot');setNotice('');setError('');}}>Forgot password?</button></div>}
 {process.env.NEXT_PUBLIC_GITHUB_AUTH_ENABLED==='true'&&<Button className="mt-3" onClick={()=>client.auth.signInWithOAuth({provider:'github',options:{redirectTo:window.location.origin+'/auth/callback'}})}>Continue with GitHub</Button>}
 <details className="mt-5 rounded-lg border border-neutral-700 p-3"><summary className="cursor-pointer text-sm">Try demo accounts</summary><DemoLogins/></details>
 </Modal>;
}
