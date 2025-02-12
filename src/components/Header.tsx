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
            <svg className="animate-spin h-3 w-3 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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