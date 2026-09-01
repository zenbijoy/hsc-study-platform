export type AppErrorCode =
  | 'NETWORK'
  | 'AUTH_REQUIRED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION'
  | 'SERVER'
  | 'OFFLINE'
  | 'CRYPTO_ERROR'
  | 'LICENSE_EXPIRED'
  | 'UNKNOWN';

export interface AppError {
  code: AppErrorCode;
  message: string;
  userMessage: string;
  cause?: unknown;
}

export function createAppError(
  code: AppErrorCode,
  message: string,
  userMessage?: string,
  cause?: unknown
): AppError {
  const defaultUserMessages: Record<AppErrorCode, string> = {
    NETWORK: 'Unable to connect. Please check your internet connection.',
    AUTH_REQUIRED: 'Please sign in to access this material.',
    FORBIDDEN: 'You do not have permission to view this content.',
    NOT_FOUND: 'The requested resource was not found.',
    VALIDATION: 'Invalid data provided.',
    SERVER: 'Server encountered an issue. Please try again shortly.',
    OFFLINE: 'This item is not available offline. Please download it first.',
    CRYPTO_ERROR: 'Security validation failed for this package.',
    LICENSE_EXPIRED: 'Your license for this book has expired. Please renew.',
    UNKNOWN: 'An unexpected error occurred. Please try again.',
  };

  return {
    code,
    message,
    userMessage: userMessage || defaultUserMessages[code] || defaultUserMessages.UNKNOWN,
    cause,
  };
}
