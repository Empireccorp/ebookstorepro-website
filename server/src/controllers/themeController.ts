import { Request, Response } from 'express';
import prisma from '../config/database';

// Get theme configuration (public)
export const getTheme = async (req: Request, res: Response) => {
  try {
    let theme = await prisma.themeConfig.findFirst();
    
    // Se não existir, criar com valores padrão
    if (!theme) {
      theme = await prisma.themeConfig.create({
        data: {},
      });
    }

    res.json({
      status: 'success',
      data: theme,
    });
  } catch (error) {
    console.error('Error getting theme:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get theme configuration',
    });
  }
};

// Update theme configuration (admin only)
export const updateTheme = async (req: Request, res: Response) => {
  try {
    const {
      primaryColor,
      secondaryColor,
      accentColor,
      backgroundColor,
      textColor,
      fontFamily,
      borderRadiusStyle,
    } = req.body;

    // Buscar tema existente
    let theme = await prisma.themeConfig.findFirst();

    if (!theme) {
      // Criar novo tema
      theme = await prisma.themeConfig.create({
        data: {
          primaryColor,
          secondaryColor,
          accentColor,
          backgroundColor,
          textColor,
          fontFamily,
          borderRadiusStyle,
        },
      });
    } else {
      // Atualizar tema existente
      theme = await prisma.themeConfig.update({
        where: { id: theme.id },
        data: {
          ...(primaryColor && { primaryColor }),
          ...(secondaryColor && { secondaryColor }),
          ...(accentColor && { accentColor }),
          ...(backgroundColor && { backgroundColor }),
          ...(textColor && { textColor }),
          ...(fontFamily && { fontFamily }),
          ...(borderRadiusStyle && { borderRadiusStyle }),
        },
      });
    }

    res.json({
      status: 'success',
      data: theme,
      message: 'Theme updated successfully',
    });
  } catch (error) {
    console.error('Error updating theme:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update theme configuration',
    });
  }
};

// Reset theme to defaults (admin only)
export const resetTheme = async (req: Request, res: Response) => {
  try {
    const theme = await prisma.themeConfig.findFirst();

    if (theme) {
      await prisma.themeConfig.update({
        where: { id: theme.id },
        data: {
          primaryColor: '#3B82F6',
          secondaryColor: '#8B5CF6',
          accentColor: '#10B981',
          backgroundColor: '#F9FAFB',
          textColor: '#111827',
          fontFamily: 'moderna',
          borderRadiusStyle: 'suave',
        },
      });
    }

    res.json({
      status: 'success',
      message: 'Theme reset to defaults',
    });
  } catch (error) {
    console.error('Error resetting theme:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to reset theme',
    });
  }
};
