/**
 * Tree utilities for converting flat message arrays into nested structures
 * - Handles arbitrary nesting depth
 * - Preserves message order
 * - Maintains parent-child relationships based on depth
 */

export interface MessageNode {
  author: string;
  timestamp: string;
  content: string[];
  depth: number;
  path: string;
  children: MessageNode[];
}

/**
 * Converts a flat array of messages into a nested tree structure
 * based on message depth values
 */
export function buildMessageTree(messages: any[]): MessageNode[] {
  const messageMap = new Map<string, MessageNode>();
  const roots: MessageNode[] = [];

  messages.forEach((msg, index) => {
    const path = messages
      .slice(0, index + 1)
      .filter(m => m.depth <= msg.depth)
      .map(m => `${m.author}-${m.timestamp}-${m.depth}`)
      .join('/');

    const node: MessageNode = {
      author: msg.author,
      timestamp: msg.timestamp,
      content: msg.content,
      depth: msg.depth,
      path,
      children: []
    };
    messageMap.set(path, node);

    if (msg.depth === 0) {
      roots.push(node);
    }
  });

  // Build tree relationships using paths
  messages.forEach((msg, index) => {
    if (msg.depth > 0) {
      const currentPath = messageMap.get(messages
        .slice(0, index + 1)
        .filter(m => m.depth <= msg.depth)
        .map(m => `${m.author}-${m.timestamp}-${m.depth}`)
        .join('/')
      );

      // Find parent by looking at previous messages with depth - 1
      for (let i = index - 1; i >= 0; i--) {
        if (messages[i].depth === msg.depth - 1) {
          const parentPath = messageMap.get(messages
            .slice(0, i + 1)
            .filter(m => m.depth <= messages[i].depth)
            .map(m => `${m.author}-${m.timestamp}-${m.depth}`)
            .join('/')
          );
          
          if (parentPath && currentPath) {
            parentPath.children.push(currentPath);
            break;
          }
        }
      }
    }
  });

  return roots;
} 