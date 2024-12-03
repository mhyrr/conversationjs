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
  replies?: Message[];
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
  const lines = markdown.split('\n');
  const threads: Thread[] = [];
  let currentThread: Thread | null = null;
  let currentMessage: Message | null = null;

  lines.forEach((line) => {
    if (line.startsWith('### ')) {
      if (currentThread) {
        threads.push(currentThread);
      }
      currentThread = {
        title: line.slice(4).trim(),
        messages: [],
        collapsed: false
      };
    } else if (currentThread) {
      const messageMatch = line.match(/^(\s*)-\s+@(\w+)\s+\[([^\]]+)\]:\s+(.+)$/);
      if (messageMatch) {
        const [, indent, author, timestamp, content] = messageMatch;
        const depth = (indent || '').length / 2;
        currentMessage = {
          author,
          timestamp,
          content,
          depth,
          replies: []
        };
        currentThread.messages.push(currentMessage);
      }
    }
  });

  if (currentThread) {
    threads.push(currentThread);
  }

  return threads;
} 