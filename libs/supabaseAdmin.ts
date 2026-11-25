import 'server-only';
import {createClient} from '@supabase/supabase-js';
import type Stripe from 'stripe';
import {getStripe} from './stripe';
export function getAdminClient(){const key=process.env.SUPABASE_SECRET_KEY;if(!key)throw new Error('Billing setup is incomplete');return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,key,{auth:{persistSession:false,autoRefreshToken:false}});}
export async function upsertProductRecord(product:Stripe.Product){if(product.livemode)throw new Error('Live mode is disabled');const {error}=await getAdminClient().from('products').upsert({id:product.id,active:product.active,name:product.name,description:product.description,image:product.images[0]||null,metadata:product.metadata});if(error)throw error;}
export async function upsertPriceRecord(price:Stripe.Price){if(price.livemode)throw new Error('Live mode is disabled');const {error}=await getAdminClient().from('prices').upsert({id:price.id,product_id:typeof price.product==='string'?price.product:price.product.id,active:price.active,currency:price.currency,description:price.nickname,type:price.type,unit_amount:price.unit_amount,interval:price.recurring?.interval,interval_count:price.recurring?.interval_count,trial_period_days:price.recurring?.trial_period_days,metadata:price.metadata});if(error)throw error;}
export async function createOrRetrieveCustomer({email,uuid}:{email:string;uuid:string}){
 const db=getAdminClient(),stripe=getStripe();const {data,error}=await db.from('customers').select('stripe_customer_id').eq('id',uuid).maybeSingle();if(error)throw error;if(data?.stripe_customer_id)return data.stripe_customer_id;
 const customer=await stripe.customers.create({email,metadata:{supabaseUUID:uuid}},{idempotencyKey:`voib-customer-${uuid}`});
 const saved=await db.from('customers').upsert({id:uuid,stripe_customer_id:customer.id});if(saved.error)throw saved.error;return customer.id;
}
export async function manageSubscriptionStatusChange(subscriptionId:string,customerId:string){
 const db=getAdminClient(),stripe=getStripe();const {data:mapping,error}=await db.from('customers').select('id').eq('stripe_customer_id',customerId).maybeSingle();if(error)throw error;if(!mapping)throw new Error('Unmapped Stripe customer');
 const subscription=await stripe.subscriptions.retrieve(subscriptionId,{expand:['items.data.price.product']});if(subscription.livemode)throw new Error('Live mode is disabled');
 const item=subscription.items.data[0];if(!item)throw new Error('Subscription has no price');
 if(typeof item.price.product!=='string'&&!item.price.product.deleted)await upsertProductRecord(item.price.product);
 await upsertPriceRecord(item.price);
 const iso=(value:number|null|undefined)=>value?new Date(value*1000).toISOString():null;
 const result=await db.from('subscriptions').upsert({id:subscription.id,user_id:mapping.id,status:subscription.status,metadata:subscription.metadata,price_id:item.price.id,quantity:item.quantity||1,cancel_at_period_end:subscription.cancel_at_period_end,created:iso(subscription.created),current_period_start:iso(item.current_period_start),current_period_end:iso(item.current_period_end),ended_at:iso(subscription.ended_at),cancel_at:iso(subscription.cancel_at),canceled_at:iso(subscription.canceled_at),trial_start:iso(subscription.trial_start),trial_end:iso(subscription.trial_end)});if(result.error)throw result.error;
}
