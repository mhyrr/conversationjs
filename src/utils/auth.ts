import participants from '../../participants.json';

export interface GithubUser {
  login: string;
  name?: string;
  avatar_url: string;
}

export class NotParticipantError extends Error {
  constructor(username: string) {
    super(`User ${username} is not a participant in this conversation`);
    this.name = 'NotParticipantError';
  }
}

export function isAuthorizedUser(githubLogin: string): boolean {
  return participants.participants.some(p => p.username === githubLogin);
}

export async function authenticateWithGithub(): Promise<GithubUser | null> {
  const clientId = import.meta.env.VITE_APP_GH_CLIENT_ID;
  const redirectUri = `${window.location.origin}/auth/callback`;
  
  const authUrl = `https://github.com/login/oauth/authorize?` +
    `client_id=${clientId}&` +
    `redirect_uri=${redirectUri}&` +
    `scope=repo`;

  window.location.href = authUrl;
  return null;
}

export function getCurrentUser(): GithubUser | null {
  const userStr = localStorage.getItem('github_user');
  if (!userStr) return null;
  
  const user = JSON.parse(userStr);
  if (!isAuthorizedUser(user.login)) {
    throw new NotParticipantError(user.login);
  }
  return user;
}

export function logout(): void {
  localStorage.removeItem('github_token');
  localStorage.removeItem('github_user');
} 