/**
 * 增强的fetch工具，包含错误处理和重试机制
 */

interface FetchOptions extends RequestInit {
  retries?: number;
  retryDelay?: number;
  timeout?: number;
}

export async function enhancedFetch(
  url: string, 
  options: FetchOptions = {}
): Promise<Response> {
  const {
    retries = 3,
    retryDelay = 1000,
    timeout = 10000,
    ...fetchOptions
  } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (retries > 0 && (error as Error).name !== 'AbortError') {
      console.warn(`Fetch failed, retrying... (${retries} retries left)`, error);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      return enhancedFetch(url, { ...options, retries: retries - 1 });
    }
    
    console.error('Fetch failed after all retries:', error);
    throw error;
  }
}

/**
 * 检查网络连接状态
 */
export function checkNetworkStatus(): boolean {
  return navigator.onLine;
}

/**
 * 获取API基础URL
 */
export function getApiBaseUrl(): string {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  }
  
  return window.location.origin;
}

