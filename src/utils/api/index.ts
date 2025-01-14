import { MessageAPI } from './types';
import { LocalMessageAPI } from './local';
import { GitHubMessageAPI } from './github';

export function createMessageAPI(): MessageAPI {
  // Use local API in development, GitHub API in production
  if (import.meta.env.DEV) {
    return new LocalMessageAPI();
  }
  return new GitHubMessageAPI();
}

export * from './types';