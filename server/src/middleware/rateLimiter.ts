import rateLimit from 'express-rate-limit';

/**
 * Rate limiter para login do admin
 * Máximo 5 tentativas por 15 minutos por IP
 */
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Máximo 5 tentativas
  message: {
    status: 'error',
    message: 'Too many login attempts. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Usar IP do cliente
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress || 'unknown';
  },
  // Handler customizado
  handler: (req, res) => {
    console.warn(`⚠️  Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      status: 'error',
      message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
      retryAfter: '15 minutes',
    });
  },
});

/**
 * Rate limiter para download de ebooks
 * Máximo 10 tentativas por minuto por IP
 */
export const downloadRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 10, // Máximo 10 tentativas
  message: {
    status: 'error',
    message: 'Too many download attempts. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress || 'unknown';
  },
  handler: (req, res) => {
    console.warn(`⚠️  Download rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      status: 'error',
      message: 'Muitas tentativas de download. Aguarde um momento e tente novamente.',
      retryAfter: '1 minute',
    });
  },
});

/**
 * Rate limiter geral para API
 * Máximo 100 requisições por 15 minutos por IP
 */
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Máximo 100 requisições
  message: {
    status: 'error',
    message: 'Too many requests. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Não aplicar rate limit em healthcheck
    return req.path === '/health';
  },
});
