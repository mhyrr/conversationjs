const env = import.meta.env.MODE || 'development'
const base = import.meta.env.BASE_URL || '/'

export const config = {
  development: {
    useAuth: false,
    dataSource: 'local',
    conversationPath: '/data/conversation.md'
  },
  production: {
    useAuth: true,
    dataSource: 'local',
    conversationPath: `${base}data/conversation.md`
  }
}[env] 