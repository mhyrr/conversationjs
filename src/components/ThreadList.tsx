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
  const [isCreating, setIsCreating] = useState(false);
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [initialMessage, setInitialMessage] = useState('');
  const currentUser = getCurrentUser();

  const handleCreateThread = async () => {
    if (!currentUser) return;

    const success = await createThread({
      title: newThreadTitle,
      initialMessage: {
        content: initialMessage.split('\n'),
        author: currentUser.login
      }
    });

    if (success) {
      setIsCreating(false);
      setNewThreadTitle('');
      setInitialMessage('');
      onUpdate();
    }
  };

  return (
    <div className="thread-list">
      {threads.map((thread) => (
        <ThreadComponent 
          key={thread.title} 
          thread={thread} 
          onUpdate={onUpdate}
        />
      ))}

      {currentUser && (
        <div className="mt-8 border-t pt-4">
          {isCreating ? (
            <div className="new-thread-form">
              <input
                type="text"
                placeholder="Thread Title"
                value={newThreadTitle}
                onChange={(e) => setNewThreadTitle(e.target.value)}
                className="w-full p-2 border rounded mb-2"
              />
              <textarea
                placeholder="Initial Message"
                value={initialMessage}
                onChange={(e) => setInitialMessage(e.target.value)}
                className="w-full p-2 border rounded mb-2"
                rows={4}
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsCreating(false)}
                  className="px-3 py-1 text-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateThread}
                  className="px-3 py-1 bg-blue-500 text-white rounded"
                  disabled={!newThreadTitle.trim() || !initialMessage.trim()}
                >
                  Create Thread
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsCreating(true)}
              className="w-full p-2 border-2 border-dashed border-gray-300 rounded text-gray-500 hover:border-blue-500 hover:text-blue-500"
            >
              Start a New Thread
            </button>
          )}
        </div>
      )}
    </div>
  );
} 