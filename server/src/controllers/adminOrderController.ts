import { Request, Response } from 'express';
import crypto from 'crypto';
import prisma from '../config/database';
import { sendOrderEmail, isEmailServiceConfigured } from '../services/emailService';

/**
 * Listar todos os pedidos (admin)
 * GET /api/admin/orders
 */
export const listOrders = async (req: Request, res: Response) => {
  try {
    const { status, limit } = req.query;

    const where: any = {};
    if (status && typeof status === 'string') {
      where.status = status;
    }

    const orders = await prisma.order.findMany({
      where,
      take: limit ? parseInt(limit as string) : undefined,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        ebook: {
          select: {
            id: true,
            slug: true,
            title: true,
            coverUrl: true,
          },
        },
        downloads: {
          select: {
            id: true,
            downloadToken: true,
            expiresAt: true,
            downloadCount: true,
            maxDownloads: true,
          },
        },
      },
    });

    res.json({
      status: 'success',
      data: orders,
    });
  } catch (error) {
    console.error('Error listing orders:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to list orders',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Obter detalhes de um pedido
 * GET /api/admin/orders/:id
 */
export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        ebook: true,
        downloads: {
          orderBy: {
            createdAt: 'desc',
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
 * Reenviar e-mail de um pedido
 * POST /api/admin/orders/:id/resend-email
 */
export const resendOrderEmailAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Verificar se o serviço de e-mail está configurado
    if (!isEmailServiceConfigured()) {
      return res.status(503).json({
        status: 'error',
        message: 'Email service not configured',
      });
    }

    // Buscar pedido com informações do ebook
    const order = await prisma.order.findUnique({
      where: { id },
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
        orderId: id,
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
          orderId: id,
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

/**
 * Obter estatísticas de pedidos
 * GET /api/admin/orders/stats
 */
export const getOrderStats = async (req: Request, res: Response) => {
  try {
    // Total de pedidos por status
    const statusCounts = await prisma.order.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    });

    // Receita total
    const revenueData = await prisma.order.aggregate({
      where: { status: 'paid' },
      _sum: {
        amount: true,
      },
    });

    const totalRevenue = revenueData._sum.amount || 0;

    // Pedidos dos últimos 30 dias
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentOrders = await prisma.order.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    res.json({
      status: 'success',
      data: {
        statusCounts,
        totalRevenue: Number(totalRevenue),
        recentOrders,
      },
    });
  } catch (error) {
    console.error('Error fetching order stats:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch order stats',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
