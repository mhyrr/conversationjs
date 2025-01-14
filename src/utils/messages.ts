interface ThreadMessage {
  author: string;
  timestamp: string;
  content: string;
  replies?: ThreadMessage[];
}

export function buildMessageTree(messages: ThreadMessage[]): ThreadMessage[] {
  const messageTree: ThreadMessage[] = []
  const messageStack: ThreadMessage[][] = [messageTree]
  let currentDepth = 0

  messages.forEach(message => {
    const depth = message.replies ? message.replies.length : 0

    // Adjust stack based on depth
    while (currentDepth > depth) {
      messageStack.pop()
      currentDepth--
    }
    while (currentDepth < depth) {
      const parent = messageStack[messageStack.length - 1]
      if (parent.length === 0) break
      const newLevel: ThreadMessage[] = []
      parent[parent.length - 1].replies = newLevel
      messageStack.push(newLevel)
      currentDepth++
    }

    messageStack[messageStack.length - 1].push(message)
  })

  return messageTree
}

export function createMessageKey(message: ThreadMessage): string {
  return `${message.author}-${message.timestamp}`
} 