const env = import.meta.env.MODE

export const config = {
  development: {
    useAuth: true,
    dataSource: 'local',
    conversationPath: '/data/conversation.md',
    faviconPath: '/favicon.svg'
  },
  production: {
    useAuth: true,
    dataSource: 'local',
    conversationPath: '/data/conversation.md',
    faviconPath: '/favicon.svg'
  }
}[env];

export { config }; 