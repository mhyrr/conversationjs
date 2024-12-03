import type { Message } from './markdown'

export function createMessageKey(message: Message): string {
  return `${message.author}-${message.timestamp}`
} 