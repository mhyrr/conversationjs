import { useEffect, useState } from 'react'
import { ThreadList } from './components/ThreadList'
import { useThreads } from './hooks/useThreads'
import { config } from './config'

export function App() {
  const { threads, loading, error } = useThreads()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  return (
    <div className="app">
      <header>
        {/* Temporarily comment out Auth until implemented */}
        {/* <Auth 
          isAuthenticated={isAuthenticated} 
          onAuthChange={setIsAuthenticated} 
        /> */}
      </header>
      <main>
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div>Error: {error}</div>
        ) : (
          <ThreadList threads={threads} />
        )}
      </main>
    </div>
  )
} 