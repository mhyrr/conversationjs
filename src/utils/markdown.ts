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
  content: string[];
  depth: number;
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
export function parseMarkdown(content: string): Thread[] {
  const lines = content.split('\n');
  const threads: Thread[] = [];
  let currentThread: Thread | null = null;
  let currentMessage: Message | null = null;

  lines.forEach((line) => {
    // Handle thread headers
    if (line.startsWith('### ')) {
      if (currentThread) threads.push(currentThread);
      currentThread = {
        title: line.replace('### ', ''),
        messages: []
      };
      return;
    }

    // Skip if no current thread
    if (!currentThread) return;

    // Handle message lines
    const messageMatch = line.match(/^(\s*)- @(\w+) \[(.*?)Z?\]: (.*)/);
    if (messageMatch) {
      const [, indent, author, timestamp, content] = messageMatch;
      const depth = (indent?.length || 0) / 2;
      
      currentMessage = {
        author,
        timestamp,
        content: [content],
        depth
      };
      currentThread.messages.push(currentMessage);
    } else if (line.trim() && currentMessage) {
      // Handle continued message content
      const indentMatch = line.match(/^(\s*)/);
      const indent = indentMatch ? indentMatch[1] : '';
      currentMessage.content.push(line.trim());
    }
  });

  if (currentThread) threads.push(currentThread);
  return threads;
}

export function parseMessage(text: string): string {
  return text.trim();
} 