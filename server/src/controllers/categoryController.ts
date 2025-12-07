import { Request, Response } from 'express';
import prisma from '../config/database';

/**
 * Listar todas as categorias (público)
 * GET /api/categories
 */
export const listCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: {
            ebooks: {
              where: { isActive: true },
            },
          },
        },
      },
    });

    res.json({
      status: 'success',
      data: categories,
    });
  } catch (error) {
    console.error('Error listing categories:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to list categories',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Listar todas as categorias (admin - inclui inativas)
 * GET /api/admin/categories
 */
export const listAllCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: {
            ebooks: true,
          },
        },
      },
    });

    res.json({
      status: 'success',
      data: categories,
    });
  } catch (error) {
    console.error('Error listing categories:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to list categories',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Obter categoria por ID
 * GET /api/admin/categories/:id
 */
export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        ebooks: {
          select: {
            id: true,
            slug: true,
            title: true,
            coverUrl: true,
            isActive: true,
          },
        },
      },
    });

    if (!category) {
      return res.status(404).json({
        status: 'error',
        message: 'Category not found',
      });
    }

    res.json({
      status: 'success',
      data: category,
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch category',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Criar categoria
 * POST /api/admin/categories
 */
export const createCategory = async (req: Request, res: Response) => {
  try {
    const { slug, name, description, order, isActive } = req.body;

    if (!slug || !name) {
      return res.status(400).json({
        status: 'error',
        message: 'Slug and name are required',
      });
    }

    // Verificar se o slug já existe
    const existingCategory = await prisma.category.findUnique({
      where: { slug },
    });

    if (existingCategory) {
      return res.status(400).json({
        status: 'error',
        message: 'Slug already exists',
      });
    }

    // Criar categoria
    const category = await prisma.category.create({
      data: {
        slug,
        name,
        description: description || null,
        order: order ? parseInt(order) : 0,
        isActive: isActive === 'true' || isActive === true || isActive === undefined,
      },
    });

    console.log('✅ Category created:', category.id);

    res.json({
      status: 'success',
      data: category,
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create category',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Atualizar categoria
 * PUT /api/admin/categories/:id
 */
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { slug, name, description, order, isActive } = req.body;

    // Verificar se a categoria existe
    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return res.status(404).json({
        status: 'error',
        message: 'Category not found',
      });
    }

    // Se o slug mudou, verificar se o novo slug já existe
    if (slug && slug !== existingCategory.slug) {
      const slugExists = await prisma.category.findUnique({
        where: { slug },
      });

      if (slugExists) {
        return res.status(400).json({
          status: 'error',
          message: 'Slug already exists',
        });
      }
    }

    // Atualizar categoria
    const category = await prisma.category.update({
      where: { id },
      data: {
        slug: slug || existingCategory.slug,
        name: name || existingCategory.name,
        description: description !== undefined ? description : existingCategory.description,
        order: order !== undefined ? parseInt(order) : existingCategory.order,
        isActive: isActive !== undefined ? (isActive === 'true' || isActive === true) : existingCategory.isActive,
      },
    });

    console.log('✅ Category updated:', category.id);

    res.json({
      status: 'success',
      data: category,
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update category',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Deletar categoria
 * DELETE /api/admin/categories/:id
 */
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Verificar se a categoria existe
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            ebooks: true,
          },
        },
      },
    });

    if (!category) {
      return res.status(404).json({
        status: 'error',
        message: 'Category not found',
      });
    }

    // Verificar se há ebooks associados
    if (category._count.ebooks > 0) {
      return res.status(400).json({
        status: 'error',
        message: `Cannot delete category with ${category._count.ebooks} associated ebook(s)`,
      });
    }

    // Deletar categoria
    await prisma.category.delete({
      where: { id },
    });

    console.log('✅ Category deleted:', id);

    res.json({
      status: 'success',
      message: 'Category deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete category',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
