import { Request, Response } from 'express';
import crypto from 'crypto';
import prisma from '../config/database';

/**
 * Gera um link temporário de download para um pedido
 * POST /api/downloads/generate
 */
export const generateDownloadLink = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        status: 'error',
        message: 'Order ID is required',
      });
    }

    // Buscar pedido com informações do ebook
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        ebook: true,
      },
    });

    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found',
      });
    }

    // Validar se o pedido está pago
    if (order.status !== 'paid') {
      return res.status(400).json({
        status: 'error',
        message: 'Order is not paid yet',
      });
    }

    // Verificar se já existe um link de download ativo para este pedido
    const existingDownload = await prisma.download.findFirst({
      where: {
        orderId: orderId,
        expiresAt: {
          gt: new Date(), // Ainda não expirou
        },
      },
    });

    // Se já existe um link ativo, retornar ele
    if (existingDownload) {
      return res.json({
        status: 'success',
        data: {
          downloadToken: existingDownload.downloadToken,
          downloadUrl: `/api/downloads/${existingDownload.downloadToken}`,
          expiresAt: existingDownload.expiresAt,
          downloadCount: existingDownload.downloadCount,
          maxDownloads: existingDownload.maxDownloads,
          remainingDownloads: existingDownload.maxDownloads - existingDownload.downloadCount,
        },
      });
    }

    // Gerar token único
    const downloadToken = crypto.randomBytes(32).toString('hex');

    // Calcular data de expiração (24 horas a partir de agora)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Criar registro de download
    const download = await prisma.download.create({
      data: {
        orderId: orderId,
        ebookId: order.ebookId,
        downloadToken: downloadToken,
        expiresAt: expiresAt,
        downloadCount: 0,
        maxDownloads: 3,
      },
    });

    console.log('✅ Download link generated:', {
      orderId: order.id,
      ebookTitle: order.ebook.title,
      token: downloadToken,
      expiresAt: expiresAt,
    });

    res.json({
      status: 'success',
      data: {
        downloadToken: download.downloadToken,
        downloadUrl: `/api/downloads/${download.downloadToken}`,
        expiresAt: download.expiresAt,
        downloadCount: download.downloadCount,
        maxDownloads: download.maxDownloads,
        remainingDownloads: download.maxDownloads - download.downloadCount,
      },
    });
  } catch (error) {
    console.error('Error generating download link:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate download link',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Realiza o download do ebook usando o token
 * GET /api/downloads/:token
 */
export const downloadEbook = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        status: 'error',
        message: 'Download token is required',
      });
    }

    // Buscar registro de download
    const download = await prisma.download.findUnique({
      where: { downloadToken: token },
      include: {
        order: true,
        ebook: true,
      },
    });

    if (!download) {
      console.warn('⚠️  Invalid download token attempt:', {
        token: token.substring(0, 10) + '...',
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      });
      return res.status(404).json({
        status: 'error',
        message: 'Download link not found or expired',
      });
    }

    // Verificar se o link expirou
    if (new Date() > download.expiresAt) {
      console.warn('⚠️  Expired download link accessed:', {
        token: token.substring(0, 10) + '...',
        expiresAt: download.expiresAt,
        ip: req.ip,
      });
      return res.status(410).json({
        status: 'error',
        message: 'Download link has expired',
        expiresAt: download.expiresAt,
      });
    }

    // Verificar se atingiu o limite de downloads
    if (download.downloadCount >= download.maxDownloads) {
      console.warn('⚠️  Download limit exceeded:', {
        token: token.substring(0, 10) + '...',
        downloadCount: download.downloadCount,
        maxDownloads: download.maxDownloads,
        ip: req.ip,
      });
      return res.status(403).json({
        status: 'error',
        message: 'Download limit reached',
        downloadCount: download.downloadCount,
        maxDownloads: download.maxDownloads,
      });
    }

    // Verificar se o ebook tem PDF configurado
    if (!download.ebook.pdfUrl) {
      return res.status(404).json({
        status: 'error',
        message: 'PDF file not configured for this ebook',
      });
    }

    // Incrementar contador de downloads
    await prisma.download.update({
      where: { id: download.id },
      data: {
        downloadCount: download.downloadCount + 1,
      },
    });

    console.log('📥 Download executed:', {
      token: token,
      ebookTitle: download.ebook.title,
      downloadCount: download.downloadCount + 1,
      maxDownloads: download.maxDownloads,
    });

    // TODO: Em produção, você deve servir o arquivo do S3, Google Cloud Storage, etc.
    // Por enquanto, vamos redirecionar para o pdfUrl (que pode ser uma URL pública temporária)
    
    // Opção 1: Redirecionar para URL do PDF
    res.redirect(download.ebook.pdfUrl);

    // Opção 2: Servir arquivo diretamente (se estiver no servidor)
    // const filePath = path.join(__dirname, '../../uploads', download.ebook.pdfUrl);
    // res.download(filePath, `${download.ebook.slug}.pdf`);

    // Opção 3: Retornar URL assinada (S3, GCS)
    // const signedUrl = await generateSignedUrl(download.ebook.pdfUrl);
    // res.redirect(signedUrl);
  } catch (error) {
    console.error('Error downloading ebook:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to download ebook',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
