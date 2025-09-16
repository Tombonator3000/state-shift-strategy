// Error handling utilities for Shadow Government
// Centralized error management and logging

export interface GameError {
  type: 'audio' | 'network' | 'state' | 'ui' | 'critical';
  code: string;
  message: string;
  context?: any;
  timestamp: number;
}

class ErrorHandler {
  private static instance: ErrorHandler;
  private errors: GameError[] = [];
  private maxErrors = 50; // Keep last 50 errors

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  // Log error with context
  logError(error: Omit<GameError, 'timestamp'>): void {
    const fullError: GameError = {
      ...error,
      timestamp: Date.now()
    };

    this.errors.push(fullError);
    
    // Keep only recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }

    // Console logging based on type
    if (error.type === 'critical') {
      console.error('🚨 CRITICAL ERROR:', error.message, error.context);
    } else if (error.type === 'audio') {
      console.debug('🔊 Audio issue:', error.message);
    } else {
      console.warn(`⚠️ ${error.type.toUpperCase()}:`, error.message, error.context);
    }
  }

  // Handle audio errors specifically
  handleAudioError(soundName: string, error: any): void {
    this.logError({
      type: 'audio',
      code: 'AUDIO_PLAYBACK_FAILED',
      message: `Failed to play sound: ${soundName}`,
      context: { soundName, error: error.message }
    });
  }

  // Handle network errors
  handleNetworkError(url: string, error: any): void {
    this.logError({
      type: 'network',
      code: 'NETWORK_REQUEST_FAILED',
      message: `Network request failed: ${url}`,
      context: { url, error: error.message }
    });
  }

  // Handle state errors
  handleStateError(operation: string, error: any): void {
    this.logError({
      type: 'state',
      code: 'STATE_OPERATION_FAILED',
      message: `Game state operation failed: ${operation}`,
      context: { operation, error: error.message }
    });
  }

  // Get error summary for debugging
  getErrorSummary(): { total: number; byType: Record<string, number>; recent: GameError[] } {
    const byType = this.errors.reduce((acc, error) => {
      acc[error.type] = (acc[error.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: this.errors.length,
      byType,
      recent: this.errors.slice(-10) // Last 10 errors
    };
  }

  // Clear errors (for debugging/testing)
  clearErrors(): void {
    this.errors = [];
  }
}

// Safe wrapper for async operations
export const safeAsync = async <T>(
  operation: () => Promise<T>,
  fallback: T,
  errorContext?: string
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    ErrorHandler.getInstance().logError({
      type: 'critical',
      code: 'ASYNC_OPERATION_FAILED',
      message: errorContext || 'Async operation failed',
      context: { error: error instanceof Error ? error.message : error }
    });
    return fallback;
  }
};

// Safe wrapper for sync operations
export const safeSync = <T>(
  operation: () => T,
  fallback: T,
  errorContext?: string
): T => {
  try {
    return operation();
  } catch (error) {
    ErrorHandler.getInstance().logError({
      type: 'critical',
      code: 'SYNC_OPERATION_FAILED',
      message: errorContext || 'Sync operation failed',
      context: { error: error instanceof Error ? error.message : error }
    });
    return fallback;
  }
};

export const errorHandler = ErrorHandler.getInstance();
