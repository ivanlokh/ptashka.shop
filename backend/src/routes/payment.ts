import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { stripe, STRIPE_CONFIG } from '../config/stripe';
import { protect } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();
const prisma = new PrismaClient();

// Create payment intent
router.post('/create-payment-intent', protect, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { items, orderId } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return next(new AppError('Items are required for payment', 400));
    }

    // Calculate total amount
    const totalAmount = items.reduce((total: number, item: any) => {
      return total + (item.price * item.quantity * 100); // Convert to cents
    }, 0);

    if (totalAmount < 50) { // Minimum $0.50
      return next(new AppError('Minimum order amount is $0.50', 400));
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: STRIPE_CONFIG.currency,
      payment_method_types: STRIPE_CONFIG.payment_method_types,
      metadata: {
        orderId: orderId || 'temp',
        userId: req.user!.id,
      },
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    next(error);
  }
});

// Create checkout session
router.post('/create-checkout-session', protect, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { items, orderId } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return next(new AppError('Items are required for checkout', 400));
    }

    // Prepare line items for Stripe
    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: STRIPE_CONFIG.currency,
        product_data: {
          name: item.name,
          description: item.description || '',
          images: item.images ? [item.images[0]] : [],
        },
        unit_amount: Math.round(item.price * 100), // Convert to cents
      },
      quantity: item.quantity,
    }));

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${STRIPE_CONFIG.success_url}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: STRIPE_CONFIG.cancel_url,
      metadata: {
        orderId: orderId || 'temp',
        userId: req.user!.id,
      },
    });

    res.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    next(error);
  }
});

// Verify payment
router.post('/verify-payment', protect, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { paymentIntentId, sessionId } = req.body;

    if (!paymentIntentId && !sessionId) {
      return next(new AppError('Payment intent ID or session ID is required', 400));
    }

    let paymentIntent;

    if (paymentIntentId) {
      paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    } else if (sessionId) {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.payment_intent) {
        paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent as string);
      }
    }

    if (!paymentIntent) {
      return next(new AppError('Payment not found', 404));
    }

    res.json({
      success: true,
      paymentStatus: paymentIntent.status,
      paymentIntent,
    });
  } catch (error) {
    next(error);
  }
});

// Webhook handler
router.post('/webhook', async (req: Request, res: Response, next: NextFunction) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !endpointSecret) {
    return res.status(400).send('Webhook signature verification failed');
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).send('Webhook signature verification failed');
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log('Payment succeeded:', paymentIntent.id);
        // Update order status in database
        // await updateOrderStatus(paymentIntent.metadata.orderId, 'paid');
        break;

      case 'checkout.session.completed':
        const session = event.data.object;
        console.log('Checkout session completed:', session.id);
        // Update order status in database
        // await updateOrderStatus(session.metadata.orderId, 'paid');
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return res.status(500).json({ error: 'Webhook handler failed' });
  }
});

export default router;
