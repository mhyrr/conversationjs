import type { Message } from './markdown'

export const createMessageKey = (message: Message) => {
  const contentHash = message.content.join('').slice(0, 10)
  return `${message.author}-${message.timestamp}-${message.depth}-${contentHash}`
} 