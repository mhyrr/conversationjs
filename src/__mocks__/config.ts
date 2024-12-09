export const config = {
  MODE: 'test',
  useAuth: true,
  dataSource: 'local',
  conversationPath: '/data/conversation.md',
  faviconPath: '/favicon.svg',
  PROD: {
    clientId: 'test-client-id',
    redirectUri: 'http://localhost:3000/callback'
  }
} 