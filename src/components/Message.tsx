import { useState } from 'react'
import type { MessageNode } from '../utils/tree'
import { createMessageKey } from '../utils/keys'
import { getCurrentUser } from '../utils/auth'
import { updateMessage, replyToMessage } from '../utils/api'

interface MessageProps {
  message: MessageNode;
  threadTitle: string;
  onUpdate?: () => void;
}

export function Message({ message, threadTitle, onUpdate }: MessageProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isReplying, setIsReplying] = useState(false)
  const [editContent, setEditContent] = useState(message.content.join('\n'))
  const [replyContent, setReplyContent] = useState('')
  
  const currentUser = getCurrentUser()
  const isOwnMessage = currentUser?.login === message.author
  const displayName = message.author

  const handleEdit = async () => {
    console.log('Editing message:', {
      threadTitle,
      messageAuthor: message.author,
      messageTimestamp: message.timestamp,
      newContent: editContent.split('\n')
    });

    const success = await updateMessage({
      threadTitle,
      messageAuthor: message.author,
      messageTimestamp: message.timestamp,
      newContent: editContent.split('\n')
    });

    console.log('Edit response:', success);

    if (success) {
      setIsEditing(false);
      onUpdate?.();
    }
  };

  const handleReply = async () => {
    if (!currentUser) return;

    console.log('Replying to message:', {
      threadTitle,
      parentAuthor: message.author,
      parentTimestamp: message.timestamp,
      parentContent: message.content,
      content: replyContent.split('\n'),
      author: currentUser.login
    });

    const success = await replyToMessage({
      threadTitle,
      parentAuthor: message.author,
      parentTimestamp: message.timestamp,
      parentContent: message.content,
      content: replyContent.split('\n'),
      author: currentUser.login
    });

    console.log('Reply response:', success);

    if (success) {
      setIsReplying(false);
      setReplyContent('');
      onUpdate?.();
    }
  };

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
            {currentUser && (
              <div className="message-actions">
                {isOwnMessage ? (
                  <button onClick={() => setIsEditing(true)} className="text-blue-500 text-sm ml-2">
                    Edit
                  </button>
                ) : (
                  <button onClick={() => setIsReplying(true)} className="text-blue-500 text-sm ml-2">
                    Reply
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {isEditing ? (
          <div className="edit-form mt-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-2 border rounded"
              rows={4}
            />
            <div className="mt-2">
              <button onClick={handleEdit} className="bg-blue-500 text-white px-3 py-1 rounded">
                Save
              </button>
              <button onClick={() => setIsEditing(false)} className="ml-2 text-gray-500">
                Cancel
              </button>
            </div>
          </div>
        ) : isReplying ? (
          <div className="reply-form mt-2">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="w-full p-2 border rounded"
              rows={4}
              placeholder="Type your reply..."
            />
            <div className="mt-2">
              <button onClick={handleReply} className="bg-blue-500 text-white px-3 py-1 rounded">
                Reply
              </button>
              <button onClick={() => setIsReplying(false)} className="ml-2 text-gray-500">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className={`message-content-body ${isCollapsed ? 'collapsed' : ''}`}>
            {message.content.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        )}
      </div>
      {message.children.length > 0 && (
        <div className={`message-replies ${isCollapsed ? 'collapsed' : ''}`}>
          {message.children.map((child) => (
            <Message 
              key={createMessageKey(child)}
              message={child}
              threadTitle={threadTitle}
              onUpdate={onUpdate}
            />
          ))}
        </div>
      )}
    </div>
  )
} 