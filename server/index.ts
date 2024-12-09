import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fetch from 'node-fetch';
import { setupViteRewrite } from './vite.middleware.js';
import fs from 'fs/promises';

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

// Helper to update markdown content
function updateMarkdownContent(content: string, update: any): string {
  console.log('Updating markdown for thread:', update.threadTitle);
  const lines = content.split('\n');
  let inTargetThread = false;
  let inTargetMessage = false;
  let currentIndent = '';
  const newLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('### ')) {
      inTargetThread = line.includes(update.threadTitle);
      console.log('Found thread:', line, 'isTarget:', inTargetThread);
      newLines.push(line);
      continue;
    }

    if (inTargetThread && line.match(/^\s*- @/)) {
      const indentMatch = line.match(/^(\s*)/);
      currentIndent = indentMatch ? indentMatch[1] : '';
      
      const messageMatch = line.match(/- @(\w+) \[(.*?)\]:/);
      if (messageMatch && 
          messageMatch[1] === update.messageAuthor && 
          messageMatch[2] === update.messageTimestamp) {
        console.log('Found target message:', line);
        inTargetMessage = true;
        // Preserve the original indentation
        newLines.push(`${currentIndent}- @${update.messageAuthor} [${update.messageTimestamp}]: ${update.newContent[0]}`);
        for (let j = 1; j < update.newContent.length; j++) {
          newLines.push(`${currentIndent}  ${update.newContent[j]}`);
        }
        continue;
      }
    }

    if (!inTargetMessage) {
      newLines.push(line);
    } else if (line.match(/^\s*- @/) || line.startsWith('### ')) {
      inTargetMessage = false;
      newLines.push(line);
    }
  }

  return newLines.join('\n');
}

// Helper to add a reply to markdown content
function addReplyToMarkdown(content: string, reply: any): string {
  console.log('Adding reply in thread:', reply.threadTitle);
  console.log('Looking for parent content:', reply.parentContent);
  
  const lines = content.split('\n');
  let inTargetThread = false;
  let collectingContent = false;
  let currentContent: string[] = [];
  let replyAdded = false;
  let lastIndent = 0;
  const newLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const nextLine = lines[i + 1] || '';
    
    // Check for thread title
    if (line.startsWith('### ')) {
      inTargetThread = line.includes(reply.threadTitle);
      collectingContent = false;
      currentContent = [];
      console.log('Found thread:', line, 'isTarget:', inTargetThread);
      newLines.push(line);
      continue;
    }

    // Process message lines
    const messageMatch = line.match(/^(\s*)- @(\w+) \[(.*?)\]: (.*)/);
    if (messageMatch) {
      // If we were collecting content, check if it matches
      if (collectingContent) {
        console.log('Comparing collected content:', currentContent, 'with parent:', reply.parentContent);
        if (JSON.stringify(currentContent) === JSON.stringify(reply.parentContent) && !replyAdded) {
          // Add reply before moving to next message
          const replyIndent = ' '.repeat(lastIndent + 2);
          newLines.push(`${replyIndent}- @${reply.author} [${new Date().toISOString().split('T')[0]}]: ${reply.content[0]}`);
          for (let j = 1; j < reply.content.length; j++) {
            newLines.push(`${replyIndent}  ${reply.content[j]}`);
          }
          replyAdded = true;
          console.log('Added reply after matching content');
        }
      }

      // Start collecting new message content if it matches author and timestamp
      const [, indent, author, timestamp, firstLine] = messageMatch;
      lastIndent = indent.length;
      if (inTargetThread && 
          author === reply.parentAuthor && 
          timestamp === reply.parentTimestamp) {
        collectingContent = true;
        currentContent = [firstLine];
        console.log('Started collecting content for:', author, timestamp);
      } else {
        collectingContent = false;
        currentContent = [];
      }
      newLines.push(line);
      continue;
    }

    // Collect continued message content
    if (collectingContent && line.trim() && !line.match(/^\s*- @/)) {
      currentContent.push(line.trim());
      console.log('Collected additional line:', line.trim());
    }

    newLines.push(line);

    // Check if we need to add reply after collecting all content
    if (collectingContent && 
        !replyAdded && 
        JSON.stringify(currentContent) === JSON.stringify(reply.parentContent) &&
        (nextLine.match(/^\s*- @/) || nextLine.startsWith('### ') || !nextLine)) {
      const replyIndent = ' '.repeat(lastIndent + 2);
      // Add newline before reply if there isn't one
      if (newLines[newLines.length - 1].trim() !== '') {
        newLines.push('');
      }
      newLines.push(`${replyIndent}- @${reply.author} [${new Date().toISOString().split('T')[0]}]: ${reply.content[0]}`);
      for (let j = 1; j < reply.content.length; j++) {
        newLines.push(`${replyIndent}  ${reply.content[j]}`);
      }
      // Add newline after reply
      newLines.push('');
      replyAdded = true;
      console.log('Added reply after full content match');
    }
  }

  return newLines.join('\n');
}

