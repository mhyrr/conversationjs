import { useState, useEffect } from 'react'
import { config } from '../config'

interface Thread {
  title: string;
  content: string;
  collapsed?: boolean;
}

export function useThreads() {
  const [threads, setThreads] = useState<Thread[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchThreads() {
      try {
        const response = await fetch(config.conversationPath)
        if (!response.ok) {
          throw new Error('Failed to fetch conversation')
        }
        const text = await response.text()
        
        // Basic parsing of markdown into threads
        const threadMatches = text.split(/###\s+/).filter(Boolean)
        const parsedThreads = threadMatches.map(thread => {
          const [title, ...content] = thread.split('\n').filter(Boolean)
          return {
            title: title.trim(),
            content: content.join('\n').trim(),
            collapsed: title.includes('[collapsed=true]')
          }
        })
        
        setThreads(parsedThreads)
      } catch (err) {
        console.error('Error fetching threads:', err)
        setError(err instanceof Error ? err : new Error('Unknown error'))
      } finally {
        setLoading(false)
      }
    }

    fetchThreads()
  }, [])

  return { threads, loading, error }
} 