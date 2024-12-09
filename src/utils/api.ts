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
  }
  return false;
}

export async function replyToMessage(reply: MessageReply): Promise<boolean> {
  if (import.meta.env.DEV) {
    const response = await fetch(`${DEV_API_URL}/api/messages/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reply)
    });
    return response.ok;
  }
  return false;
} 