import {randomBytes} from 'node:crypto';
import {getStripe} from '@/libs/stripe';
import {createOrRetrieveCustomer} from '@/libs/supabaseAdmin';
import {getVerifiedUser} from '@/libs/server-user';
export async function POST(request:Request){
 const origin=process.env.NEXT_PUBLIC_SITE_URL!;if(request.headers.get('origin')&&request.headers.get('origin')!==new URL(origin).origin)return Response.json({error:'Invalid origin'},{status:403});
 const {client,user}=await getVerifiedUser();if(!user)return Response.json({error:'Sign in required'},{status:401});
 if(user.app_metadata.demo)return Response.json({error:'Demo Premium is already included. Use a personal account to test Stripe Checkout.'},{status:400});
 try{
  const body=await request.json();const priceId=process.env.STRIPE_PRICE_ID;
  if(!priceId||body.price?.id!==priceId)return Response.json({error:'Select the configured Voib test plan'},{status:400});
  const active=await client.from('subscriptions').select('id').in('status',['active','trialing']).gt('current_period_end',new Date().toISOString()).limit(1);if(active.data?.length)return Response.json({error:'You already have an active subscription'},{status:409});
  const stripe=getStripe();const price=await stripe.prices.retrieve(priceId);if(price.livemode||!price.active||!price.recurring)return Response.json({error:'A recurring test price is required'},{status:400});
  const customer=await createOrRetrieveCustomer({uuid:user.id,email:user.email!});
  const session=await stripe.checkout.sessions.create({customer,mode:'subscription',line_items:[{price:priceId,quantity:1}],success_url:origin+'/account?checkout=success',cancel_url:origin+'/account?checkout=canceled',integration_identifier:'voib-portfolio-'+Array.from(randomBytes(8),n=>String.fromCharCode(97+n%26)).join('')});
  return Response.json({url:session.url});
 }catch(error){console.error('Test checkout failed:',error instanceof Error?error.message:'Unknown error');return Response.json({error:'Test checkout is temporarily unavailable'},{status:503});}
}
