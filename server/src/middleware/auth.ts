import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key';

export interface AuthRequest extends Request {
  adminId?: string;
  adminEmail?: string;
}

/**
 * Middleware para verificar autenticação JWT
 */
export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Obter token do header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        status: 'error',
        message: 'No authorization token provided',
      });
    }

    // Formato esperado: "Bearer TOKEN"
    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid authorization format',
      });
    }

    const token = parts[1];

    // Verificar token
    const decoded = jwt.verify(token, JWT_SECRET) as {
      adminId: string;
      email: string;
    };

    // Adicionar informações do admin ao request
    req.adminId = decoded.adminId;
    req.adminEmail = decoded.email;

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        status: 'error',
        message: 'Token expired',
      });
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid token',
      });
    }

    return res.status(500).json({
      status: 'error',
      message: 'Authentication error',
    });
  }
};
