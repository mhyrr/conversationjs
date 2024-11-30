# Conversation Thread App

A lightweight, markdown-based threaded conversation app using GitHub Pages for hosting and GitHub authentication for participation.

## Features

- Threaded discussions with unlimited nesting depth
- Collapsible message threads
- GitHub-based authentication
- Display names mapped from GitHub usernames
- Works without JavaScript (readable markdown)
- Real-time updates without page rebuilds
- React-based UI components
- Full test coverage with Jest

## Setup

1. Clone the repository
2. Install dependencies:

```bash
install
```
3. Configure participants in participants.json:
 
```json
{
    "participants": [
        {
            "username": "wsdoun",
            "displayName": "Sywei Doun",
            "avatarUrl": "https://github.com/wsdoun.png"
        },
        {
            "username": "grolsen",
            "displayName": "Greg Olsen",
            "avatarUrl": "https://github.com/mhyrr.png"
        }
    ],
    "settings": {
        "allow_public_view": true,
        "allow_reactions": true,
        "require_approval": false
    }
}
```

4. Configure environment in config.ts:

```typescript
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
```

## Development

Run locally:
```bash
npm run dev
```

Run tests:
```bash
npm test
```

Build for production:

```bash
npm run prod
```

## Data Structure

Conversations (Markdown)

```markdown
### Thread Title [collapsed=false]
- @username [timestamp]: Message content
  - @username2 [timestamp]: Reply content
    - @username3 [timestamp]: Nested reply
```


## User Configuration   

Participants are configured in participants.json with GitHub usernames mapped to display names.

## Technical Details

- Built with React 18 and TypeScript
- Uses Vite for development and building
- Jest + Testing Library for testing
- GitHub OAuth for authentication
- Markdown as the source of truth
- No database required

### Core Components

- ThreadApp: Main React application
- Thread: Handles thread rendering and state
- Message: Individual message component with collapsing
- ThreadManager: Handles thread operations and state
- LocalDataService/GitHubAPI: Data persistence layer

## License

MIT
