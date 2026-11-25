import {getVerifiedUser} from '@/libs/server-user';
import {getStripe} from '@/libs/stripe';
import {getAdminClient} from '@/libs/supabaseAdmin';
export async function POST(request:Request){
 const site=process.env.NEXT_PUBLIC_SITE_URL!;if(request.headers.get('origin')&&request.headers.get('origin')!==new URL(site).origin)return Response.json({error:'Invalid origin'},{status:403});
 const {user}=await getVerifiedUser();if(!user)return Response.json({error:'Sign in required'},{status:401});if(user.app_metadata.demo)return Response.json({error:'Demo Premium has no billing account'},{status:400});
 try{const {data}=await getAdminClient().from('customers').select('stripe_customer_id').eq('id',user.id).maybeSingle();if(!data)return Response.json({error:'No Stripe test customer exists yet'},{status:404});const session=await getStripe().billingPortal.sessions.create({customer:data.stripe_customer_id,return_url:site+'/account'});return Response.json({url:session.url});}catch{return Response.json({error:'Test billing portal is unavailable'},{status:503});}
}
