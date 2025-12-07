import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

/**
 * Middleware para validar dados usando Zod schema
 */
export const validate = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validar body da requisição
      const validated = await schema.parseAsync(req.body);
      
      // Substituir body com dados validados
      req.body = validated;
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors,
        });
      }

      return res.status(500).json({
        status: 'error',
        message: 'Validation error',
      });
    }
  };
};

/**
 * Sanitizar string removendo tags HTML e caracteres perigosos
 */
export const sanitizeString = (str: string): string => {
  if (!str) return str;
  
  // Remover tags HTML
  let sanitized = str.replace(/<[^>]*>/g, '');
  
  // Remover caracteres de controle
  sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');
  
  // Trim
  sanitized = sanitized.trim();
  
  return sanitized;
};

/**
 * Sanitizar objeto recursivamente
 */
export const sanitizeObject = (obj: any): any => {
  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  
  if (obj !== null && typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }
  
  return obj;
};

/**
 * Middleware para sanitizar body da requisição
 */
export const sanitize = (req: Request, res: Response, next: NextFunction) => {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  next();
};
