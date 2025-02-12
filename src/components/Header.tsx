import { useEffect } from 'react';
import { useUpdatesStore } from '../stores/updates';
import { getCurrentUser } from '../utils/auth';

export function Header() {
  const { pendingUpdates, lastUpdateTime } = useUpdatesStore();
  const currentUser = getCurrentUser();

  useEffect(() => {
    if (lastUpdateTime && pendingUpdates > 0) {
      // Check GitHub deployment status every 10 seconds
      const interval = setInterval(async () => {
        try {
          const response = await fetch('https://api.github.com/repos/mhyrr/conversationjs/actions/runs?status=completed&per_page=1');
          const data = await response.json();
          
          if (data.workflow_runs?.length > 0) {
            const latestRun = data.workflow_runs[0];
            if (new Date(latestRun.updated_at).getTime() > lastUpdateTime) {
              // A deployment completed after our last update
              window.location.reload();
            }
          }
        } catch (error) {
          console.error('Failed to check deployment status:', error);
        }
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [lastUpdateTime, pendingUpdates]);

  return (
    <header className="flex justify-between items-center p-2 bg-gray-100 fixed w-full top-0 z-50 shadow-sm">
      <h1 className="text-lg font-semibold">ConversationJS</h1>
      <div className="flex items-center gap-3">
        {pendingUpdates > 0 && (
          <div className="flex items-center text-yellow-600 text-sm">
            <svg width="12" height="12" className="animate-spin mr-2" viewBox="0 0 12 12">
              <circle 
                cx="6" 
                cy="6" 
                r="5" 
                stroke="currentColor" 
                strokeWidth="2" 
                fill="none" 
                className="opacity-25"
              />
              <path 
                d="M6 1C3.24 1 1 3.24 1 6" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round"
                className="opacity-75"
              />
            </svg>
            Updates Pending
          </div>
        )}
        {currentUser && (
          <div className="flex items-center gap-2">
            <img 
              src={`https://github.com/${currentUser.login}.png?size=48`} 
              alt={currentUser.login}
              className="w-6 h-6 rounded-full"
            />
            <span className="text-sm text-gray-700">{currentUser.login}</span>
          </div>
        )}
      </div>
    </header>
  );
} 