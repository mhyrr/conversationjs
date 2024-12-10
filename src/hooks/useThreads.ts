import { useState, useEffect, useCallback } from 'react'
import { Thread, parseMarkdown } from '../utils/markdown'

export function useThreads() {
  const [threads, setThreads] = useState<Thread[]>([])
  const [lastUpdate, setLastUpdate] = useState(Date.now())

  const refreshThreads = useCallback(async () => {
    try {
      const response = await fetch('/data/conversation.md')
      const content = await response.text()
      const parsedThreads = parseMarkdown(content)
      setThreads(parsedThreads)
    } catch (error) {
      console.error('Failed to fetch threads:', error)
    }
  }, [])

  // Initial load
  useEffect(() => {
    refreshThreads()
  }, [refreshThreads])

  // Refresh when lastUpdate changes
  useEffect(() => {
    refreshThreads()
  }, [lastUpdate, refreshThreads])

  const triggerUpdate = () => {
    setLastUpdate(Date.now())
  }

  return { threads, refreshThreads, triggerUpdate }
} 