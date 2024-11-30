import { useState } from 'react'
import { Message } from './Message'
import type { Thread } from '../utils/markdown'
import { buildMessageTree } from '../utils/tree'
import { createMessageKey } from '../utils/keys'

interface ThreadProps {
  thread: Thread
}

export function Thread({ thread }: ThreadProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const messageTree = buildMessageTree(thread.messages)
  
  return (
    <div className="thread">
      <h3 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="thread-title"
      >
        <span className="collapse-icon">
          {isCollapsed ? '▸' : '▾'}
        </span>
        {thread.title}
      </h3>
      <div className={`thread-messages ${isCollapsed ? 'collapsed' : ''}`}>
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