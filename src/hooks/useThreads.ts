import { useState, useEffect } from 'react'
import { config } from '../config'

export function useThreads() {
  const [threads, setThreads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchThreads() {
      try {
        const response = await fetch(config.conversationPath)
        if (!response.ok) {
          throw new Error('Failed to fetch conversation')
        }
        const text = await response.text()
        // Process markdown text into threads
        setThreads(text)
      } catch (err) {
        console.error('Error fetching threads:', err)
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    fetchThreads()
  }, [])

  return { threads, loading, error }
} 