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
    "repo": {
      ...
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
3. Make sure all participants have write access to the repository
4. We're using the Github API actions to commit updates. Go to Repository Settings > Actions > General and make sure Workflow has Read/Write Permissions
5. Configure environment variables as described above in Vercel (VITE_APP_GH_CLIENT_ID, VITE_APP_GH_CLIENT_SECRET)
6. Free Vercel deployments are currently limited to one user in the repository.  See the **Autocommit Deploy Workaround** below for how to deal with this.
7. Deploy!

(Note: Your Github Pages deployments will fail if your repo is private and you have a free plan. Doesn't matter for Vercel hosting)

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

## Autocommit Deploy Workaround

Vercel only allows the repository owner commits to trigger deploys. We can work around that using Github Actions.

1. In your repository, click on the "Actions" tab at the top
2. Click the "New workflow" button
3. Click "set up a workflow yourself" (usually a link at the top)
4. This will create a new .yml file in .github/workflows - name it something like auto-owner-commit.yml
5. Copy and paste the workflow code below.
6. Go to your GitHub profile settings - Scroll down to "Developer settings" on the left
7. Click "Personal access tokens" → "Tokens (classic) - Generate a new token with repo scope, make sure it has read/write commit access to your repository.
8. Copy this token
9. Go to your repository's "Settings" tab, Click "Secrets and variables" in the left sidebar, Click "Actions"
10. Click "New repository secret"
11. Name it PAT_TOKEN
12. Set 'ContributorA' to whoever is not the owner of your conversation repository

Now, every time contributorA commits, the owner will have a dummy commit to the ```.timestamp``` file, which will properly trigger a deploy.

```
name: Auto Owner Commit
on:
  push:
    branches:
      - main  # or any branch you want to monitor

jobs:
  auto-commit:
    runs-on: ubuntu-latest
    
    # Only run if the commit is from the specified contributor
    if: github.event.head_commit.author.name == 'ContributorA'
    
    steps:
      - uses: actions/checkout@v3
        with:
          # Important: Use a personal access token to trigger subsequent workflows
          token: ${{ secrets.PAT_TOKEN }}
          
      - name: Configure Git
        run: |
          git config --global user.name "Repository Owner"
          git config --global user.email "owner@example.com"
          
      - name: Create automated commit
        run: |
          # Update a timestamp file
          date > .timestamp
          
          # Stage and commit the changes
          git add .timestamp
          git commit -m "Auto-commit following ContributorA's changes"
          
      - name: Push changes
        run: git push
```

## License

MIT
