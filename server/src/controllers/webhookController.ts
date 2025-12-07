import { Request, Response } from 'express';
import Stripe from 'stripe';
import stripe from '../config/stripe';
import prisma from '../config/database';
import crypto from 'crypto';
import { sendOrderEmail, isEmailServiceConfigured } from '../services/emailService';

/**
 * Processa webhooks do Stripe
 * POST /api/stripe/webhook
 */
export const handleStripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'];

  if (!sig) {
    console.error('❌ Webhook Error: No stripe-signature header');
    return res.status(400).send('Webhook Error: No signature');
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('❌ Webhook Error: STRIPE_WEBHOOK_SECRET not configured');
    return res.status(500).send('Webhook Error: Secret not configured');
  }

  let event: Stripe.Event;

  try {
    // Verificar assinatura do webhook
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      webhookSecret
    );
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err);
    return res.status(400).send(`Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }

  console.log(`✅ Webhook received: ${event.type}`);

  // Processar eventos específicos
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      default:
        console.log(`ℹ️  Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    res.status(500).json({
      error: 'Webhook processing failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Processa evento checkout.session.completed
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('📦 Processing checkout.session.completed');
  console.log('Session ID:', session.id);
  console.log('Payment Status:', session.payment_status);
  console.log('Metadata:', session.metadata);

  // Extrair dados da sessão
  const {
    id: sessionId,
    customer_email: email,
    amount_total,
    currency,
    payment_status,
    payment_intent,
    metadata,
  } = session;

  if (!metadata || !metadata.ebookId) {
    console.error('❌ No ebookId in metadata');
    return;
  }

  const ebookId = metadata.ebookId;
  const buyerEmail = metadata.buyerEmail || email || '';
  const affiliateCode = metadata.affiliateCode || null;

  // Determinar status do pedido
  let orderStatus = 'pending';
  if (payment_status === 'paid') {
    orderStatus = 'paid';
  } else if (payment_status === 'unpaid') {
    orderStatus = 'pending';
  }

  // Verificar se já existe um pedido com este session_id (evitar duplicação)
  const existingOrder = await prisma.order.findUnique({
    where: {
      stripeCheckoutSessionId: sessionId,
    },
  });

  if (existingOrder) {
    console.log('ℹ️  Order already exists, updating status');
    
    // Atualizar status se necessário
    await prisma.order.update({
      where: { id: existingOrder.id },
      data: {
        status: orderStatus,
        stripePaymentIntentId: payment_intent as string || existingOrder.stripePaymentIntentId,
      },
    });

    console.log('✅ Order updated:', existingOrder.id);
    return;
  }

  // Processar afiliado (se houver)
  let affiliateId: string | null = null;
  let affiliateCommissionAmount: number | null = null;
  let affiliateCommissionStatus: string | null = null;

  if (affiliateCode && affiliateCode.trim() !== '') {
    console.log('🔗 Processing affiliate code:', affiliateCode);
    
    // Buscar afiliado pelo código
    const affiliate = await prisma.affiliate.findUnique({
      where: { 
        code: affiliateCode.toUpperCase(),
      },
    });

    if (affiliate && affiliate.status === 'active') {
      // Calcular comissão
      const totalAmount = (amount_total || 0) / 100;
      const commissionPercent = Number(affiliate.commissionPercent);
      const commissionAmount = totalAmount * (commissionPercent / 100);

      affiliateId = affiliate.id;
      affiliateCommissionAmount = commissionAmount;
      affiliateCommissionStatus = 'pending';

      console.log('✅ Affiliate found:', affiliate.name);
      console.log('   Commission:', commissionAmount, 'BRL');
    } else {
      console.warn('⚠️  Affiliate not found or inactive:', affiliateCode);
    }
  }

  // Criar novo pedido
  const order = await prisma.order.create({
    data: {
      email: buyerEmail,
      ebookId: ebookId,
      amount: (amount_total || 0) / 100, // Converter de centavos para reais
      currency: (currency || 'BRL').toUpperCase(),
      status: orderStatus,
      stripePaymentIntentId: payment_intent as string || null,
      stripeCheckoutSessionId: sessionId,
      affiliateCode: affiliateCode,
      affiliateId: affiliateId,
      affiliateCommissionAmount: affiliateCommissionAmount,
      affiliateCommissionStatus: affiliateCommissionStatus,
    },
  });

  console.log('✅ Order created:', order.id);
  console.log('   Email:', order.email);
  console.log('   Ebook ID:', order.ebookId);
  console.log('   Amount:', order.amount, order.currency);
  console.log('   Status:', order.status);

  // Se o pedido está pago, enviar e-mail com link de download
  if (order.status === 'paid') {
    await sendOrderEmailWithDownloadLink(order.id);
  }
}

/**
 * Processa evento payment_intent.succeeded
 */
/**
 * Envia e-mail com link de download para um pedido
 */
async function sendOrderEmailWithDownloadLink(orderId: string) {
  try {
    if (!isEmailServiceConfigured()) {
      console.warn('⚠️  Email service not configured, skipping email send');
      return;
    }

    // Buscar pedido com informações do ebook
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { ebook: true },
    });

    if (!order) {
      console.error('❌ Order not found:', orderId);
      return;
    }

    // Gerar ou obter link de download existente
    let download = await prisma.download.findFirst({
      where: {
        orderId: orderId,
        expiresAt: { gt: new Date() },
      },
    });

    if (!download) {
      // Gerar novo link de download
      const downloadToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      download = await prisma.download.create({
        data: {
          orderId: orderId,
          ebookId: order.ebookId,
          downloadToken: downloadToken,
          expiresAt: expiresAt,
          downloadCount: 0,
          maxDownloads: 3,
        },
      });

      console.log('✅ Download link generated:', downloadToken);
    } else {
      console.log('ℹ️  Using existing download link:', download.downloadToken);
    }

    // Construir URL de download
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const downloadUrl = `${frontendUrl}/download/${download.downloadToken}`;

    // Enviar e-mail
    await sendOrderEmail({
      customerEmail: order.email,
      ebookTitle: order.ebook.title,
      downloadUrl: downloadUrl,
      orderId: order.id,
      orderDate: order.createdAt,
    });

    console.log('✅ Order email sent to:', order.email);
  } catch (error) {
    console.error('❌ Error sending order email:', error);
    // Não lançar erro para não bloquear o webhook
  }
}

/**
 * Processa evento payment_intent.succeeded
 */
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log('💳 Processing payment_intent.succeeded');
  console.log('Payment Intent ID:', paymentIntent.id);

  // Atualizar status do pedido para 'paid'
  const order = await prisma.order.findFirst({
    where: {
      stripePaymentIntentId: paymentIntent.id,
    },
  });

  if (order) {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'paid' },
    });
    console.log('✅ Order marked as paid:', order.id);

    // Enviar e-mail com link de download
    await sendOrderEmailWithDownloadLink(order.id);
  } else {
    console.log('ℹ️  No order found for payment intent:', paymentIntent.id);
  }
}

/**
 * Processa evento payment_intent.payment_failed
 */
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log('❌ Processing payment_intent.payment_failed');
  console.log('Payment Intent ID:', paymentIntent.id);

  // Atualizar status do pedido para 'failed'
  const order = await prisma.order.findFirst({
    where: {
      stripePaymentIntentId: paymentIntent.id,
    },
  });

  if (order) {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'failed' },
    });
    console.log('✅ Order marked as failed:', order.id);
  } else {
    console.log('ℹ️  No order found for payment intent:', paymentIntent.id);
  }
}
