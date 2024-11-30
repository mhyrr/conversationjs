const env = import.meta.env.MODE || 'development'

export const config = {
  development: {
    useAuth: false,
    dataSource: 'local',
    conversationPath: '/data/conversation.md'
  },
  production: {
    useAuth: true,
    dataSource: 'github',
    repo: 'your_username/repo_name',
    branch: 'main'
  }
}[env] 