import { useEffect, useState } from 'react';
import { useUpdatesStore } from '../stores/updates';
import { authenticateWithGithub, getCurrentUser, logout, GithubUser } from '../utils/auth';
import { config } from '../config';
import { Button } from './ui/button';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { UsersDropdown } from './UsersDropdown';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu"
import config from '../../participants.json';

interface HeaderProps {
  onAuthChange?: () => void;
}

export function Header({ onAuthChange }: HeaderProps) {
  const { pendingUpdates, lastUpdateTime } = useUpdatesStore();
  const [user, setUser] = useState<GithubUser | null>(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  useEffect(() => {
    if (lastUpdateTime && pendingUpdates > 0) {
      // Check GitHub deployment status every 10 seconds
      const interval = setInterval(async () => {
        try {
          const response = await fetch(`https://api.github.com/repos/${config.repo.owner}/${config.repo.name}/actions/runs?status=completed&per_page=1`);
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

  const handleLogout = () => {
    logout();
    setUser(null);
    onAuthChange?.();
  };

  return (
    <div className="w-full bg-background border-b fixed top-0 z-50">
      <div className="flex h-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 items-center justify-between">
        <div className="flex items-center">
          <img 
            className="h-8 w-auto" 
            src={config?.faviconPath || '/favicon.svg'}
            alt="ConversationJS" 
          />
          <span className="ml-2 text-lg font-semibold">ConversationJS</span>
        </div>

        <div className="flex items-center gap-4">
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
              <span className="hidden sm:inline">Updates Pending</span>
            </div>
          )}

          <UsersDropdown />

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage 
                      src={user.avatar_url || `https://github.com/${user.login}.png`} 
                      alt={user.login} 
                    />
                    <AvatarFallback>{user.login[0]}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">@{user.login}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.name || user.login}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={() => authenticateWithGithub()}>
              Sign in with GitHub
            </Button>
          )}
        </div>
      </div>
    </div>
  );
} 