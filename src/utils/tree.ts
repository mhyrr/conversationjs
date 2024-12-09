/**
 * Tree utilities for converting flat message arrays into nested structures
 * - Handles arbitrary nesting depth
 * - Preserves message order
 * - Maintains parent-child relationships based on depth
 */

import type { Message } from '../types';

/**
 * Converts a flat array of messages into a nested tree structure
 * based on message depth values
 */
export function buildMessageTree(messages: Message[]): Message[] {
  const result: Message[] = []
  const stack: Message[] = []

  messages.forEach(message => {
    // Clone message and initialize children array
    const node = { ...message, children: [] }
    
    // Pop stack until we find the parent
    while (stack.length > 0 && stack[stack.length - 1].depth >= node.depth) {
      stack.pop()
    }

    if (stack.length === 0) {
      // Root level message
      result.push(node)
    } else {
      // Add as child to parent
      stack[stack.length - 1].children!.push(node)
    }
    
    stack.push(node)
  })

  return result
} 