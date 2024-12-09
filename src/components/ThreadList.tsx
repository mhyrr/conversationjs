import React, { useState } from 'react'
import { Thread as ThreadComponent } from './Thread'
import type { Thread } from '../utils/markdown'
import { getCurrentUser } from '../utils/auth'
import { createThread } from '../utils/api'

interface ThreadListProps {
  threads: Thread[]
}

export function ThreadList({ threads }: ThreadListProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [newThreadTitle, setNewThreadTitle] = useState('')
  const [initialMessage, setInitialMessage] = useState('')
  const currentUser = getCurrentUser()

  const handleCreateThread = async () => {
    if (!currentUser) return;

    const success = await createThread({
      title: newThreadTitle,
      initialMessage: initialMessage ? {
        content: initialMessage.split('\n'),
        author: currentUser.login
      } : undefined
    });

    if (success) {
      setIsCreating(false);
      setNewThreadTitle('');
      setInitialMessage('');
      // Trigger refresh of thread list
      window.location.reload();
    }
  };

  return (
    <div className="thread-list">
      {threads.map(thread => (
        <ThreadComponent key={thread.title} thread={thread} />
      ))}
      
      {currentUser && (
        <div className="mt-8">
          {isCreating ? (
            <div className="bg-white p-4 rounded-lg shadow">
              <input
                type="text"
                placeholder="Thread Title"
                value={newThreadTitle}
                onChange={(e) => setNewThreadTitle(e.target.value)}
                className="w-full p-2 border rounded mb-4"
              />
              <textarea
                placeholder="Initial message (optional)"
                value={initialMessage}
                onChange={(e) => setInitialMessage(e.target.value)}
                className="w-full p-2 border rounded mb-4"
                rows={4}
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 text-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateThread}
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                  disabled={!newThreadTitle.trim()}
                >
                  Create Thread
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsCreating(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              New Thread
            </button>
          )}
        </div>
      )}
    </div>
  )
} 