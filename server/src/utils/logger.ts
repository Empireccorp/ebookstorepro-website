/**
 * Sistema de logs estruturado
 */

export enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS',
  SECURITY = 'SECURITY',
}

export enum LogCategory {
  AUTH = 'AUTH',
  PAYMENT = 'PAYMENT',
  WEBHOOK = 'WEBHOOK',
  EMAIL = 'EMAIL',
  DOWNLOAD = 'DOWNLOAD',
  AFFILIATE = 'AFFILIATE',
  ADMIN = 'ADMIN',
  API = 'API',
}

interface LogData {
  level: LogLevel;
  category: LogCategory;
  message: string;
  data?: any;
  error?: Error;
}

/**
 * Formatar timestamp
 */
const getTimestamp = (): string => {
  return new Date().toISOString();
};

/**
 * Obter emoji por nível
 */
const getLevelEmoji = (level: LogLevel): string => {
  switch (level) {
    case LogLevel.INFO:
      return 'ℹ️';
    case LogLevel.WARN:
      return '⚠️';
    case LogLevel.ERROR:
      return '❌';
    case LogLevel.SUCCESS:
      return '✅';
    case LogLevel.SECURITY:
      return '🔒';
    default:
      return '📝';
  }
};

/**
 * Log estruturado
 */
export const log = ({ level, category, message, data, error }: LogData) => {
  const timestamp = getTimestamp();
  const emoji = getLevelEmoji(level);
  
  const logMessage = `${emoji} [${timestamp}] [${level}] [${category}] ${message}`;
  
  if (level === LogLevel.ERROR) {
    console.error(logMessage);
    if (error) {
      console.error('Error details:', error);
    }
    if (data) {
      console.error('Additional data:', JSON.stringify(data, null, 2));
    }
  } else if (level === LogLevel.WARN || level === LogLevel.SECURITY) {
    console.warn(logMessage);
    if (data) {
      console.warn('Data:', JSON.stringify(data, null, 2));
    }
  } else {
    console.log(logMessage);
    if (data) {
      console.log('Data:', JSON.stringify(data, null, 2));
    }
  }
};

/**
 * Helpers para logs específicos
 */
export const logger = {
  info: (category: LogCategory, message: string, data?: any) => {
    log({ level: LogLevel.INFO, category, message, data });
  },
  
  warn: (category: LogCategory, message: string, data?: any) => {
    log({ level: LogLevel.WARN, category, message, data });
  },
  
  error: (category: LogCategory, message: string, error?: Error, data?: any) => {
    log({ level: LogLevel.ERROR, category, message, error, data });
  },
  
  success: (category: LogCategory, message: string, data?: any) => {
    log({ level: LogLevel.SUCCESS, category, message, data });
  },
  
  security: (category: LogCategory, message: string, data?: any) => {
    log({ level: LogLevel.SECURITY, category, message, data });
  },
};
