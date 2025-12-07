import { Request, Response } from 'express';
import prisma from '../config/database';

/**
 * Listar todos os afiliados
 * GET /api/admin/affiliates
 */
export const listAffiliates = async (req: Request, res: Response) => {
  try {
    const affiliates = await prisma.affiliate.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calcular totais de comissão para cada afiliado
    const affiliatesWithStats = await Promise.all(
      affiliates.map(async (affiliate) => {
        // Total pendente
        const pendingResult = await prisma.order.aggregate({
          where: {
            affiliateId: affiliate.id,
            affiliateCommissionStatus: 'pending',
          },
          _sum: {
            affiliateCommissionAmount: true,
          },
        });

        // Total pago
        const paidResult = await prisma.order.aggregate({
          where: {
            affiliateId: affiliate.id,
            affiliateCommissionStatus: 'paid',
          },
          _sum: {
            affiliateCommissionAmount: true,
          },
        });

        return {
          ...affiliate,
          totalPending: Number(pendingResult._sum.affiliateCommissionAmount || 0),
          totalPaid: Number(paidResult._sum.affiliateCommissionAmount || 0),
        };
      })
    );

    res.json({
      status: 'success',
      data: affiliatesWithStats,
    });
  } catch (error) {
    console.error('Error listing affiliates:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to list affiliates',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Obter detalhes de um afiliado
 * GET /api/admin/affiliates/:id
 */
export const getAffiliateById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const affiliate = await prisma.affiliate.findUnique({
      where: { id },
    });

    if (!affiliate) {
      return res.status(404).json({
        status: 'error',
        message: 'Affiliate not found',
      });
    }

    // Buscar orders relacionadas
    const orders = await prisma.order.findMany({
      where: {
        affiliateId: id,
      },
      include: {
        ebook: {
          select: {
            id: true,
            slug: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Buscar payouts
    const payouts = await prisma.affiliatePayout.findMany({
      where: {
        affiliateId: id,
      },
      orderBy: {
        paidAt: 'desc',
      },
    });

    // Calcular totais
    const totalPending = orders
      .filter((o) => o.affiliateCommissionStatus === 'pending')
      .reduce((sum, o) => sum + Number(o.affiliateCommissionAmount || 0), 0);

    const totalPaid = orders
      .filter((o) => o.affiliateCommissionStatus === 'paid')
      .reduce((sum, o) => sum + Number(o.affiliateCommissionAmount || 0), 0);

    res.json({
      status: 'success',
      data: {
        affiliate,
        orders,
        payouts,
        stats: {
          totalPending,
          totalPaid,
          totalOrders: orders.length,
          pendingOrders: orders.filter((o) => o.affiliateCommissionStatus === 'pending').length,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching affiliate:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch affiliate',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Criar afiliado
 * POST /api/admin/affiliates
 */
export const createAffiliate = async (req: Request, res: Response) => {
  try {
    const { name, email, code, commissionPercent, status } = req.body;

    if (!name || !email || !code || commissionPercent === undefined) {
      return res.status(400).json({
        status: 'error',
        message: 'Name, email, code, and commissionPercent are required',
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

    // Verificar se o código já existe
    const existingCode = await prisma.affiliate.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (existingCode) {
      return res.status(400).json({
        status: 'error',
        message: 'Affiliate code already exists',
      });
    }

    // Verificar se o email já existe
    const existingEmail = await prisma.affiliate.findUnique({
      where: { email },
    });

    if (existingEmail) {
      return res.status(400).json({
        status: 'error',
        message: 'Email already exists',
      });
    }

    // Criar afiliado
    const affiliate = await prisma.affiliate.create({
      data: {
        name,
        email,
        code: code.toUpperCase(),
        commissionPercent: parseFloat(commissionPercent),
        status: status || 'active',
      },
    });

    console.log('✅ Affiliate created:', affiliate.id);

    res.json({
      status: 'success',
      data: affiliate,
    });
  } catch (error) {
    console.error('Error creating affiliate:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create affiliate',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Atualizar afiliado
 * PUT /api/admin/affiliates/:id
 */
export const updateAffiliate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, code, commissionPercent, status } = req.body;

    // Verificar se o afiliado existe
    const existingAffiliate = await prisma.affiliate.findUnique({
      where: { id },
    });

    if (!existingAffiliate) {
      return res.status(404).json({
        status: 'error',
        message: 'Affiliate not found',
      });
    }

    // Se o código mudou, verificar se o novo código já existe
    if (code && code.toUpperCase() !== existingAffiliate.code) {
      const codeExists = await prisma.affiliate.findUnique({
        where: { code: code.toUpperCase() },
      });

      if (codeExists) {
        return res.status(400).json({
          status: 'error',
          message: 'Affiliate code already exists',
        });
      }
    }

    // Se o email mudou, verificar se o novo email já existe
    if (email && email !== existingAffiliate.email) {
      const emailExists = await prisma.affiliate.findUnique({
        where: { email },
      });

      if (emailExists) {
        return res.status(400).json({
          status: 'error',
          message: 'Email already exists',
        });
      }
    }

    // Atualizar afiliado
    const affiliate = await prisma.affiliate.update({
      where: { id },
      data: {
        name: name || existingAffiliate.name,
        email: email || existingAffiliate.email,
        code: code ? code.toUpperCase() : existingAffiliate.code,
        commissionPercent: commissionPercent !== undefined ? parseFloat(commissionPercent) : existingAffiliate.commissionPercent,
        status: status || existingAffiliate.status,
      },
    });

    console.log('✅ Affiliate updated:', affiliate.id);

    res.json({
      status: 'success',
      data: affiliate,
    });
  } catch (error) {
    console.error('Error updating affiliate:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update affiliate',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Deletar afiliado
 * DELETE /api/admin/affiliates/:id
 */
export const deleteAffiliate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Verificar se o afiliado existe
    const affiliate = await prisma.affiliate.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            orders: true,
          },
        },
      },
    });

    if (!affiliate) {
      return res.status(404).json({
        status: 'error',
        message: 'Affiliate not found',
      });
    }

    // Verificar se há orders associadas
    if (affiliate._count.orders > 0) {
      return res.status(400).json({
        status: 'error',
        message: `Cannot delete affiliate with ${affiliate._count.orders} associated order(s). Consider deactivating instead.`,
      });
    }

    // Deletar afiliado
    await prisma.affiliate.delete({
      where: { id },
    });

    console.log('✅ Affiliate deleted:', id);

    res.json({
      status: 'success',
      message: 'Affiliate deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting affiliate:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete affiliate',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
