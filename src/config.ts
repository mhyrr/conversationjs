const env = import.meta.env.MODE
const base = import.meta.env.BASE_URL

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
    conversationPath: `${base}data/conversation.md`,
    faviconPath: `${base}favicon.svg`
  }
}[env] 