// Helper to create a new thread
function createNewThread(content: string, thread: any): string {
  console.log('Creating new thread:', thread.title);
  const lines = content.split('\n');
  const newLines: string[] = [];
  let addedThread = false;

  // Find the right place to add the new thread (after any existing threads)
  for (let i = 0; i < lines.length; i++) {
    newLines.push(lines[i]);
    
    if (!addedThread && (i === lines.length - 1 || 
        (i < lines.length - 1 && lines[i + 1].startsWith('### ')))) {
      // Ensure we have a blank line before new thread
      if (newLines[newLines.length - 1].trim() !== '') {
        newLines.push('');
      }
      
      // Add the new thread
      newLines.push(`### ${thread.title}`);
      newLines.push('');
      
      // Add initial message if provided
      if (thread.initialMessage) {
        newLines.push(`- @${thread.initialMessage.author} [${new Date().toISOString().split('T')[0]}]: ${thread.initialMessage.content[0]}`);
        for (let j = 1; j < thread.initialMessage.content.length; j++) {
          newLines.push(`  ${thread.initialMessage.content[j]}`);
        }
        newLines.push('');
      }
      
      addedThread = true;
    }
  }

  // Ensure file ends with newline
  if (newLines[newLines.length - 1] !== '') {
    newLines.push('');
  }

  return newLines.join('\n');
}

// Helper to move a message to a new thread
function moveMessageToThread(content: string, move: any): string {
  console.log('Moving message to new thread:', move.newTitle);
  console.log('Looking for message:', {
    author: move.messageAuthor,
    timestamp: move.messageTimestamp,
    content: move.messageContent
  });
  
  const lines = content.split('\n');
  const newLines: string[] = [];
  const movedLines: string[] = [];
  let inSourceThread = false;
  let foundTarget = false;
  let targetIndent = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Handle thread headers
    if (line.startsWith('### ')) {
      inSourceThread = line.includes(move.sourceThreadTitle);
      newLines.push(line);
      continue;
    }

    if (inSourceThread) {
      const messageMatch = line.match(/^(\s*)- @(\w+) \[(.*?)\]: (.*)/);
      if (messageMatch) {
        const [, indent, author, timestamp, firstContent] = messageMatch;
        const indentLength = indent ? indent.length : 0;

        // If we found our target message
        if (!foundTarget && 
            author === move.messageAuthor && 
            timestamp === move.messageTimestamp && 
            firstContent.trim() === move.messageContent[0]) {
          console.log('Found target message:', line);
          foundTarget = true;
          targetIndent = indentLength;
          movedLines.push(line.trimStart()); // Remove indentation for new thread
          continue;
        }

        // If this is a child of our target message (more indented)
        if (foundTarget && indentLength > targetIndent) {
          movedLines.push(line);
          continue;
        }

        // If we hit a message at same or less indentation, stop collecting
        if (foundTarget && indentLength <= targetIndent) {
          foundTarget = false;
        }
      }

      // Handle continued lines and blank lines
      if (foundTarget) {
        movedLines.push(line);
      } else {
        newLines.push(line);
      }
    } else {
      newLines.push(line);
    }
  }

  // Add the new thread with moved content
  if (newLines[newLines.length - 1].trim() !== '') {
    newLines.push('');
  }
  newLines.push(`### ${move.newTitle}`);
  newLines.push('');
  movedLines.forEach(line => newLines.push(line));
  newLines.push('');

  return newLines.join('\n');
}

app.post('/api/messages/update', async (req, res) => {
  try {
    console.log('Received update request:', req.body);
    const mdPath = join(process.cwd(), 'public/data/conversation.md');
    console.log('Reading from:', mdPath);
    
    const content = await fs.readFile(mdPath, 'utf-8');
    console.log('Current content length:', content.length);
    
    const updatedContent = updateMarkdownContent(content, req.body);
    console.log('Updated content length:', updatedContent.length);
    
    await fs.writeFile(mdPath, updatedContent, 'utf-8');
    console.log('File written successfully');
    
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
    console.log('Reading from:', mdPath);
    
    const content = await fs.readFile(mdPath, 'utf-8');
    console.log('Current content length:', content.length);
    
    const updatedContent = addReplyToMarkdown(content, req.body);
    console.log('Updated content length:', updatedContent.length);
    
    await fs.writeFile(mdPath, updatedContent, 'utf-8');
    console.log('File written successfully');
    
    res.json({ success: true });
  } catch (err) {
    console.error('Failed to add reply:', err);
    res.status(500).json({ error: 'Failed to add reply' });
  }
});

// Add new endpoints
app.post('/api/threads/create', async (req, res) => {
  try {
    console.log('Received create thread request:', req.body);
    const mdPath = join(process.cwd(), 'public/data/conversation.md');
    
    const content = await fs.readFile(mdPath, 'utf-8');
    const updatedContent = createNewThread(content, req.body);
    
    await fs.writeFile(mdPath, updatedContent, 'utf-8');
    console.log('New thread created successfully');
    
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
    console.log('Message moved to new thread successfully');
    
    res.json({ success: true });
  } catch (err) {
    console.error('Failed to move message:', err);
    res.status(500).json({ error: 'Failed to move message' });
  }
});

// Add the rewrite middleware
setupViteRewrite(app);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 