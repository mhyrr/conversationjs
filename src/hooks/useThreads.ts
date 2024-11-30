import { useState, useEffect } from 'react'
import { config } from '../config'
import { parseMarkdown } from '../utils/markdown'
import type { Thread } from '../utils/markdown'

export function useThreads() {
  const [threads, setThreads] = useState<Thread[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchThreads() {
      try {
        const response = await fetch(config.conversationPath)
        const markdown = await response.text()
        const parsedThreads = parseMarkdown(markdown)
        setThreads(parsedThreads)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load threads')
      } finally {
        setLoading(false)
      }
    }

    fetchThreads()
  }, [])

  return { threads, loading, error }
} 