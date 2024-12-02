import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthCallback } from './components/AuthCallback';
import { useEffect, useState } from 'react'
import { ThreadList } from './components/ThreadList'
import { useThreads } from './hooks/useThreads'
import { Auth } from './components/Auth'

export function App() {
  const { threads, loading, error } = useThreads()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  
  // Get base path from Vite config
  const basePath = import.meta.env.BASE_URL

  return (
    <BrowserRouter basename={basePath}>
      <Auth />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Conversation Threads</h1>
        </header>
        
        <Routes>
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/" element={<ThreadList threads={threads} />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
} 