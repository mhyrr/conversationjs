import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthCallback } from './components/AuthCallback';
import { useEffect, useState } from 'react'
import { ThreadList } from './components/ThreadList'
import { useThreads } from './hooks/useThreads'
import { Auth } from './components/Auth'
import participants from '../participants.json'

export function App() {
  const { threads, triggerUpdate } = useThreads()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  
  const checkAuth = () => {
    setIsAuthenticated(!!localStorage.getItem('github_user'))
  }
  
  useEffect(() => {
    checkAuth()
    window.addEventListener('storage', checkAuth)
    return () => window.removeEventListener('storage', checkAuth)
  }, [])

  const basePath = import.meta.env.BASE_URL
  const showContent = participants.settings.allow_public_view || isAuthenticated

  return (
    <BrowserRouter basename={basePath.replace(/\/$/, '')}>
      <Auth onAuthChange={checkAuth} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <Routes>
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/" element={
            showContent ? (
              <>
                <header className="mb-8">
                  <h1 className="text-2xl font-bold text-gray-900">Conversation Threads</h1>
                </header>
                <ThreadList threads={threads} onUpdate={triggerUpdate} />
              </>
            ) : (
              <div className="text-center mt-20">
                <h2 className="text-xl text-gray-900 mb-4">
                  This conversation is private to the participants.
                </h2>
                <p className="text-gray-600">
                  If you're one of them, please log in!
                </p>
              </div>
            )
          } />
        </Routes>
      </div>
    </BrowserRouter>
  )
} 