import type { Message } from './markdown'

export interface MessageNode extends Message {
  children: MessageNode[]
}

export function buildMessageTree(messages: Message[]): MessageNode[] {
  // First pass: create nodes
  const nodes: MessageNode[] = messages.map(msg => ({
    ...msg,
    children: []
  }))

  // Second pass: build tree
  const rootNodes: MessageNode[] = []
  
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    
    if (node.depth === 0) {
      rootNodes.push(node)
      continue
    }

    // Look backwards for parent
    for (let j = i - 1; j >= 0; j--) {
      const potentialParent = nodes[j]
      if (potentialParent.depth === node.depth - 1) {
        potentialParent.children.push(node)
        break
      }
    }
  }

  return rootNodes
} 