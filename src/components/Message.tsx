import { useState } from 'react'
import type { MessageNode } from '../utils/tree'
import { getCurrentUser } from '../utils/auth'
import { updateMessage, replyToMessage, moveToThread, deleteMessage } from '../utils/api'
import { Card, CardHeader, CardContent, CardFooter } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar'
import { ChevronDown, ChevronRight, Edit2, Reply, Trash2, ArrowUpRight } from 'lucide-react'
import { cn } from '../lib/utils'

interface MessageProps {
  message: MessageNode;
  threadTitle: string;
  onUpdate?: () => void;
  isNested?: boolean;
}

const messageHoverStyle = `
  [data-message-container]:hover [data-message-actions]:has(~ [data-message-container] [data-message-actions]) { opacity: 0; }
  [data-message-container]:hover > [data-message-actions] { opacity: 1; }
`;

if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = messageHoverStyle;
  document.head.appendChild(style);
}

export function Message({ message, threadTitle, onUpdate, isNested = false }: MessageProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isReplying, setIsReplying] = useState(false)
  const [isMoving, setIsMoving] = useState(false)
  const [editContent, setEditContent] = useState(message.content.join('\n'))
  const [replyContent, setReplyContent] = useState('')
  const [newThreadTitle, setNewThreadTitle] = useState('')
  
  const currentUser = getCurrentUser()
  const isOwnMessage = currentUser?.login === message.author
  const displayName = message.author
  const hasChildren = message.children?.length > 0

  const handleEdit = async () => {
    const success = await updateMessage({
      threadTitle,
      messageAuthor: message.author,
      messageTimestamp: message.timestamp,
      newContent: editContent.split('\n')
    });

    if (success) {
      setIsEditing(false);
      onUpdate?.();
    }
  };

  const handleReply = async () => {
    if (!currentUser) return;

    const timestamp = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
    const success = await replyToMessage({
      threadTitle,
      parentAuthor: message.author,
      parentTimestamp: message.timestamp,
      parentContent: message.content,
      content: replyContent.split('\n'),
      author: currentUser.login,
      timestamp
    });

    if (success) {
      setIsReplying(false);
      setReplyContent('');
      onUpdate?.();
    }
  };

  const handleMoveToThread = async () => {
    if (!currentUser) return;

    const success = await moveToThread({
      newTitle: newThreadTitle,
      sourceThreadTitle: threadTitle,
      messageAuthor: message.author,
      messageTimestamp: message.timestamp,
      messageContent: message.content
    });

    if (success) {
      setIsMoving(false);
      setNewThreadTitle('');
      window.location.reload();
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this message?')) {
      return;
    }

    const success = await deleteMessage({
      threadTitle,
      messageAuthor: message.author,
      messageTimestamp: message.timestamp
    });

    if (success) {
      onUpdate?.();
    }
  };

  return (
    <Card className={cn(
      "mb-2",
      isNested 
        ? "ml-4 border-0 shadow-none bg-transparent" 
        : "mb-4 border-0 shadow-none bg-transparent border-b"
    )}>
      <div className="group/msg">
        <CardHeader className="flex flex-row items-center gap-3 py-2">
          {hasChildren && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 p-0 shrink-0"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          )}
          {!hasChildren && <div className="w-6" />}
          <Avatar className="h-8 w-8">
            <AvatarImage src={`https://github.com/${displayName}.png`} alt={displayName} />
            <AvatarFallback>{displayName[0]}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">@{displayName}</span>
            <span className="text-sm text-muted-foreground">{message.timestamp}</span>
          </div>
        </CardHeader>

        <CardContent className={cn(
          "pl-14",
          isNested ? "pb-0 pt-0" : "py-1"
        )}>
          {isEditing ? (
            <div className="space-y-4">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={4}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleEdit}>Save</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              {message.content.map((p, i) => (
                <p key={i} className="whitespace-pre-wrap">{p}</p>
              ))}
            </div>
          )}
        </CardContent>

        {currentUser && (
          <CardFooter className={cn(
            "flex justify-end gap-2 pl-14",
            isNested ? "py-0" : "py-1"
          )}>
            <div className="flex gap-2 ml-auto opacity-0 group-hover/msg:opacity-100 transition-opacity">
              {isOwnMessage ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit2 className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-destructive"
                    onClick={handleDelete}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7"
                    onClick={() => setIsReplying(true)}
                  >
                    <Reply className="mr-2 h-4 w-4" />
                    Reply
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7"
                    onClick={() => setIsMoving(true)}
                  >
                    <ArrowUpRight className="mr-2 h-4 w-4" />
                    Move to Thread
                  </Button>
                </>
              )}
            </div>
          </CardFooter>
        )}

        {isReplying && (
          <CardContent className="border-t pt-3 pl-14">
            <div className="space-y-3">
              <Textarea
                placeholder="Type your reply..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                rows={4}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsReplying(false)}>
                  Cancel
                </Button>
                <Button onClick={handleReply}>Reply</Button>
              </div>
            </div>
          </CardContent>
        )}

        {isMoving && (
          <CardContent className="border-t pt-3 pl-14">
            <div className="space-y-3">
              <Input
                type="text"
                placeholder="New Thread Title"
                value={newThreadTitle}
                onChange={(e) => setNewThreadTitle(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsMoving(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleMoveToThread}
                  disabled={!newThreadTitle.trim()}
                >
                  Move
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </div>

      {!isCollapsed && hasChildren && (
        <CardContent className={cn(
          isNested ? "pt-0 pb-0" : "pt-1 pb-0"
        )}>
          {message.children.map((child) => (
            <Message
              key={child.path}
              message={child}
              threadTitle={threadTitle}
              onUpdate={onUpdate}
              isNested={true}
            />
          ))}
        </CardContent>
      )}
    </Card>
  );
} 