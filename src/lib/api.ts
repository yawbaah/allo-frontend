const API_BASE_URL = 'http://localhost:8000/api';

export function getAccessToken(): string | null {
  return localStorage.getItem('allo_access_token');
}

export function getRefreshToken(): string | null {
  return localStorage.getItem('allo_refresh_token');
}

export function setTokens(access: string, refresh: string) {
  localStorage.setItem('allo_access_token', access);
  localStorage.setItem('allo_refresh_token', refresh);
}

export function clearTokens() {
  localStorage.removeItem('allo_access_token');
  localStorage.removeItem('allo_refresh_token');
  localStorage.removeItem('allo_user');
}

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
}

function addRefreshSubscriber(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) {
      clearTokens();
      window.location.href = '/login';
      return null;
    }

    const data = await response.json();
    setTokens(data.access, refreshToken);
    return data.access;
  } catch {
    clearTokens();
    window.location.href = '/login';
    return null;
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAccessToken();

  // Safely cast headers to a standard string dictionary for type-checking
  const headers: Record<string, string> = {};

  if (options.headers) {
    if (options.headers instanceof Headers) {
      options.headers.forEach((value, key) => {
        headers[key] = value;
      });
    } else if (Array.isArray(options.headers)) {
      options.headers.forEach(([key, value]) => {
        headers[key] = value;
      });
    } else {
      Object.assign(headers, options.headers);
    }
  }

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // If 401 Unauthorized, attempt silent token refresh automatically
  if (response.status === 401 && !headers['X-No-Retry']) {
    if (!isRefreshing) {
      isRefreshing = true;
      const newToken = await refreshAccessToken();
      isRefreshing = false;

      if (newToken) {
        onTokenRefreshed(newToken);
        headers['Authorization'] = `Bearer ${newToken}`;
        headers['X-No-Retry'] = 'true';
        const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
          ...options,
          headers,
        });

        if (!retryResponse.ok) {
          const errorData = await retryResponse.json().catch(() => ({}));
          const message = errorData.error || errorData.detail || 'An error occurred';
          throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
        }

        if (retryResponse.status === 204) return {} as T;
        return retryResponse.json();
      }
    } else {
      return new Promise<T>((resolve) => {
        addRefreshSubscriber((newToken: string) => {
          headers['Authorization'] = `Bearer ${newToken}`;
          headers['X-No-Retry'] = 'true';
          fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers })
            .then((r) => r.json())
            .then(resolve);
        });
      });
    }
  }

  if (response.status === 401) {
    clearTokens();
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message =
      errorData.error ||
      errorData.detail ||
      Object.values(errorData)[0] ||
      'An error occurred';
    throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}