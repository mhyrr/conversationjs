import React, { useState } from 'react'
import { Thread as ThreadComponent } from './Thread'
import type { Thread } from '../utils/markdown'
import { getCurrentUser } from '../utils/auth'
import { createThread } from '../utils/api'
import { Card, CardHeader, CardContent, CardFooter } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Plus } from 'lucide-react'

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
    <div className="space-y-6">
      {threads.map((thread) => (
        <ThreadComponent 
          key={thread.title} 
          thread={thread} 
          onUpdate={onUpdate}
        />
      ))}

      {currentUser && (
        <Card className="mt-8">
          {isCreating ? (
            <>
              <CardHeader>
                <Input
                  type="text"
                  placeholder="Thread Title"
                  value={newThreadTitle}
                  onChange={(e) => setNewThreadTitle(e.target.value)}
                />
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Initial Message"
                  value={initialMessage}
                  onChange={(e) => setInitialMessage(e.target.value)}
                  rows={4}
                />
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsCreating(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateThread}
                  disabled={!newThreadTitle.trim() || !initialMessage.trim()}
                >
                  Create Thread
                </Button>
              </CardFooter>
            </>
          ) : (
            <Button
              variant="outline"
              className="w-full h-24 border-dashed"
              onClick={() => setIsCreating(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Start a New Thread
            </Button>
          )}
        </Card>
      )}
    </div>
  );
} 