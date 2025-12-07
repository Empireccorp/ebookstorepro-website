import { z } from 'zod';

/**
 * Schema de validação para criação de ebook
 */
export const createEbookSchema = z.object({
  slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hífens'),
  title: z.string().min(1).max(500),
  titleEn: z.string().max(500).optional(),
  subtitle: z.string().max(500).optional(),
  categoryId: z.string().uuid().optional(),
  shortDescription: z.string().min(1).max(1000),
  longDescription: z.string().max(10000).optional(),
  priceDisplay: z.number().positive().max(999999),
  currency: z.string().length(3).default('BRL'),
  stripePriceId: z.string().max(255).optional(),
  coverUrl: z.string().url().max(1000).optional(),
  pdfUrl: z.string().url().max(1000).optional(),
  language: z.string().max(10).default('pt-BR'),
  isActive: z.boolean().default(true),
  isComingSoon: z.boolean().default(false),
});

/**
 * Schema de validação para atualização de ebook
 */
export const updateEbookSchema = createEbookSchema.partial();

/**
 * Schema de validação para criação de afiliado
 */
export const createAffiliateSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email().max(255),
  code: z.string().min(3).max(50).regex(/^[A-Z0-9]+$/, 'Código deve conter apenas letras maiúsculas e números'),
  commissionPercent: z.number().min(0).max(100),
  status: z.enum(['active', 'inactive']).default('active'),
});

/**
 * Schema de validação para atualização de afiliado
 */
export const updateAffiliateSchema = createAffiliateSchema.partial();

/**
 * Schema de validação para criação de categoria
 */
export const createCategorySchema = z.object({
  slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hífens'),
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  order: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

/**
 * Schema de validação para atualização de categoria
 */
export const updateCategorySchema = createCategorySchema.partial();

/**
 * Schema de validação para login
 */
export const loginSchema = z.object({
  email: z.string().email('E-mail inválido').max(255),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres').max(255),
});

/**
 * Schema de validação para setup de admin
 */
export const setupAdminSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email('E-mail inválido').max(255),
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres').max(255),
});

/**
 * Schema de validação para criação de checkout
 */
export const createCheckoutSchema = z.object({
  email: z.string().email('E-mail inválido').max(255),
  ebookSlug: z.string().min(1).max(255),
  affiliateCode: z.string().max(50).optional(),
});

/**
 * Schema de validação para geração de download
 */
export const generateDownloadSchema = z.object({
  orderId: z.string().uuid('ID do pedido inválido'),
});

/**
 * Schema de validação para pagamento de comissões
 */
export const payCommissionsSchema = z.object({
  notes: z.string().max(1000).optional(),
});

/**
 * Schema de validação para reenvio de e-mail
 */
export const resendEmailSchema = z.object({
  sessionId: z.string().min(1).max(500),
});
