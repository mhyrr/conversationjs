import { useState, useEffect } from 'react'
import { config } from '../config'
import { Thread } from '../utils/markdown'

export function useThreads() {
  const [threads, setThreads] = useState<Thread[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchThreads() {
      try {
        const response = await fetch(config?.conversationPath || '/data/conversation.md')
        const markdown = await response.text()
        const parsedThreads = parseMarkdown(markdown)
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