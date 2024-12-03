import participants from '../../participants.json';

export interface GithubUser {
  login: string;
  name?: string;
  avatar_url: string;
}

export async function authenticateWithGithub(): Promise<GithubUser | null> {
  const clientId = import.meta.env.VITE_APP_GH_CLIENT_ID;
  const isProd = import.meta.env.PROD;
  
  const redirectUri = isProd 
    ? 'https://conversationjs.vercel.app/auth/callback'
    : `${window.location.origin}/auth/callback`;
  
  console.log('Auth Debug:', {
    clientId,
    isProd,
    redirectUri,
    currentUrl: window.location.href
  });

  const authUrl = `https://github.com/login/oauth/authorize?` +
    `client_id=${clientId}&` +
    `redirect_uri=${redirectUri}&` +
    `scope=repo`;

  console.log('Redirecting to:', authUrl);
  window.location.href = authUrl;
  return null;
}

export function isAuthorizedUser(githubLogin: string): boolean {
  return participants.participants.some(p => p.username === githubLogin);
}

export function getAuthToken(): string | null {
  return localStorage.getItem('github_token');
}

export function getCurrentUser(): GithubUser | null {
  const userStr = localStorage.getItem('github_user');
  return userStr ? JSON.parse(userStr) : null;
}

export function logout(): void {
  localStorage.removeItem('github_token');
  localStorage.removeItem('github_user');
} 