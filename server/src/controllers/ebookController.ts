import { Request, Response } from 'express';
import prisma from '../config/database';

/**
 * Lista todos os ebooks ativos
 * GET /api/ebooks
 */
export const getAllEbooks = async (req: Request, res: Response) => {
  try {
    const ebooks = await prisma.ebook.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        slug: true,
        title: true,
        subtitle: true,
        category: true,
        shortDescription: true,
        salesShortDescription: true,
        priceDisplay: true,
        currency: true,
        coverUrl: true,
        heroImageUrl: true,
        createdAt: true,
      },
    });

    res.json({
      status: 'success',
      data: ebooks,
    });
  } catch (error) {
    console.error('Error fetching ebooks:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch ebooks',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Busca um ebook específico pelo slug
 * GET /api/ebooks/:slug
 */
export const getEbookBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const ebook = await prisma.ebook.findUnique({
      where: {
        slug,
        isActive: true,
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
 * Cria um novo ebook
 * POST /api/ebooks
 */
export const createEbook = async (req: Request, res: Response) => {
  try {
    const {
      slug,
      title,
      subtitle,
      category,
      shortDescription,
      longDescription,
      priceDisplay,
      currency,
      stripePriceId,
      coverUrl,
      pdfUrl,
      language,
      isActive,
    } = req.body;

    // Validação básica
    if (!slug || !title || !category || !shortDescription || !longDescription || !priceDisplay) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields',
      });
    }

    // Verificar se slug já existe
    const existingEbook = await prisma.ebook.findUnique({
      where: { slug },
    });

    if (existingEbook) {
      return res.status(409).json({
        status: 'error',
        message: 'Ebook with this slug already exists',
      });
    }

    const ebook = await prisma.ebook.create({
      data: {
        slug,
        title,
        subtitle,
        category,
        shortDescription,
        longDescription,
        priceDisplay,
        currency: currency || 'BRL',
        stripePriceId,
        coverUrl,
        pdfUrl,
        language: language || 'pt-BR',
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    res.status(201).json({
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
 * Atualiza um ebook existente
 * PUT /api/ebooks/:id
 */
export const updateEbook = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const ebook = await prisma.ebook.update({
      where: { id },
      data: updateData,
    });

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
 * Deleta (desativa) um ebook
 * DELETE /api/ebooks/:id
 */
export const deleteEbook = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Soft delete - apenas desativa
    const ebook = await prisma.ebook.update({
      where: { id },
      data: { isActive: false },
    });

    res.json({
      status: 'success',
      message: 'Ebook deactivated successfully',
      data: ebook,
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
