import participants from '../../participants.json';

export interface GithubUser {
  login: string;
  name?: string;
  avatar_url: string;
}

export async function authenticateWithGithub(): Promise<GithubUser | null> {
  const clientId = import.meta.env.VITE_APP_GH_CLIENT_ID;
  const isProd = import.meta.env.PROD;
  
  // Get repo name from URL in prod
  const repoName = isProd 
    ? window.location.pathname.split('/')[1]
    : 'conversationjs';
    
  const redirectUri = isProd 
    ? `${window.location.origin}/${repoName}/auth/callback`
    : `${window.location.origin}/auth/callback`;
  
  const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=repo`;
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