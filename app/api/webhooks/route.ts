import type Stripe from 'stripe';
import {getStripe} from '@/libs/stripe';
import {upsertProductRecord,upsertPriceRecord,manageSubscriptionStatusChange} from '@/libs/supabaseAdmin';
export async function POST(request:Request){
 const signature=request.headers.get('stripe-signature'),secret=process.env.STRIPE_WEBHOOK_SECRET;
 if(!signature)return Response.json({error:'Missing signature'},{status:400});if(!secret)return Response.json({error:'Webhook setup is incomplete'},{status:503});
 let event:Stripe.Event;try{event=getStripe().webhooks.constructEvent(await request.text(),signature,secret);}catch{return Response.json({error:'Invalid signature'},{status:400});}
 if(event.livemode)return Response.json({error:'Live events are disabled'},{status:400});
 try{
  switch(event.type){
   case 'product.created':case 'product.updated':await upsertProductRecord(event.data.object);break;
   case 'price.created':case 'price.updated':await upsertPriceRecord(event.data.object);break;
   case 'customer.subscription.created':case 'customer.subscription.updated':case 'customer.subscription.deleted':{const s=event.data.object;await manageSubscriptionStatusChange(s.id,typeof s.customer==='string'?s.customer:s.customer.id);break;}
   case 'checkout.session.completed':case 'checkout.session.async_payment_succeeded':{const s=event.data.object;if(s.mode==='subscription'&&s.subscription&&s.customer){await manageSubscriptionStatusChange(typeof s.subscription==='string'?s.subscription:s.subscription.id,typeof s.customer==='string'?s.customer:s.customer.id);}break;}
   case 'invoice.paid':case 'invoice.payment_failed':{const invoice=event.data.object;const sub=invoice.parent?.subscription_details?.subscription;if(sub&&invoice.customer)await manageSubscriptionStatusChange(typeof sub==='string'?sub:sub.id,typeof invoice.customer==='string'?invoice.customer:invoice.customer.id);break;}
  }
  return Response.json({received:true});
 }catch(error){console.error('Test webhook failed:',error instanceof Error?error.message:'Unknown error');return Response.json({error:'Webhook processing failed; retry required'},{status:500});}
}
