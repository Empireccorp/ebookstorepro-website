import { Request, Response } from 'express';
import stripe from '../config/stripe';
import prisma from '../config/database';

/**
 * Cria uma sessão de checkout do Stripe
 * POST /api/checkout/create-session
 */
export const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const { email, ebookSlug, affiliateCode } = req.body;

    // Validação básica
    if (!email || !ebookSlug) {
      return res.status(400).json({
        status: 'error',
        message: 'Email and ebookSlug are required',
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid email format',
      });
    }

    // Buscar ebook no banco
    const ebook = await prisma.ebook.findUnique({
      where: {
        slug: ebookSlug,
        isActive: true,
      },
    });

    if (!ebook) {
      return res.status(404).json({
        status: 'error',
        message: 'Ebook not found or inactive',
      });
    }

    // Verificar se o ebook tem stripePriceId configurado
    if (!ebook.stripePriceId) {
      return res.status(400).json({
        status: 'error',
        message: 'This ebook does not have a Stripe price configured',
      });
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    // Criar sessão de checkout no Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: email,
      line_items: [
        {
          price: ebook.stripePriceId,
          quantity: 1,
        },
      ],
      success_url: `${frontendUrl}/obrigado?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/cancelado`,
      metadata: {
        ebookId: ebook.id,
        ebookSlug: ebook.slug,
        ebookTitle: ebook.title,
        buyerEmail: email,
        affiliateCode: affiliateCode || '',
      },
      locale: 'pt-BR',
    });

    res.json({
      status: 'success',
      data: {
        sessionId: session.id,
        url: session.url,
      },
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    
    // Tratar erros específicos do Stripe
    if (error instanceof Error) {
      return res.status(500).json({
        status: 'error',
        message: 'Failed to create checkout session',
        error: error.message,
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Failed to create checkout session',
      error: 'Unknown error',
    });
  }
};
