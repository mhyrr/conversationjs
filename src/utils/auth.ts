import participants from '../../participants.json';

export interface GithubUser {
  login: string;
  name?: string;
  avatar_url: string;
}

export async function authenticateWithGithub(): Promise<GithubUser | null> {
  const isProd = import.meta.env.PROD;
  
  if (isProd) {
    // Production: Use GitHub App flow
    const appId = import.meta.env.VITE_APP_GH_APP_ID;
    const authUrl = `https://github.com/apps/${appId}/installations/new`;
    window.location.href = authUrl;
  } else {
    // Development: Use OAuth flow with local proxy
    const clientId = import.meta.env.VITE_APP_GH_CLIENT_ID;
    const redirectUri = `${window.location.origin}/auth/callback`;
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=repo`;
    window.location.href = authUrl;
  }
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