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
  thread: Thread;
  onUpdate: () => void;
}

export function Thread({ thread, onUpdate }: ThreadProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const messageTree = buildMessageTree(thread.messages);

  return (
    <div className="thread">
      <div className="thread-title" onClick={() => setIsCollapsed(!isCollapsed)}>
        <span className="collapse-icon">{isCollapsed ? '▸' : '▾'}</span>
        <h3>{thread.title}</h3>
      </div>
      
      <div className={`thread-messages ${isCollapsed ? 'collapsed' : ''}`}>
        {messageTree.map((message) => (
          <Message
            key={`${message.author}-${message.timestamp}-${message.depth}`}
            message={message}
            threadTitle={thread.title}
            onUpdate={onUpdate}
          />
        ))}
      </div>
    </div>
  );
} 