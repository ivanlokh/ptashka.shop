import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
  typescript: true,
});

export const STRIPE_CONFIG = {
  currency: 'usd',
  payment_method_types: ['card'],
  success_url: process.env.STRIPE_SUCCESS_URL || 'http://localhost:3000/payment/success',
  cancel_url: process.env.STRIPE_CANCEL_URL || 'http://localhost:3000/payment/cancel',
};
