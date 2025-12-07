import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '2h'; // Token expira em 2 horas

/**
 * Login de admin
 * POST /api/admin/auth/login
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Email and password are required',
      });
    }

    // Buscar admin por email
    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (!admin) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials',
      });
    }

    // Verificar senha
    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials',
      });
    }

    // Gerar token JWT
    const token = jwt.sign(
      {
        adminId: admin.id,
        email: admin.email,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    console.log('✅ Admin logged in:', admin.email);

    res.json({
      status: 'success',
      data: {
        token,
        admin: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
        },
      },
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({
      status: 'error',
      message: 'Login failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Criar primeiro admin (apenas para setup inicial)
 * POST /api/admin/auth/setup
 */
export const setupAdmin = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        status: 'error',
        message: 'Email, password and name are required',
      });
    }

    // Verificar se já existe algum admin
    const existingAdmins = await prisma.admin.count();

    if (existingAdmins > 0) {
      return res.status(403).json({
        status: 'error',
        message: 'Admin already exists. Use login instead.',
      });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar admin
    const admin = await prisma.admin.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    console.log('✅ First admin created:', admin.email);

    res.json({
      status: 'success',
      message: 'Admin created successfully',
      data: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
      },
    });
  } catch (error) {
    console.error('Error creating admin:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create admin',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Verificar token atual
 * GET /api/admin/auth/me
 */
export const getCurrentAdmin = async (req: any, res: Response) => {
  try {
    const adminId = req.adminId;

    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    if (!admin) {
      return res.status(404).json({
        status: 'error',
        message: 'Admin not found',
      });
    }

    res.json({
      status: 'success',
      data: admin,
    });
  } catch (error) {
    console.error('Error fetching current admin:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch admin data',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
