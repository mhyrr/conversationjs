import React, { useState } from 'react'
import type { MessageNode } from '../utils/tree'
import { createMessageKey } from '../utils/keys'

interface MessageProps {
  message: MessageNode
}

export function Message({ message }: MessageProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const displayName = message.author
  
  return (
    <div className="message-group" data-depth={message.depth}>
      <div className="message-content">
        <div className="message-header">
          {message.children.length > 0 && (
            <button 
              className="collapse-toggle"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              <span className="collapse-icon">
                {isCollapsed ? '▸' : '▾'}
              </span>
            </button>
          )}
          <div className="message-prefix">
            - @{displayName} [{message.timestamp}]:
          </div>
        </div>
        <div className={`message-content-body ${isCollapsed ? 'collapsed' : ''}`}>
          {message.content.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </div>
      {message.children.length > 0 && (
        <div className={`message-replies ${isCollapsed ? 'collapsed' : ''}`}>
          {message.children.map((child) => (
            <Message 
              key={createMessageKey(child)}
              message={child}
            />
          ))}
        </div>
      )}
    </div>
  )
} 