import { MessageAPI } from './types';
import { LocalMessageAPI } from './local';
import { GitHubMessageAPI } from './github';

export function createMessageAPI(): MessageAPI {
  // Temporarily force GitHub API for testing
  return new GitHubMessageAPI();
  
  // Original code
  // if (import.meta.env.DEV) {
  //   return new LocalMessageAPI();
  // }
  // return new GitHubMessageAPI();
}

export * from './types';