/**
 * Thread component displays a collapsible thread of messages
 * - Handles collapsing/expanding of the entire thread
 * - Converts flat message array into a nested tree structure
 * - Renders child messages with proper indentation
 */
import { useEffect } from 'react'
import { Message } from './Message'
import type { Thread } from '../utils/markdown'
import { buildMessageTree } from '../utils/tree'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { Button } from './ui/button'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useThreadStore } from '../stores/threads'

interface ThreadProps {
  thread: Thread;
  onUpdate: () => void;
}

const getRelativeTimeString = (timestamp: number): string => {
  const now = Date.now();
  const diffInDays = Math.floor((now - timestamp) / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) {
    const diffInHours = Math.floor((now - timestamp) / (1000 * 60 * 60));
    if (diffInHours === 0) {
      const diffInMinutes = Math.floor((now - timestamp) / (1000 * 60));
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    }
    return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
  } else if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
  } else {
    const weeks = Math.floor(diffInDays / 7);
    return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
  }
};

export function Thread({ thread, onUpdate }: ThreadProps) {
  const expandedThreads = useThreadStore(state => state.expandedThreads);
  const recentThreads = useThreadStore(state => state.recentThreads);
  const { expandThread, collapseThread, updateRecentThreads } = useThreadStore();
  const isCollapsed = !expandedThreads.has(thread.title);
  const messageTree = buildMessageTree(thread.messages);
  const hasRecentMessages = recentThreads.has(thread.title);

  // Find the latest timestamp in the thread
  const latestTimestamp = thread.messages
    .map(msg => new Date(msg.timestamp).getTime())
    .reduce((max, current) => Math.max(max, current), 0);

  // Update recent threads on mount and when messages change
  useEffect(() => {
    updateRecentThreads();
  }, [thread.messages, updateRecentThreads]);

  const relativeTime = getRelativeTimeString(latestTimestamp);
  const formattedDate = new Date(latestTimestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  });

  return (
    <Card 
      className="mb-6" 
      data-thread-title={thread.title}
      data-latest-timestamp={new Date(latestTimestamp).toISOString()}
    >
      <CardHeader className="cursor-pointer" onClick={() => isCollapsed ? expandThread(thread.title) : collapseThread(thread.title)}>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="h-6 w-6 p-0">
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          <div className="flex items-center gap-2">
            <CardTitle>{thread.title}</CardTitle>
            <div className="flex items-center gap-2">
              {hasRecentMessages ? (
                <>
                  <div 
                    className="h-2.5 w-2.5 rounded-full bg-blue-500 animate-pulse" 
                    title="Has messages from the last 24 hours"
                  />
                  <span className="text-xs text-muted-foreground">{formattedDate}</span>
                </>
              ) : (
                <span className="text-xs text-muted-foreground">{relativeTime}</span>
              )}
            </div>
          </div>
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