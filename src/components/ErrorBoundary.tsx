'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
          <div className="text-center p-8 bg-gray-800 rounded-lg border border-red-500/30 max-w-md">
            <h2 className="text-2xl font-bold text-red-400 mb-4">
              出现错误
            </h2>
            <p className="text-gray-300 mb-4">
              {this.state.error?.message || '未知错误'}
            </p>
            <button
              onClick={() => {
                // 使用setTimeout确保DOM更新完成后再重置状态
                setTimeout(() => {
                  this.setState({ hasError: false, error: undefined });
                }, 0);
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
            >
              重试
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook for handling fetch errors
 */
export function useFetchError() {
  const [error, setError] = React.useState<Error | null>(null);

  const handleFetchError = React.useCallback((err: Error) => {
    console.error('Fetch error:', err);
    setError(err);
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  return { error, handleFetchError, clearError };
}

