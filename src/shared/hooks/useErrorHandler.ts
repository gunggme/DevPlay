import { useCallback } from 'react';
import { toast } from 'react-hot-toast';

interface ErrorInfo {
  message: string;
  code?: string;
  details?: any;
}

export function useErrorHandler() {
  const handleError = useCallback((error: Error | ErrorInfo | string, context?: string) => {
    console.error('Error occurred:', { error, context });

    let errorMessage = '알 수 없는 오류가 발생했습니다.';

    if (typeof error === 'string') {
      errorMessage = error;
    } else if (error instanceof Error) {
      errorMessage = error.message || errorMessage;
    } else if (error && typeof error === 'object' && 'message' in error) {
      errorMessage = error.message;
    }

    const contextPrefix = context ? `[${context}] ` : '';
    const fullMessage = `${contextPrefix}${errorMessage}`;

    toast.error(fullMessage, {
      duration: 5000,
      position: 'top-right'
    });

    if (process.env.NODE_ENV === 'development') {
      console.error('Full error details:', error);
    }
  }, []);

  const handleApiError = useCallback((error: any, context?: string) => {
    if (error?.response?.data?.message) {
      handleError(error.response.data.message, context);
    } else if (error?.message) {
      handleError(error.message, context);
    } else {
      handleError('API 요청 중 오류가 발생했습니다.', context);
    }
  }, [handleError]);

  const handleAuthError = useCallback((error: any) => {
    if (error?.message?.includes('unauthorized') || error?.message?.includes('401')) {
      handleError('인증이 필요합니다. 다시 로그인해주세요.', 'Auth');
    } else if (error?.message?.includes('forbidden') || error?.message?.includes('403')) {
      handleError('접근 권한이 없습니다.', 'Auth');
    } else {
      handleError(error, 'Auth');
    }
  }, [handleError]);

  const showSuccess = useCallback((message: string) => {
    toast.success(message, {
      duration: 3000,
      position: 'top-right'
    });
  }, []);

  const showInfo = useCallback((message: string) => {
    toast(message, {
      duration: 3000,
      position: 'top-right'
    });
  }, []);

  return {
    handleError,
    handleApiError,
    handleAuthError,
    showSuccess,
    showInfo
  };
}