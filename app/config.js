const configs = {
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
};

export const config = configs[process.env.NODE_ENV || 'development']; 