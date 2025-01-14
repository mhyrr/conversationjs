import { MessageAPI, MessageUpdate, MessageReply, ThreadCreate, MessageMove, MessageDelete } from './types';

export class LocalMessageAPI implements MessageAPI {
  async updateMessage(update: MessageUpdate): Promise<boolean> {
    const response = await fetch('/api/messages/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(update)
    });
    return response.ok;
  }

  async replyToMessage(reply: MessageReply): Promise<boolean> {
    const response = await fetch('/api/messages/reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reply)
    });
    return response.ok;
  }

  async createThread(thread: ThreadCreate): Promise<boolean> {
    const response = await fetch('/api/threads/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(thread)
    });
    return response.ok;
  }

  async moveToThread(move: MessageMove): Promise<boolean> {
    const response = await fetch('/api/threads/move', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(move)
    });
    return response.ok;
  }

  async deleteMessage(del: MessageDelete): Promise<boolean> {
    const response = await fetch('/api/messages/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(del)
    });
    return response.ok;
  }
}