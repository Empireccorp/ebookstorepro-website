import { Request, Response } from 'express';
import prisma from '../config/database';
import fs from 'fs';
import path from 'path';

/**
 * Obter todas as configurações
 * GET /api/admin/config
 */
export const getAllConfigs = async (req: Request, res: Response) => {
  try {
    const configs = await prisma.systemConfig.findMany({
      orderBy: {
        key: 'asc',
      },
    });

    // Também retornar variáveis de ambiente
    const envVars = {
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',
      SENDGRID_API_KEY: process.env.SENDGRID_API_KEY || '',
      EMAIL_FROM: process.env.EMAIL_FROM || '',
      SUPPORT_EMAIL: process.env.SUPPORT_EMAIL || '',
      FRONTEND_URL: process.env.FRONTEND_URL || '',
      DATABASE_URL: process.env.DATABASE_URL ? '***HIDDEN***' : '',
    };

    res.json({
      status: 'success',
      data: {
        configs,
        envVars,
      },
    });
  } catch (error) {
    console.error('Error fetching configs:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch configs',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Obter configuração por chave
 * GET /api/admin/config/:key
 */
export const getConfigByKey = async (req: Request, res: Response) => {
  try {
    const { key } = req.params;

    const config = await prisma.systemConfig.findUnique({
      where: { key },
    });

    if (!config) {
      return res.status(404).json({
        status: 'error',
        message: 'Config not found',
      });
    }

    res.json({
      status: 'success',
      data: config,
    });
  } catch (error) {
    console.error('Error fetching config:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch config',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Criar ou atualizar configuração
 * POST /api/admin/config
 */
export const upsertConfig = async (req: Request, res: Response) => {
  try {
    const { key, value, description } = req.body;

    if (!key || value === undefined) {
      return res.status(400).json({
        status: 'error',
        message: 'Key and value are required',
      });
    }

    const config = await prisma.systemConfig.upsert({
      where: { key },
      update: {
        value,
        description: description || null,
      },
      create: {
        key,
        value,
        description: description || null,
      },
    });

    console.log('✅ Config upserted:', key);

    res.json({
      status: 'success',
      data: config,
    });
  } catch (error) {
    console.error('Error upserting config:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to upsert config',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Atualizar variável de ambiente no arquivo .env
 * PUT /api/admin/config/env/:key
 */
export const updateEnvVar = async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    if (value === undefined) {
      return res.status(400).json({
        status: 'error',
        message: 'Value is required',
      });
    }

    // Lista de variáveis permitidas
    const allowedKeys = [
      'STRIPE_SECRET_KEY',
      'STRIPE_WEBHOOK_SECRET',
      'SENDGRID_API_KEY',
      'EMAIL_FROM',
      'SUPPORT_EMAIL',
      'FRONTEND_URL',
    ];

    if (!allowedKeys.includes(key)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid environment variable key',
      });
    }

    // Ler arquivo .env
    const envPath = path.join(__dirname, '../../.env');
    let envContent = '';

    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf-8');
    }

    // Atualizar ou adicionar variável
    const regex = new RegExp(`^${key}=.*$`, 'm');
    const newLine = `${key}=${value}`;

    if (regex.test(envContent)) {
      // Atualizar existente
      envContent = envContent.replace(regex, newLine);
    } else {
      // Adicionar nova
      envContent += `\n${newLine}`;
    }

    // Escrever de volta
    fs.writeFileSync(envPath, envContent);

    // Atualizar process.env (apenas para a sessão atual)
    process.env[key] = value;

    console.log('✅ Environment variable updated:', key);

    res.json({
      status: 'success',
      message: 'Environment variable updated. Restart server to apply changes.',
      data: {
        key,
        value: key.includes('SECRET') || key.includes('KEY') ? '***HIDDEN***' : value,
      },
    });
  } catch (error) {
    console.error('Error updating env var:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update environment variable',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Deletar configuração
 * DELETE /api/admin/config/:key
 */
export const deleteConfig = async (req: Request, res: Response) => {
  try {
    const { key } = req.params;

    const config = await prisma.systemConfig.findUnique({
      where: { key },
    });

    if (!config) {
      return res.status(404).json({
        status: 'error',
        message: 'Config not found',
      });
    }

    await prisma.systemConfig.delete({
      where: { key },
    });

    console.log('✅ Config deleted:', key);

    res.json({
      status: 'success',
      message: 'Config deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting config:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete config',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
