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
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { Button } from './ui/button'
import { ChevronDown, ChevronRight } from 'lucide-react'

interface ThreadProps {
  thread: Thread;
  onUpdate: () => void;
}

export function Thread({ thread, onUpdate }: ThreadProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const messageTree = buildMessageTree(thread.messages);

  return (
    <Card className="mb-6">
      <CardHeader className="cursor-pointer" onClick={() => setIsCollapsed(!isCollapsed)}>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="h-6 w-6 p-0">
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          <CardTitle>{thread.title}</CardTitle>
        </div>
      </CardHeader>
      
      {!isCollapsed && (
        <CardContent>
          {messageTree.map((message) => (
            <Message
              key={`${message.author}-${message.timestamp}-${message.depth}`}
              message={message}
              threadTitle={thread.title}
              onUpdate={onUpdate}
            />
          ))}
        </CardContent>
      )}
    </Card>
  );
} 