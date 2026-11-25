import 'server-only';
import Stripe from 'stripe';
import {isTestStripeKey} from './access.cjs';
let stripeClient:Stripe|undefined;
export function getStripe(){
 const key=process.env.STRIPE_SECRET_KEY || '';
 if(!isTestStripeKey(key))throw new Error('Stripe test-mode credentials are required. Live payments are disabled.');
 return stripeClient ||= new Stripe(key,{apiVersion:'2026-11-18.endive',appInfo:{name:'Voib portfolio',version:'1.0.0'}});
}
