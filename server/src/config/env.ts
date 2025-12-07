/**
 * Configuração centralizada de variáveis de ambiente
 */

// Ambiente
export const APP_ENV = process.env.APP_ENV || 'test'; // 'test' | 'production'
export const IS_PRODUCTION = APP_ENV === 'production';
export const IS_TEST = APP_ENV === 'test';

// Server
export const PORT = process.env.PORT || 3001;
export const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Database
export const DATABASE_URL = process.env.DATABASE_URL || '';
export const DATABASE_DIRECT_URL = process.env.DATABASE_DIRECT_URL || '';

// JWT
export const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key_CHANGE_IN_PRODUCTION';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '2h';

// Stripe
export const STRIPE_SECRET_KEY = IS_PRODUCTION
  ? process.env.STRIPE_SECRET_KEY_LIVE
  : process.env.STRIPE_SECRET_KEY_TEST || process.env.STRIPE_SECRET_KEY;

export const STRIPE_WEBHOOK_SECRET = IS_PRODUCTION
  ? process.env.STRIPE_WEBHOOK_SECRET_LIVE
  : process.env.STRIPE_WEBHOOK_SECRET_TEST || process.env.STRIPE_WEBHOOK_SECRET;

// SendGrid
export const SENDGRID_API_KEY = IS_PRODUCTION
  ? process.env.SENDGRID_API_KEY_LIVE
  : process.env.SENDGRID_API_KEY_TEST || process.env.SENDGRID_API_KEY;

export const EMAIL_FROM = process.env.EMAIL_FROM || 'no-reply@ebookstorepro.com';
export const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || 'contato@ebookstorepro.com';

// CORS
export const ALLOWED_ORIGINS = IS_PRODUCTION
  ? [
      'https://ebookstorepro.com',
      'https://www.ebookstorepro.com',
    ]
  : [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
    ];

/**
 * Validar variáveis de ambiente obrigatórias
 */
export const validateEnv = () => {
  const required = [
    'DATABASE_URL',
    'DATABASE_DIRECT_URL',
    'JWT_SECRET',
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing.join(', '));
    process.exit(1);
  }

  // Avisos para variáveis recomendadas
  if (!process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY_TEST) {
    console.warn('⚠️  STRIPE_SECRET_KEY not configured');
  }

  if (!process.env.SENDGRID_API_KEY && !process.env.SENDGRID_API_KEY_TEST) {
    console.warn('⚠️  SENDGRID_API_KEY not configured');
  }

  console.log('✅ Environment variables validated');
  console.log(`📍 Running in ${APP_ENV.toUpperCase()} mode`);
};
