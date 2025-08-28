import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseErrorHandlerOptions {
  showToast?: boolean;
  logError?: boolean;
}

export function useErrorHandler(options: UseErrorHandlerOptions = {}) {
  const { showToast = true, logError = true } = options;
  const { toast } = useToast();

  const handleError = useCallback((error: Error | unknown, context?: string) => {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    const errorContext = context ? `[${context}] ` : '';

    if (logError) {
      console.error(`${errorContext}Error:`, error);
    }

    if (showToast) {
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }

    // In production, you might want to send this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error, { extra: { context } });
    }

    return errorMessage;
  }, [toast, logError, showToast]);

  const handleAsyncError = useCallback(async (
    asyncFn: () => Promise<any>,
    context?: string
  ): Promise<any | null> => {
    try {
      return await asyncFn();
    } catch (error) {
      handleError(error, context);
      return null;
    }
  }, [handleError]);

  return { handleError, handleAsyncError };
}