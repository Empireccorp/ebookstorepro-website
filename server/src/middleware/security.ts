import helmet from 'helmet';
import { Express } from 'express';

/**
 * Configura middlewares de segurança usando Helmet
 */
export const setupSecurityMiddlewares = (app: Express) => {
  // Helmet - Security headers
  app.use(helmet({
    contentSecurityPolicy: false, // Desabilitar CSP para não interferir com Stripe
    crossOriginEmbedderPolicy: false,
  }));

  // Remover header X-Powered-By
  app.disable('x-powered-by');
};
