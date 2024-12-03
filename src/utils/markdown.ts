/**
 * Markdown parsing utilities
 * - Parses thread titles and metadata
 * - Extracts message content, authors, and timestamps
 * - Handles multi-line messages and indentation
 * - Ignores malformed content
 */

export interface Message {
  author: string;
  timestamp: string;
  content: string;
  depth?: number;
}

export interface Thread {
  title: string;
  messages: Message[];
  collapsed?: boolean;
}

/**
 * Parses markdown content into thread structures
 * Format:
 * ### Thread Title [metadata]
 * - @author [timestamp]: Message content
 *   Continued message content
 *   - @author2 [timestamp]: Reply
 */
export function parseMarkdown(markdown: string): Thread[] {
  const threads: Thread[] = [];
  let currentThread: Thread | null = null;
  let currentMessage: Message | null = null;
  let messageContent: string[] = [];

  markdown.split('\n').forEach(line => {
    const threadMatch = line.match(/^###\s+(.+)$/);
    if (threadMatch) {
      if (currentThread) {
        threads.push(currentThread);
      }
      currentThread = {
        title: threadMatch[1],
        messages: [],
        collapsed: false
      };
      return;
    }

    if (!currentThread) return;

    const messageMatch = line.match(/^(\s*)-\s+@(\w+)\s+\[([^\]]+)\]:\s+(.+)$/);
    if (messageMatch) {
      if (currentMessage) {
        currentMessage.content = messageContent.join('\n');
        currentThread.messages.push(currentMessage);
      }
      const indentLevel = (messageMatch[1] || '').length / 2;
      messageContent = [messageMatch[4]];
      currentMessage = {
        author: messageMatch[2],
        timestamp: messageMatch[3],
        content: '',
        depth: indentLevel
      };
    } else if (line.trim() && currentMessage) {
      messageContent.push(line.trim());
    }
  });

  if (currentMessage && currentThread) {
    currentMessage.content = messageContent.join('\n');
    currentThread.messages.push(currentMessage);
  }
  if (currentThread) {
    threads.push(currentThread);
  }

  return threads;
} 