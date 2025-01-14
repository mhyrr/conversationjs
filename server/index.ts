import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fetch from 'node-fetch';
import { setupViteRewrite } from './vite.middleware.js';
import fs from 'fs/promises';
import path from 'path';
import { 
  updateMarkdownContent, 
  addReplyToMarkdown, 
  createNewThread,
  moveMessageToThread, 
  deleteMessageFromMarkdown 
} from '../src/shared/markdown-operations';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env from server directory
dotenv.config({ path: join(__dirname, '.env') });

const app = express();
app.use(cors({
  origin: ['http://localhost:5173', 'https://mhyrr.github.io'],
  credentials: true
}));
app.use(express.json());

app.post('/auth/token', async (req: express.Request, res: express.Response) => {
  const { code } = req.body;

  if (!process.env.VITE_APP_GH_CLIENT_ID || !process.env.VITE_APP_GH_CLIENT_SECRET) {
    console.error('Missing GitHub credentials in environment');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.VITE_APP_GH_CLIENT_ID,
        client_secret: process.env.VITE_APP_GH_CLIENT_SECRET,
        code,
      }),
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Token exchange error:', error);
    res.status(500).json({ error: 'Failed to exchange token' });
  }
});

app.post('/api/messages/update', async (req, res) => {
  const update = req.body;
  console.log('Received update request:', update);

  try {
    const mdPath = join(process.cwd(), 'public/data/conversation.md');
    const content = await fs.readFile(mdPath, 'utf-8');
    const updatedContent = updateMarkdownContent(content, update);
    await fs.writeFile(mdPath, updatedContent);
    res.json({ success: true });
  } catch (err) {
    console.error('Failed to update message:', err);
    res.status(500).json({ error: 'Failed to update message' });
  }
});

app.post('/api/messages/reply', async (req, res) => {
  try {
    console.log('Received reply request:', req.body);
    const mdPath = join(process.cwd(), 'public/data/conversation.md');
    const content = await fs.readFile(mdPath, 'utf-8');
    const updatedContent = addReplyToMarkdown(content, req.body);
    await fs.writeFile(mdPath, updatedContent, 'utf-8');
    res.json({ success: true });
  } catch (err) {
    console.error('Failed to add reply:', err);
    res.status(500).json({ error: 'Failed to add reply' });
  }
});

app.post('/api/threads/create', async (req, res) => {
  try {
    console.log('Received create thread request:', req.body);
    const mdPath = join(process.cwd(), 'public/data/conversation.md');
    const content = await fs.readFile(mdPath, 'utf-8');
    const updatedContent = createNewThread(content, req.body);
    await fs.writeFile(mdPath, updatedContent, 'utf-8');
    res.json({ success: true });
  } catch (err) {
    console.error('Failed to create thread:', err);
    res.status(500).json({ error: 'Failed to create thread' });
  }
});

app.post('/api/threads/move', async (req, res) => {
  try {
    console.log('Received move to thread request:', req.body);
    const mdPath = join(process.cwd(), 'public/data/conversation.md');
    const content = await fs.readFile(mdPath, 'utf-8');
    const updatedContent = moveMessageToThread(content, req.body);
    await fs.writeFile(mdPath, updatedContent, 'utf-8');
    res.json({ success: true });
  } catch (err) {
    console.error('Failed to move message:', err);
    res.status(500).json({ error: 'Failed to move message' });
  }
});

app.post('/api/messages/delete', async (req, res) => {
  try {
    console.log('\nDelete request:', req.body);
    const filePath = path.join(__dirname, '../public/data/conversation.md');
    const content = await fs.readFile(filePath, 'utf8');
    const updatedContent = deleteMessageFromMarkdown(content, req.body);
    await fs.writeFile(filePath, updatedContent);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

// Add the rewrite middleware
setupViteRewrite(app);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 