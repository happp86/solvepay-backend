import { API_URL } from '../config/api';
import { tokenStore } from './tokenStore';

interface RequestOptions extends RequestInit {
  body?: any;
}

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

let isRefreshing = false;
let refreshQueue: (() => void)[] = [];

async function request(path: string, options: RequestOptions = {}): Promise<any> {
  const url = `${API_URL}${path}`;
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');

  const token = tokenStore.getAccessToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const fetchOptions: RequestInit = {
    ...options,
    headers,
  };

  if (options.body) {
    fetchOptions.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, fetchOptions);

  if (response.status === 401 && tokenStore.getRefreshToken() && path !== '/auth/refresh-token' && path !== '/auth/login') {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const refreshResponse = await fetch(`${API_URL}/auth/refresh-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: tokenStore.getRefreshToken() }),
        });

        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          if (data.tokens) {
            tokenStore.setTokens(data.tokens.accessToken, data.tokens.refreshToken);
            isRefreshing = false;
            // Execute queue
            refreshQueue.forEach((cb) => cb());
            refreshQueue = [];
            // Retry original
            return request(path, options);
          }
        }
      } catch (err) {
        // Fall through to logout
      }
      isRefreshing = false;
      tokenStore.clear();
      refreshQueue = [];
      throw new ApiError('Session expired. Please log in again.', 401);
    } else {
      // Wait for refresh to complete
      return new Promise((resolve, reject) => {
        refreshQueue.push(() => {
          request(path, options).then(resolve).catch(reject);
        });
      });
    }
  }

  let data: any;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errMsg = data?.message || data || 'Something went wrong';
    throw new ApiError(Array.isArray(errMsg) ? errMsg.join(', ') : errMsg, response.status);
  }

  return data;
}

export const apiClient = {
  get(path: string, options?: RequestOptions) {
    return request(path, { ...options, method: 'GET' });
  },
  post(path: string, body?: any, options?: RequestOptions) {
    return request(path, { ...options, method: 'POST', body });
  },
};
