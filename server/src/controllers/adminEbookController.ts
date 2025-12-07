import { Request, Response } from 'express';
import prisma from '../config/database';
import fs from 'fs';
import path from 'path';

/**
 * Listar todos os ebooks (admin)
 * GET /api/admin/ebooks
 */
export const listEbooks = async (req: Request, res: Response) => {
  try {
    const ebooks = await prisma.ebook.findMany({
      include: {
        category: true,
        _count: {
          select: {
            orders: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({
      status: 'success',
      data: ebooks,
    });
  } catch (error) {
    console.error('Error listing ebooks:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to list ebooks',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Obter um ebook por ID (admin)
 * GET /api/admin/ebooks/:id
 */
export const getEbookById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const ebook = await prisma.ebook.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!ebook) {
      return res.status(404).json({
        status: 'error',
        message: 'Ebook not found',
      });
    }

    res.json({
      status: 'success',
      data: ebook,
    });
  } catch (error) {
    console.error('Error fetching ebook:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch ebook',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Criar novo ebook
 * POST /api/admin/ebooks
 */
export const createEbook = async (req: Request, res: Response) => {
  try {
    const {
      slug,
      title,
      titleEn,
      subtitle,
      categoryId,
      shortDescription,
      longDescription,
      priceDisplay,
      currency,
      stripePriceId,
      language,
      isActive,
      isComingSoon,
      // Campos da página de vendas
      salesHeroTitle,
      salesHeroSubtitle,
      salesShortDescription,
      salesBullet1,
      salesBullet2,
      salesBullet3,
      salesBullet4,
      salesBullet5,
      salesBody,
      ctaLabel,
      heroImageUrl,
      extraImage1Url,
      extraImage2Url,
      extraImage3Url,
      videoUrl,
    } = req.body;

    // Validações básicas
    if (!slug || !title || !shortDescription || !priceDisplay) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields: slug, title, shortDescription, priceDisplay',
      });
    }

    // Verificar se o slug já existe
    const existingEbook = await prisma.ebook.findUnique({
      where: { slug },
    });

    if (existingEbook) {
      return res.status(400).json({
        status: 'error',
        message: 'Slug already exists',
      });
    }

    // Criar ebook
    const ebook = await prisma.ebook.create({
      data: {
        slug,
        title,
        titleEn: titleEn || null,
        subtitle: subtitle || null,
        categoryId: categoryId || null,
        shortDescription,
        longDescription: longDescription || null,
        priceDisplay: parseFloat(priceDisplay),
        currency: currency || 'BRL',
        stripePriceId: stripePriceId || null,
        language: language || 'pt-BR',
        isActive: isActive === 'true' || isActive === true,
        isComingSoon: isComingSoon === 'true' || isComingSoon === true,
        // Campos da página de vendas
        salesHeroTitle: salesHeroTitle || null,
        salesHeroSubtitle: salesHeroSubtitle || null,
        salesShortDescription: salesShortDescription || null,
        salesBullet1: salesBullet1 || null,
        salesBullet2: salesBullet2 || null,
        salesBullet3: salesBullet3 || null,
        salesBullet4: salesBullet4 || null,
        salesBullet5: salesBullet5 || null,
        salesBody: salesBody || null,
        ctaLabel: ctaLabel || null,
        heroImageUrl: heroImageUrl || null,
        extraImage1Url: extraImage1Url || null,
        extraImage2Url: extraImage2Url || null,
        extraImage3Url: extraImage3Url || null,
        videoUrl: videoUrl || null,
      },
    });

    console.log('✅ Ebook created:', ebook.id);

    res.json({
      status: 'success',
      data: ebook,
    });
  } catch (error) {
    console.error('Error creating ebook:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create ebook',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Atualizar ebook
 * PUT /api/admin/ebooks/:id
 */
export const updateEbook = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      slug,
      title,
      titleEn,
      subtitle,
      categoryId,
      shortDescription,
      longDescription,
      priceDisplay,
      currency,
      stripePriceId,
      language,
      isActive,
      isComingSoon,
      // Campos da página de vendas
      salesHeroTitle,
      salesHeroSubtitle,
      salesShortDescription,
      salesBullet1,
      salesBullet2,
      salesBullet3,
      salesBullet4,
      salesBullet5,
      salesBody,
      ctaLabel,
      heroImageUrl,
      extraImage1Url,
      extraImage2Url,
      extraImage3Url,
      videoUrl,
    } = req.body;

    // Verificar se o ebook existe
    const existingEbook = await prisma.ebook.findUnique({
      where: { id },
    });

    if (!existingEbook) {
      return res.status(404).json({
        status: 'error',
        message: 'Ebook not found',
      });
    }

    // Se o slug mudou, verificar se o novo slug já existe
    if (slug && slug !== existingEbook.slug) {
      const slugExists = await prisma.ebook.findUnique({
        where: { slug },
      });

      if (slugExists) {
        return res.status(400).json({
          status: 'error',
          message: 'Slug already exists',
        });
      }
    }

    // Atualizar ebook
    const ebook = await prisma.ebook.update({
      where: { id },
      data: {
        slug: slug || existingEbook.slug,
        title: title || existingEbook.title,
        titleEn: titleEn !== undefined ? titleEn : existingEbook.titleEn,
        subtitle: subtitle !== undefined ? subtitle : existingEbook.subtitle,
        categoryId: categoryId !== undefined ? categoryId : existingEbook.categoryId,
        shortDescription: shortDescription || existingEbook.shortDescription,
        longDescription: longDescription !== undefined ? longDescription : existingEbook.longDescription,
        priceDisplay: priceDisplay ? parseFloat(priceDisplay) : existingEbook.priceDisplay,
        currency: currency || existingEbook.currency,
        stripePriceId: stripePriceId !== undefined ? stripePriceId : existingEbook.stripePriceId,
        language: language || existingEbook.language,
        isActive: isActive !== undefined ? (isActive === 'true' || isActive === true) : existingEbook.isActive,
        isComingSoon: isComingSoon !== undefined ? (isComingSoon === 'true' || isComingSoon === true) : existingEbook.isComingSoon,
        // Campos da página de vendas
        salesHeroTitle: salesHeroTitle !== undefined ? salesHeroTitle : existingEbook.salesHeroTitle,
        salesHeroSubtitle: salesHeroSubtitle !== undefined ? salesHeroSubtitle : existingEbook.salesHeroSubtitle,
        salesShortDescription: salesShortDescription !== undefined ? salesShortDescription : existingEbook.salesShortDescription,
        salesBullet1: salesBullet1 !== undefined ? salesBullet1 : existingEbook.salesBullet1,
        salesBullet2: salesBullet2 !== undefined ? salesBullet2 : existingEbook.salesBullet2,
        salesBullet3: salesBullet3 !== undefined ? salesBullet3 : existingEbook.salesBullet3,
        salesBullet4: salesBullet4 !== undefined ? salesBullet4 : existingEbook.salesBullet4,
        salesBullet5: salesBullet5 !== undefined ? salesBullet5 : existingEbook.salesBullet5,
        salesBody: salesBody !== undefined ? salesBody : existingEbook.salesBody,
        ctaLabel: ctaLabel !== undefined ? ctaLabel : existingEbook.ctaLabel,
        heroImageUrl: heroImageUrl !== undefined ? heroImageUrl : existingEbook.heroImageUrl,
        extraImage1Url: extraImage1Url !== undefined ? extraImage1Url : existingEbook.extraImage1Url,
        extraImage2Url: extraImage2Url !== undefined ? extraImage2Url : existingEbook.extraImage2Url,
        extraImage3Url: extraImage3Url !== undefined ? extraImage3Url : existingEbook.extraImage3Url,
        videoUrl: videoUrl !== undefined ? videoUrl : existingEbook.videoUrl,
      },
    });

    console.log('✅ Ebook updated:', ebook.id);

    res.json({
      status: 'success',
      data: ebook,
    });
  } catch (error) {
    console.error('Error updating ebook:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update ebook',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Deletar ebook
 * DELETE /api/admin/ebooks/:id
 */
export const deleteEbook = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Verificar se o ebook existe
    const ebook = await prisma.ebook.findUnique({
      where: { id },
    });

    if (!ebook) {
      return res.status(404).json({
        status: 'error',
        message: 'Ebook not found',
      });
    }

    // Deletar arquivos associados
    if (ebook.coverUrl) {
      const coverPath = path.join(__dirname, '../../uploads/covers', path.basename(ebook.coverUrl));
      if (fs.existsSync(coverPath)) {
        fs.unlinkSync(coverPath);
      }
    }

    if (ebook.pdfUrl) {
      const pdfPath = path.join(__dirname, '../../uploads/pdfs', path.basename(ebook.pdfUrl));
      if (fs.existsSync(pdfPath)) {
        fs.unlinkSync(pdfPath);
      }
    }

    // Deletar ebook
    await prisma.ebook.delete({
      where: { id },
    });

    console.log('✅ Ebook deleted:', id);

    res.json({
      status: 'success',
      message: 'Ebook deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting ebook:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete ebook',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Upload de capa
 * POST /api/admin/ebooks/:id/upload-cover
 */
export const uploadCover = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        status: 'error',
        message: 'No file uploaded',
      });
    }

    // Verificar se o ebook existe
    const ebook = await prisma.ebook.findUnique({
      where: { id },
    });

    if (!ebook) {
      // Deletar arquivo enviado
      fs.unlinkSync(file.path);
      return res.status(404).json({
        status: 'error',
        message: 'Ebook not found',
      });
    }

    // Deletar capa antiga se existir
    if (ebook.coverUrl) {
      const oldCoverPath = path.join(__dirname, '../../uploads/covers', path.basename(ebook.coverUrl));
      if (fs.existsSync(oldCoverPath)) {
        fs.unlinkSync(oldCoverPath);
      }
    }

    // Construir URL da capa
    const coverUrl = `/uploads/covers/${file.filename}`;

    // Atualizar ebook com nova capa
    const updatedEbook = await prisma.ebook.update({
      where: { id },
      data: { coverUrl },
    });

    console.log('✅ Cover uploaded for ebook:', id);

    res.json({
      status: 'success',
      data: {
        coverUrl: updatedEbook.coverUrl,
      },
    });
  } catch (error) {
    console.error('Error uploading cover:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to upload cover',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Upload de PDF
 * POST /api/admin/ebooks/:id/upload-pdf
 */
export const uploadPdf = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        status: 'error',
        message: 'No file uploaded',
      });
    }

    // Verificar se o ebook existe
    const ebook = await prisma.ebook.findUnique({
      where: { id },
    });

    if (!ebook) {
      // Deletar arquivo enviado
      fs.unlinkSync(file.path);
      return res.status(404).json({
        status: 'error',
        message: 'Ebook not found',
      });
    }

    // Deletar PDF antigo se existir
    if (ebook.pdfUrl) {
      const oldPdfPath = path.join(__dirname, '../../uploads/pdfs', path.basename(ebook.pdfUrl));
      if (fs.existsSync(oldPdfPath)) {
        fs.unlinkSync(oldPdfPath);
      }
    }

    // Construir URL do PDF
    const pdfUrl = `/uploads/pdfs/${file.filename}`;

    // Atualizar ebook com novo PDF
    const updatedEbook = await prisma.ebook.update({
      where: { id },
      data: { pdfUrl },
    });

    console.log('✅ PDF uploaded for ebook:', id);

    res.json({
      status: 'success',
      data: {
        pdfUrl: updatedEbook.pdfUrl,
      },
    });
  } catch (error) {
    console.error('Error uploading PDF:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to upload PDF',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
