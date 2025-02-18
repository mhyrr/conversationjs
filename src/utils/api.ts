import { GitHubMessageAPI } from './api/github';
import { useUpdatesStore } from '../stores/updates';

interface MessageUpdate {
  threadTitle: string;
  messageAuthor: string;
  messageTimestamp: string;
  newContent: string[];
}

interface MessageReply {
  threadTitle: string;
  parentAuthor: string;
  parentTimestamp: string;
  parentContent: string[];
  content: string[];
  author: string;
  timestamp: string;
}

interface NewThread {
  title: string;
  initialMessage?: {
    content: string[];
    author: string;
  };
}

interface MoveToThread {
  newTitle: string;
  sourceThreadTitle: string;
  messageAuthor: string;
  messageTimestamp: string;
  messageContent: string[];
}

interface MessageIdentifier {
  threadTitle: string;
  messageAuthor: string;
  messageTimestamp: string;
}

// Use the same port as the auth server
const DEV_API_URL = 'http://localhost:3000';

export async function updateMessage(update: MessageUpdate): Promise<boolean> {
  if (import.meta.env.DEV) {
    const response = await fetch(`${DEV_API_URL}/api/messages/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(update)
    });
    return response.ok;
  } else {
    const api = new GitHubMessageAPI();
    useUpdatesStore.getState().addPendingUpdate();
    return await api.updateMessage(update);
  }
}

export async function replyToMessage(reply: MessageReply): Promise<boolean> {
  if (import.meta.env.DEV) {
    const response = await fetch(`${DEV_API_URL}/api/messages/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reply)
    });
    return response.ok;
  } else {
    const api = new GitHubMessageAPI();
    useUpdatesStore.getState().addPendingUpdate();
    return await api.replyToMessage(reply);
  }
}

export async function createThread(thread: NewThread): Promise<boolean> {
  if (import.meta.env.DEV) {
    const response = await fetch(`${DEV_API_URL}/api/threads/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(thread)
    });
    return response.ok;
  } else {
    const api = new GitHubMessageAPI();
    useUpdatesStore.getState().addPendingUpdate();
    return await api.createThread(thread);
  }
}

export async function moveToThread(move: MoveToThread): Promise<boolean> {
  if (import.meta.env.DEV) {
    const response = await fetch(`${DEV_API_URL}/api/threads/move`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(move)
    });
    return response.ok;
  } else {
    const api = new GitHubMessageAPI();
    useUpdatesStore.getState().addPendingUpdate();
    return await api.moveToThread(move);
  }
}

export async function deleteMessage({
  threadTitle,
  messageAuthor,
  messageTimestamp
}: MessageIdentifier): Promise<boolean> {
  if (import.meta.env.DEV) {
    try {
      const response = await fetch(`${DEV_API_URL}/api/messages/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          threadTitle,
          messageAuthor,
          messageTimestamp
        }),
      });
      return response.ok;
    } catch (error) {
      console.error('Failed to delete message:', error);
      return false;
    }
  } else {
    const api = new GitHubMessageAPI();
    useUpdatesStore.getState().addPendingUpdate();
    return await api.deleteMessage({ threadTitle, messageAuthor, messageTimestamp });
  }
} 