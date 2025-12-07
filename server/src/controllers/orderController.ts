import { Request, Response } from 'express';
import crypto from 'crypto';
import prisma from '../config/database';
import { sendOrderEmail, isEmailServiceConfigured } from '../services/emailService';

/**
 * Busca um pedido pelo Stripe Checkout Session ID
 * GET /api/orders/session/:sessionId
 */
export const getOrderBySessionId = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({
        status: 'error',
        message: 'Session ID is required',
      });
    }

    // Buscar pedido com informações do ebook
    const order = await prisma.order.findUnique({
      where: {
        stripeCheckoutSessionId: sessionId,
      },
      include: {
        ebook: {
          select: {
            id: true,
            slug: true,
            title: true,
            subtitle: true,
            coverUrl: true,
            priceDisplay: true,
            currency: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found',
      });
    }

    res.json({
      status: 'success',
      data: order,
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch order',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Lista todos os pedidos (para admin)
 * GET /api/orders
 */
export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        ebook: {
          select: {
            title: true,
            slug: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({
      status: 'success',
      data: orders,
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch orders',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Reenvia e-mail de download para um pedido
 * POST /api/orders/:orderId/resend-email
 */
export const resendOrderEmail = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({
        status: 'error',
        message: 'Order ID is required',
      });
    }

    // Verificar se o serviço de e-mail está configurado
    if (!isEmailServiceConfigured()) {
      return res.status(503).json({
        status: 'error',
        message: 'Email service not configured',
      });
    }

    // Buscar pedido com informações do ebook
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { ebook: true },
    });

    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found',
      });
    }

    // Verificar se o pedido está pago
    if (order.status !== 'paid') {
      return res.status(400).json({
        status: 'error',
        message: 'Order is not paid yet',
        orderStatus: order.status,
      });
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

      console.log('✅ New download link generated for resend:', downloadToken);
    } else {
      console.log('ℹ️  Using existing download link for resend:', download.downloadToken);
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

    console.log('✅ Order email resent to:', order.email);

    res.json({
      status: 'success',
      message: 'Email sent successfully',
      data: {
        email: order.email,
        ebookTitle: order.ebook.title,
        downloadToken: download.downloadToken,
      },
    });
  } catch (error) {
    console.error('Error resending order email:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to resend email',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
