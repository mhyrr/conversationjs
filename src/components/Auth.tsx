import { useState, useEffect } from 'react';
import { authenticateWithGithub, getCurrentUser, logout, GithubUser } from '../utils/auth';
import { config } from '../config';

export function Auth() {
  const [user, setUser] = useState<GithubUser | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  const handleLogout = () => {
    logout();
    setUser(null);
    setShowDropdown(false);
  };

  return (
    <div className="w-full bg-white border-b border-gray-200 fixed top-0 z-50">
      <div className="flex justify-between h-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex-shrink-0 flex items-center">
          <img 
            className="h-8 w-auto" 
            src={config?.faviconPath || '/favicon.svg'}
            alt="ConversationJS" 
          />
          <span className="ml-2 text-lg font-semibold text-gray-900">ConversationJS</span>
        </div>
        
        <div className="flex items-center">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center max-w-xs rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <img
                  className="h-8 w-8 rounded-full object-cover flex-shrink-0"
                  src={`${user.avatar_url}?size=32`}
                  alt={user.login}
                  width="32"
                  height="32"
                />
              </button>
              
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 py-1">
                  <div className="px-4 py-2 text-sm text-gray-700">
                    Signed in as <span className="font-medium">{user.name || user.login}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => authenticateWithGithub()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sign in with GitHub
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 