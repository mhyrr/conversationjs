import { useState, useEffect, Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { authenticateWithGithub, getCurrentUser, logout, GithubUser } from '../utils/auth';

export function Auth() {
  const [user, setUser] = useState<GithubUser | null>(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  const handleLogout = () => {
    logout();
    setUser(null);
  };

  const headerContent = (
    <div className="flex justify-between h-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex-shrink-0 flex items-center">
        <img className="h-8 w-auto" src="/favicon.svg" alt="ConversationJS" />
        <span className="ml-2 text-lg font-semibold text-gray-900">ConversationJS</span>
      </div>
      
      <div className="flex items-center">
        {user ? (
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center max-w-xs rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <img
                className="h-8 w-8 rounded-full object-cover flex-shrink-0"
                src={`${user.avatar_url}?size=32`}
                alt={user.login}
                width="32"
                height="32"
                loading="eager"
              />
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 py-1 focus:outline-none">
                <Menu.Item>
                  {({ active }) => (
                    <div className="px-4 py-2 text-sm text-gray-700">
                      Signed in as <span className="font-medium">{user.name || user.login}</span>
                    </div>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={handleLogout}
                      className={`${
                        active ? 'bg-gray-100' : ''
                      } block px-4 py-2 text-sm text-gray-700 w-full text-left hover:bg-gray-100`}
                    >
                      Sign out
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>
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
  );

  return (
    <div className="w-full bg-white border-b border-gray-200 fixed top-0 z-50">
      {headerContent}
    </div>
  );
} 