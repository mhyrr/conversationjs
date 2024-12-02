# ConversationJS

A GitHub-based conversation platform for collaborative discussions.

## Quick Start

1. Fork this repository
2. Clone your fork:

```bash
git clone https://github.com/your_username/conversationjs.git
cd conversationjs
```

3. Create a GitHub OAuth App:
   - Go to GitHub Settings -> Developer Settings -> OAuth Apps
   - Click "New OAuth App"
   - Set Application Name: "Your Conversation"
   - Homepage URL: `http://localhost:5173`
   - Authorization callback URL: `http://localhost:5173/auth/callback`
   - Save your Client ID and Client Secret

4. Set up environment:

```bash
# Create .env file
echo "VITE_GITHUB_CLIENT_ID=your_client_id" > .env
# Create server/.env file
echo "VITE_GITHUB_CLIENT_ID=your_client_id" > server/.env
echo "VITE_GITHUB_CLIENT_SECRET=your_client_secret" >> server/.env
```


4. Configure participants in participants.json:
 
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

5. Configure environment in config.ts:

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
