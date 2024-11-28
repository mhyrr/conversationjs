
# Conversation Thread App

A lightweight, markdown-based threaded conversation app using GitHub Pages for hosting and GitHub authentication for participation.

## Features

- Threaded discussions with unlimited nesting depth
- Collapsible message threads
- GitHub-based authentication
- Display names mapped from GitHub usernames
- Works without JavaScript (readable markdown)
- Real-time updates without page rebuilds

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

4. Configure environment in config.js:

```js
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
```

## Development

Run locally:
```bash
npm run dev
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

- Built with vanilla JavaScript and CSS
- Uses Vite for development and building
- GitHub OAuth for authentication
- Markdown as the source of truth
- No database required

### Core Components

- ThreadApp: Main application controller
- UI: Handles rendering and user interactions
- Auth: Manages GitHub authentication and user display names
- ThreadManager: Handles thread operations and state
- LocalDataService/GitHubAPI: Data persistence layer

## License

MIT
