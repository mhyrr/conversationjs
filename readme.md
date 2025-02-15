# ConversationJS

A GitHub-based conversation platform for collaborative discussions.

## Quick Start

1. Fork this repository
2. Clone your fork:

```bash
git clone https://github.com/your_username/conversationjs.git
cd conversationjs
```

3. Create GitHub OAuth Apps:

   For Local Development:
   - Go to GitHub Settings -> Developer Settings -> OAuth Apps
   - Click "New OAuth App"
   - Set Application Name: "ConversationJS Dev"
   - Homepage URL: `http://localhost:5173`
   - Authorization callback URL: `http://localhost:5173/auth/callback`
   - Save your Client ID and Client Secret

   For Vercel Deployment:
   - Create another OAuth App
   - Set Application Name: "ConversationJS Prod"
   - Homepage URL: `https://your-app-name.vercel.app`
   - Authorization callback URL: `https://your-app-name.vercel.app/auth/callback`
   - Save your Client ID and Client Secret

4. Set up environment:

   Add the Client ID and Client Secret from your OAuth App to your Github secrets

   For Local Development:
   ```bash
   # Create .env file
   echo "VITE_APP_GH_CLIENT_ID=your_dev_client_id" > .env
   # Create server/.env file
   echo "VITE_APP_GH_CLIENT_ID=your_dev_client_id" > server/.env
   echo "VITE_APP_GH_CLIENT_SECRET=your_dev_client_secret" >> server/.env
   ```

   For Vercel Deployment:
   - Go to your Vercel project settings
   - Add Environment Variables:
     - `VITE_APP_GH_CLIENT_ID`: Your production OAuth app client ID
     - `VITE_APP_GH_CLIENT_SECRET`: Your production OAuth app client secret

6. Configure participants in participants.json:
 
```json
{
    "participants": [
        {
            "username": "participant1",
            "displayName": "Participant One"
        },
        {
            "username": "participant2",
            "displayName": "Participant Two"
        }
    ],
    "settings": {
        "allow_public_view": true
    }
}
```

## Development

Run locally:
```bash
npm install

# Terminal 1: Run the development server
npm run dev

# Terminal 2: Run the auth proxy server (required for GitHub OAuth)
npm run server
```

The app will be available at `http://localhost:5173`. Both servers are required for local development with GitHub authentication.

Run tests:
```bash
npm test
```

## Deployment

1. Push your changes to GitHub
2. Import your repository in Vercel
3. Configure environment variables as described above in Vercel (VITE_APP_GH_CLIENT_ID, VITE_APP_GH_CLIENT_SECRET)
4. Deploy!

## Data Structure

Conversations are stored in Markdown format:

```markdown
### Thread Title
- @username [timestamp]: Message content
  - @username2 [timestamp]: Reply content
    - @username3 [timestamp]: Nested reply
```

## Technical Details

- Built with React 18 and TypeScript
- Uses Vite for development and building
- Uses shadcn/ui components
- GitHub OAuth for authentication
- Markdown as the source of truth
- No database required

## License

MIT
