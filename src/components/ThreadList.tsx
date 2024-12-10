import React, { useState } from 'react'
import { Thread as ThreadComponent } from './Thread'
import type { Thread } from '../utils/markdown'
import { getCurrentUser } from '../utils/auth'
import { createThread } from '../utils/api'

interface ThreadListProps {
  threads: Thread[];
  onUpdate: () => void;
}

export function ThreadList({ threads, onUpdate }: ThreadListProps) {
  return (
    <div className="thread-list">
      {threads.map((thread) => (
        <ThreadComponent 
          key={thread.title} 
          thread={thread} 
          onUpdate={onUpdate}
        />
      ))}
    </div>
  );
} 