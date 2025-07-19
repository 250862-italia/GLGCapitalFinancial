// Error Handler Centralizzato per GLG Capital Financial
// Sistema unificato per gestione errori, logging e monitoring

import { NextRequest, NextResponse } from 'next/server';

// Tipi di errore standardizzati
export enum ErrorType {
  VALIDATION = 'VALIDATION_ERROR',
  AUTHENTICATION = 'AUTHENTICATION_ERROR',
  AUTHORIZATION = 'AUTHORIZATION_ERROR',
  NOT_FOUND = 'NOT_FOUND_ERROR',
  DATABASE = 'DATABASE_ERROR',
  EXTERNAL_API = 'EXTERNAL_API_ERROR',
  RATE_LIMIT = 'RATE_LIMIT_ERROR',
  INTERNAL = 'INTERNAL_ERROR',
  NETWORK = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT_ERROR'
}

// Livelli di severità
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Interfaccia per errori standardizzati
export interface AppError {
  type: ErrorType;
  message: string;
  code: string;
  severity: ErrorSeverity;
  details?: any;
  timestamp: Date;
  requestId?: string;
  userId?: string;
  path?: string;
  method?: string;
  userAgent?: string;
  ip?: string;
}

// Configurazione errori
const ERROR_CONFIG = {
  [ErrorType.VALIDATION]: {
    statusCode: 400,
    severity: ErrorSeverity.LOW,
    logLevel: 'warn'
  },
  [ErrorType.AUTHENTICATION]: {
    statusCode: 401,
    severity: ErrorSeverity.MEDIUM,
    logLevel: 'warn'
  },
  [ErrorType.AUTHORIZATION]: {
    statusCode: 403,
    severity: ErrorSeverity.MEDIUM,
    logLevel: 'warn'
  },
  [ErrorType.NOT_FOUND]: {
    statusCode: 404,
    severity: ErrorSeverity.LOW,
    logLevel: 'info'
  },
  [ErrorType.DATABASE]: {
    statusCode: 500,
    severity: ErrorSeverity.HIGH,
    logLevel: 'error'
  },
  [ErrorType.EXTERNAL_API]: {
    statusCode: 502,
    severity: ErrorSeverity.MEDIUM,
    logLevel: 'error'
  },
  [ErrorType.RATE_LIMIT]: {
    statusCode: 429,
    severity: ErrorSeverity.LOW,
    logLevel: 'warn'
  },
  [ErrorType.INTERNAL]: {
    statusCode: 500,
    severity: ErrorSeverity.HIGH,
    logLevel: 'error'
  },
  [ErrorType.NETWORK]: {
    statusCode: 503,
    severity: ErrorSeverity.MEDIUM,
    logLevel: 'error'
  },
  [ErrorType.TIMEOUT]: {
    statusCode: 408,
    severity: ErrorSeverity.MEDIUM,
    logLevel: 'warn'
  }
};

// Classe per creazione errori
export class AppErrorBuilder {
  private error: Partial<AppError>;

  constructor(type: ErrorType, message: string, code: string) {
    this.error = {
      type,
      message,
      code,
      severity: ERROR_CONFIG[type].severity,
      timestamp: new Date()
    };
  }

  withDetails(details: any): AppErrorBuilder {
    this.error.details = details;
    return this;
  }

  withRequest(request: NextRequest): AppErrorBuilder {
    this.error.requestId = request.headers.get('x-request-id') || undefined;
    this.error.path = request.nextUrl.pathname;
    this.error.method = request.method;
    this.error.userAgent = request.headers.get('user-agent') || undefined;
    this.error.ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                   request.headers.get('x-real-ip') ||
                   request.ip ||
                   'unknown';
    return this;
  }

  withUser(userId: string): AppErrorBuilder {
    this.error.userId = userId;
    return this;
  }

  build(): AppError {
    return this.error as AppError;
  }
}

// Funzioni helper per creare errori comuni
export const createValidationError = (message: string, details?: any) => 
  new AppErrorBuilder(ErrorType.VALIDATION, message, 'VALIDATION_ERROR')
    .withDetails(details);

export const createAuthError = (message: string) => 
  new AppErrorBuilder(ErrorType.AUTHENTICATION, message, 'AUTH_ERROR');

export const createAuthzError = (message: string) => 
  new AppErrorBuilder(ErrorType.AUTHORIZATION, message, 'AUTHZ_ERROR');

export const createNotFoundError = (resource: string) => 
  new AppErrorBuilder(ErrorType.NOT_FOUND, `${resource} not found`, 'NOT_FOUND_ERROR');

export const createDatabaseError = (message: string, details?: any) => 
  new AppErrorBuilder(ErrorType.DATABASE, message, 'DB_ERROR')
    .withDetails(details);

export const createInternalError = (message: string, details?: any) => 
  new AppErrorBuilder(ErrorType.INTERNAL, message, 'INTERNAL_ERROR')
    .withDetails(details);

