import { getAccessToken, clearTokens } from './api';

export type UserProfile = {
  id: string;
  email: string;
  company_id: string;
  company_name: string;
  email_verified: boolean;
  company?: string;
};

export function isAuthenticated(): boolean {
  return !!getAccessToken();
}

export function getUser(): UserProfile | null {
  const raw = localStorage.getItem('allo_user');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}

export function getSession() {
  const user = getUser();
  if (user) {
    return {
      email: user.email,
      company: user.company_name || user.company || 'Company',
      loggedInAt: new Date().toISOString(),
    };
  }
  const raw = localStorage.getItem('allo_user');
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return {
      email: parsed.email || 'user@company.com',
      company: parsed.company || parsed.company_name || 'Company',
      loggedInAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function setUser(user: UserProfile) {
  localStorage.setItem('allo_user', JSON.stringify(user));
}

export function setSession(session: any) {
  localStorage.setItem('allo_user', JSON.stringify(session));
}

export function clearSession() {
  clearTokens();
}

export function logout() {
  clearTokens();
  window.location.href = '/login';
}