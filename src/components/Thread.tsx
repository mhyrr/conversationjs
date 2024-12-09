/**
 * Thread component displays a collapsible thread of messages
 * - Handles collapsing/expanding of the entire thread
 * - Converts flat message array into a nested tree structure
 * - Renders child messages with proper indentation
 */
import { useState } from 'react'
import { Message } from './Message'
import type { Thread } from '../utils/markdown'
import { buildMessageTree } from '../utils/tree'
import { createMessageKey } from '../utils/keys'

interface ThreadProps {
  thread: Thread  // Thread data including title and messages
}

export function Thread({ thread }: ThreadProps) {
  // State for thread collapse/expand
  const [isCollapsed, setIsCollapsed] = useState(false)
  // Convert flat message array to nested tree structure
  const messageTree = buildMessageTree(thread.messages)
  const [key, setKey] = useState(0) // Add refresh key
  
  const handleUpdate = () => {
    setKey(k => k + 1) // Force refresh on update
  }
  
  return (
    <div className="thread">
      <h3 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="thread-title"
      >
        <span className="collapse-icon">
          {isCollapsed ? '▸' : '▾'}  {/* Toggle arrow based on state */}
        </span>
        {thread.title}
      </h3>
      <div className={`thread-messages ${isCollapsed ? 'collapsed' : ''}`}>
        {messageTree.map((message) => (
          <Message 
            key={`${createMessageKey(message)}-${key}`}
            message={message}
            threadTitle={thread.title}
            onUpdate={handleUpdate}
          />
        ))}
      </div>
    </div>
  )
} 