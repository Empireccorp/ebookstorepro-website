import { Request, Response } from 'express';
import prisma from '../config/database';

/**
 * Marcar comissões pendentes de um afiliado como pagas
 * POST /api/admin/affiliates/:id/pay-commissions
 */
export const payAffiliateCommissions = async (req: Request, res: Response) => {
  try {
    const { id: affiliateId } = req.params;
    const { notes } = req.body;

    // Verificar se o afiliado existe
    const affiliate = await prisma.affiliate.findUnique({
      where: { id: affiliateId },
    });

    if (!affiliate) {
      return res.status(404).json({
        status: 'error',
        message: 'Affiliate not found',
      });
    }

    // Buscar todas as orders pendentes deste afiliado
    const pendingOrders = await prisma.order.findMany({
      where: {
        affiliateId: affiliateId,
        affiliateCommissionStatus: 'pending',
        status: 'paid', // Apenas orders pagas
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    if (pendingOrders.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No pending commissions for this affiliate',
      });
    }

    // Calcular total de comissões
    const totalAmount = pendingOrders.reduce(
      (sum, order) => sum + Number(order.affiliateCommissionAmount || 0),
      0
    );

    // Obter datas do período
    const periodStart = pendingOrders[0].createdAt;
    const periodEnd = new Date();

    // Criar registro de payout
    const payout = await prisma.affiliatePayout.create({
      data: {
        affiliateId: affiliateId,
        totalAmount: totalAmount,
        periodStart: periodStart,
        periodEnd: periodEnd,
        notes: notes || null,
        paidAt: new Date(),
      },
    });

    // Atualizar todas as orders pendentes
    const orderIds = pendingOrders.map((o) => o.id);
    
    await prisma.order.updateMany({
      where: {
        id: { in: orderIds },
      },
      data: {
        affiliateCommissionStatus: 'paid',
        affiliateCommissionPaidAt: new Date(),
        affiliatePayoutId: payout.id,
      },
    });

    console.log('✅ Affiliate commissions paid:');
    console.log('   Affiliate:', affiliate.name);
    console.log('   Total Amount:', totalAmount, 'BRL');
    console.log('   Orders:', orderIds.length);
    console.log('   Payout ID:', payout.id);

    res.json({
      status: 'success',
      message: 'Commissions marked as paid successfully',
      data: {
        payout,
        ordersUpdated: orderIds.length,
        totalAmount,
      },
    });
  } catch (error) {
    console.error('Error paying affiliate commissions:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to pay commissions',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Listar todos os payouts
 * GET /api/admin/affiliate-payouts
 */
export const listPayouts = async (req: Request, res: Response) => {
  try {
    const { affiliateId } = req.query;

    const where: any = {};
    if (affiliateId && typeof affiliateId === 'string') {
      where.affiliateId = affiliateId;
    }

    const payouts = await prisma.affiliatePayout.findMany({
      where,
      include: {
        affiliate: {
          select: {
            id: true,
            name: true,
            email: true,
            code: true,
          },
        },
        _count: {
          select: {
            orders: true,
          },
        },
      },
      orderBy: {
        paidAt: 'desc',
      },
    });

    res.json({
      status: 'success',
      data: payouts,
    });
  } catch (error) {
    console.error('Error listing payouts:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to list payouts',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Obter detalhes de um payout
 * GET /api/admin/affiliate-payouts/:id
 */
export const getPayoutById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const payout = await prisma.affiliatePayout.findUnique({
      where: { id },
      include: {
        affiliate: true,
        orders: {
          include: {
            ebook: {
              select: {
                id: true,
                slug: true,
                title: true,
              },
            },
          },
        },
      },
    });

    if (!payout) {
      return res.status(404).json({
        status: 'error',
        message: 'Payout not found',
      });
    }

    res.json({
      status: 'success',
      data: payout,
    });
  } catch (error) {
    console.error('Error fetching payout:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch payout',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Obter estatísticas gerais de afiliados
 * GET /api/admin/affiliates/stats
 */
export const getAffiliateStats = async (req: Request, res: Response) => {
  try {
    // Total de comissões pendentes
    const pendingResult = await prisma.order.aggregate({
      where: {
        affiliateCommissionStatus: 'pending',
        status: 'paid',
      },
      _sum: {
        affiliateCommissionAmount: true,
      },
    });

    // Total de comissões pagas
    const paidResult = await prisma.order.aggregate({
      where: {
        affiliateCommissionStatus: 'paid',
      },
      _sum: {
        affiliateCommissionAmount: true,
      },
    });

    // Total de afiliados ativos
    const activeAffiliates = await prisma.affiliate.count({
      where: { status: 'active' },
    });

    // Top afiliados por comissão acumulada
    const topAffiliates = await prisma.order.groupBy({
      by: ['affiliateId'],
      where: {
        affiliateId: { not: null },
      },
      _sum: {
        affiliateCommissionAmount: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _sum: {
          affiliateCommissionAmount: 'desc',
        },
      },
      take: 5,
    });

    // Buscar informações dos afiliados
    const topAffiliatesWithInfo = await Promise.all(
      topAffiliates.map(async (item) => {
        if (!item.affiliateId) return null;
        
        const affiliate = await prisma.affiliate.findUnique({
          where: { id: item.affiliateId },
        });

        return {
          affiliate,
          totalCommission: Number(item._sum.affiliateCommissionAmount || 0),
          totalOrders: item._count.id,
        };
      })
    );

    res.json({
      status: 'success',
      data: {
        totalPending: Number(pendingResult._sum.affiliateCommissionAmount || 0),
        totalPaid: Number(paidResult._sum.affiliateCommissionAmount || 0),
        activeAffiliates,
        topAffiliates: topAffiliatesWithInfo.filter((item) => item !== null),
      },
    });
  } catch (error) {
    console.error('Error fetching affiliate stats:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch affiliate stats',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
