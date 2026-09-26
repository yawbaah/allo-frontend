const API_BASE_URL = 'http://localhost:8000/api';

export function getAccessToken(): string | null {
  return localStorage.getItem('allo_access_token');
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

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAccessToken();

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

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