// Logger centralizzato
class ErrorLogger {
  private logError(error: AppError) {
    const logData = {
      timestamp: error.timestamp.toISOString(),
      type: error.type,
      code: error.code,
      severity: error.severity,
      message: error.message,
      requestId: error.requestId,
      userId: error.userId,
      path: error.path,
      method: error.method,
      ip: error.ip,
      userAgent: error.userAgent,
      details: error.details
    };

    const logLevel = ERROR_CONFIG[error.type].logLevel;
    
    switch (logLevel) {
      case 'info':
        console.info('[ERROR-LOG]', JSON.stringify(logData, null, 2));
        break;
      case 'warn':
        console.warn('[ERROR-LOG]', JSON.stringify(logData, null, 2));
        break;
      case 'error':
        console.error('[ERROR-LOG]', JSON.stringify(logData, null, 2));
        break;
      default:
        console.log('[ERROR-LOG]', JSON.stringify(logData, null, 2));
    }

    // In produzione, invia a servizio di monitoring esterno
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoring(logData);
    }
  }

  private sendToMonitoring(logData: any) {
    // Implementazione per inviare errori a servizi di monitoring
    // Es: Sentry, LogRocket, DataDog, etc.
    try {
      // Placeholder per integrazione con servizi esterni
      if (process.env.SENTRY_DSN) {
        // Sentry.captureException(logData);
      }
    } catch (e) {
      console.error('Failed to send error to monitoring service:', e);
    }
  }

  log(error: AppError) {
    this.logError(error);
  }
}

// Istanza globale del logger
export const errorLogger = new ErrorLogger();

// Funzione per gestire errori e creare response
export function handleError(error: AppError, request?: NextRequest): NextResponse {
  const config = ERROR_CONFIG[error.type];
  
  // Log dell'errore
  errorLogger.log(error);

  // Prepara response
  const responseData = {
    success: false,
    error: {
      type: error.type,
      message: error.message,
      code: error.code,
      ...(process.env.NODE_ENV === 'development' && { details: error.details })
    },
    timestamp: error.timestamp.toISOString(),
    requestId: error.requestId
  };

  // Headers per debugging
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Error-Type': error.type,
    'X-Error-Code': error.code
  };

  if (error.requestId) {
    headers['X-Request-ID'] = error.requestId;
  }

  return NextResponse.json(responseData, {
    status: config.statusCode,
    headers
  });
}

// Wrapper per API routes con gestione errori automatica
export function withErrorHandling(handler: Function) {
  return async (request: NextRequest) => {
    try {
      return await handler(request);
    } catch (error: any) {
      // Determina il tipo di errore
      let appError: AppError;

      if (error instanceof Error) {
        // Errori JavaScript standard
        if (error.message.includes('validation')) {
          appError = createValidationError(error.message).withRequest(request).build();
        } else if (error.message.includes('auth') || error.message.includes('unauthorized')) {
          appError = createAuthError(error.message).withRequest(request).build();
        } else if (error.message.includes('not found')) {
          appError = createNotFoundError('Resource').withRequest(request).build();
        } else if (error.message.includes('database') || error.message.includes('db')) {
          appError = createDatabaseError(error.message).withRequest(request).build();
        } else {
          appError = createInternalError(error.message).withRequest(request).build();
        }
      } else {
        // Errori generici
        appError = createInternalError('Unknown error occurred').withRequest(request).build();
      }

      return handleError(appError, request);
    }
  };
}

// Funzione per validazione input con errori standardizzati
export function validateWithError(data: any, schema: Record<string, (value: any) => boolean>, request?: NextRequest) {
  const errors: string[] = [];

  for (const [field, validator] of Object.entries(schema)) {
    if (!validator(data[field])) {
      errors.push(`Invalid ${field}`);
    }
  }

  if (errors.length > 0) {
    const error = createValidationError('Validation failed', { errors })
      .withRequest(request!)
      .build();
    throw new Error(JSON.stringify(error));
  }

  return true;
}

// Funzione per gestire errori Supabase
export function handleSupabaseError(error: any, operation: string, request?: NextRequest): AppError {
  let appError: AppError;

  if (error.code === 'PGRST116') {
    // RLS policy violation
    appError = createAuthzError(`Access denied for ${operation}`).withRequest(request!).build();
  } else if (error.code === '23505') {
    // Unique constraint violation
    appError = createValidationError(`Duplicate entry for ${operation}`).withRequest(request!).build();
  } else if (error.code === '23503') {
    // Foreign key violation
    appError = createValidationError(`Referenced record not found for ${operation}`).withRequest(request!).build();
  } else if (error.message?.includes('JWT')) {
    // JWT errors
    appError = createAuthError(`Authentication failed for ${operation}`).withRequest(request!).build();
  } else {
    // Generic database error
    appError = createDatabaseError(`Database operation failed: ${operation}`, { 
      code: error.code, 
      message: error.message 
    }).withRequest(request!).build();
  }

  return appError;
}

// Utility per creare request ID
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Middleware per aggiungere request ID
export function addRequestId(request: NextRequest): void {
  if (!request.headers.get('x-request-id')) {
    request.headers.set('x-request-id', generateRequestId());
  }
}

// Export delle funzioni principali
export {
  AppErrorBuilder as ErrorBuilder,
  ERROR_CONFIG
}; 