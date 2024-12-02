import React from 'react'
import { Thread as ThreadComponent } from './Thread'
import type { Thread } from '../utils/markdown'

interface Thread {
  title: string;
  content: string;
  collapsed?: boolean;
}

interface ThreadListProps {
  threads: Thread[];
}

export function ThreadList({ threads }: ThreadListProps) {
  return (
    <div className="space-y-6">
      {threads.map((thread, index) => (
        <div key={index} className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">{thread.title}</h2>
          <div className="prose">{thread.content}</div>
        </div>
      ))}
    </div>
  );
} 