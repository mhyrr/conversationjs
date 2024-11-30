import React from 'react'
import { Message } from './Message'
import type { Thread } from '../utils/markdown'
import { buildMessageTree } from '../utils/tree'
import { createMessageKey } from '../utils/keys'

interface ThreadProps {
  thread: Thread
}

export function Thread({ thread }: ThreadProps) {
  const messageTree = buildMessageTree(thread.messages)
  
  return (
    <div className="thread">
      <h3>{thread.title}</h3>
      <div className="thread-messages">
        {messageTree.map((message) => (
          <Message 
            key={createMessageKey(message)}
            message={message}
          />
        ))}
      </div>
    </div>
  )
} 