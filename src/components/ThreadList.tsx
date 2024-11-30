import React from 'react'
import { Thread as ThreadComponent } from './Thread'
import type { Thread } from '../utils/markdown'

interface ThreadListProps {
  threads: Thread[]
}

export function ThreadList({ threads }: ThreadListProps) {
  return (
    <div className="thread-list">
      {threads.map(thread => (
        <ThreadComponent key={thread.title} thread={thread} />
      ))}
    </div>
  )
} 