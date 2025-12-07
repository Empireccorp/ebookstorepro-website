import { Request, Response } from 'express';
import prisma from '../config/database';

/**
 * Obter estatísticas do dashboard
 * GET /api/admin/dashboard/stats
 */
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    // Total de eBooks ativos
    const totalEbooks = await prisma.ebook.count({
      where: { isActive: true },
    });

    // Total de vendas (pedidos pagos)
    const totalSales = await prisma.order.count({
      where: { status: 'paid' },
    });

    // Vendas dos últimos 7 dias
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentSales = await prisma.order.count({
      where: {
        status: 'paid',
        createdAt: {
          gte: sevenDaysAgo,
        },
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

    // Últimos 10 pedidos
    const recentOrders = await prisma.order.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        ebook: {
          select: {
            title: true,
            slug: true,
          },
        },
      },
    });

    // Alertas (downloads falhados, e-mails não enviados, etc.)
    // Por enquanto, vamos simular
    const alerts = [];

    // Verificar downloads expirados
    const expiredDownloads = await prisma.download.count({
      where: {
        expiresAt: {
          lt: new Date(),
        },
        downloadCount: 0,
      },
    });

    if (expiredDownloads > 0) {
      alerts.push({
        type: 'warning',
        message: `${expiredDownloads} links de download expiraram sem serem utilizados`,
      });
    }

    // Verificar pedidos pendentes há mais de 24h
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const pendingOrders = await prisma.order.count({
      where: {
        status: 'pending',
        createdAt: {
          lt: oneDayAgo,
        },
      },
    });

    if (pendingOrders > 0) {
      alerts.push({
        type: 'warning',
        message: `${pendingOrders} pedidos pendentes há mais de 24 horas`,
      });
    }

    res.json({
      status: 'success',
      data: {
        totalEbooks,
        totalSales,
        recentSales,
        totalRevenue: Number(totalRevenue),
        recentOrders,
        alerts,
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch dashboard stats',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Obter gráfico de vendas por dia (últimos 30 dias)
 * GET /api/admin/dashboard/sales-chart
 */
export const getSalesChart = async (req: Request, res: Response) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const orders = await prisma.order.findMany({
      where: {
        status: 'paid',
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      select: {
        createdAt: true,
        amount: true,
      },
    });

    // Agrupar por dia
    const salesByDay: { [key: string]: { count: number; revenue: number } } = {};

    orders.forEach((order) => {
      const date = order.createdAt.toISOString().split('T')[0];
      if (!salesByDay[date]) {
        salesByDay[date] = { count: 0, revenue: 0 };
      }
      salesByDay[date].count += 1;
      salesByDay[date].revenue += Number(order.amount);
    });

    // Converter para array
    const chartData = Object.entries(salesByDay).map(([date, data]) => ({
      date,
      count: data.count,
      revenue: data.revenue,
    }));

    // Ordenar por data
    chartData.sort((a, b) => a.date.localeCompare(b.date));

    res.json({
      status: 'success',
      data: chartData,
    });
  } catch (error) {
    console.error('Error fetching sales chart:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch sales chart',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
