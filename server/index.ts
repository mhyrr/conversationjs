import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fetch from 'node-fetch';
import { setupViteRewrite } from './vite.middleware.js';
import fs from 'fs/promises';
import path from 'path';

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
  console.log('\nAdding reply:', {
    thread: reply.threadTitle,
    parent: {
      author: reply.parentAuthor,
      timestamp: reply.parentTimestamp
    },
    reply: {
      author: reply.author,
      timestamp: reply.timestamp,
      content: reply.content
    }
  });
  
  const lines = content.split('\n');
  let newLines = [];
  let inTargetThread = false;
  let parentFound = false;
  let parentIndent: number | null = null;
  let currentLine = 0;

  while (currentLine < lines.length) {
    const line = lines[currentLine];

    // Handle thread headers
    if (line.startsWith('### ')) {
      if (inTargetThread && !parentFound) {
        // If we hit a new thread header without finding parent, keep looking
        inTargetThread = line.includes(reply.threadTitle);
      } else if (inTargetThread && parentFound) {
        // If we found parent and hit new header, we're done
        console.log('Hit next thread header after finding parent, stopping');
        newLines.push(...lines.slice(currentLine));
        break;
      } else {
        // Not in target thread yet, check if this is our thread
        inTargetThread = line.includes(reply.threadTitle);
      }
      newLines.push(line);
      currentLine++;
      continue;
    }

    if (!inTargetThread) {
      newLines.push(line);
      currentLine++;
      continue;
    }

    // Check for parent message
    const messageMatch = line.match(/^(\s*)- @(\w+) \[(.*?)Z?\]: /);
    if (messageMatch) {
      const [, indent, author, timestamp] = messageMatch;
      
      if (author === reply.parentAuthor && timestamp === reply.parentTimestamp) {
        console.log('Found parent message');
        parentFound = true;
        parentIndent = indent.length;
        newLines.push(line);
        
        // Skip to end of parent message content
        while (currentLine + 1 < lines.length) {
          const nextLine = lines[currentLine + 1];
          
          // Stop if we hit a thread header
          if (nextLine.startsWith('### ')) {
            break;
          }

          const nextMatch = nextLine.match(/^(\s*)- @/);
          if (nextMatch) {
            const nextIndent = nextMatch[1].length;
            if (nextIndent <= parentIndent) {
              break;
            }
          }
          currentLine++;
          newLines.push(nextLine);
        }

        // Add the reply with proper indentation
        const replyIndent = ' '.repeat(parentIndent + 2);
        newLines.push('');
        newLines.push(`${replyIndent}- @${reply.author} [${reply.timestamp}]: ${reply.content[0]}`);
        
        for (let j = 1; j < reply.content.length; j++) {
          newLines.push(`${replyIndent}  ${reply.content[j]}`);
        }
        newLines.push('');
        currentLine++;
        continue;
      }
    }

    newLines.push(line);
    currentLine++;
  }

  return newLines.join('\n');
}

// Helper to create a new thread
function createNewThread(content: string, thread: any): string {
  console.log('Creating new thread:', thread);
  const lines = content.split('\n');
  const newLines: string[] = [];
  
  // Copy existing content
  newLines.push(...lines);

  // Ensure we have a blank line before new thread
  if (newLines[newLines.length - 1].trim() !== '') {
    newLines.push('');
  }
  
  // Add the new thread
  newLines.push(`### ${thread.title}`);
  newLines.push('');
  
  // Add initial message if provided
  if (thread.initialMessage) {
    const timestamp = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
    newLines.push(`- @${thread.initialMessage.author} [${timestamp}]: ${thread.initialMessage.content[0]}`);
    // Add any additional content lines with proper indentation
    for (let j = 1; j < thread.initialMessage.content.length; j++) {
      newLines.push(`  ${thread.initialMessage.content[j]}`);
    }
    newLines.push('');
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
  let currentLine = 0;

  // First pass: collect the message and its replies
  while (currentLine < lines.length) {
    const line = lines[currentLine];

    // Handle thread headers
    if (line.startsWith('### ')) {
      inSourceThread = line.includes(move.sourceThreadTitle);
      if (foundTarget) {
        // If we've found and collected our target message, add remaining lines and break
        newLines.push(...lines.slice(currentLine));
        break;
      }
      newLines.push(line);
      currentLine++;
      continue;
    }

    if (inSourceThread) {
      const messageMatch = line.match(/^(\s*)- @(\w+) \[(.*?)Z?\]: (.*)/);
      if (messageMatch) {
        const [, indent, author, timestamp, content] = messageMatch;
        const indentLength = indent ? indent.length : 0;

        // If we found our target message
        if (!foundTarget && 
            author === move.messageAuthor && 
            timestamp === move.messageTimestamp) {
          console.log('Found target message:', line);
          foundTarget = true;
          targetIndent = indentLength;
          // Store without indentation
          movedLines.push(`- @${author} [${timestamp}]: ${content}`);
          currentLine++;
          continue;
        }

        // If this is a child of our target message (more indented)
        if (foundTarget && indentLength > targetIndent) {
          // Adjust indentation relative to new parent
          const newIndent = ' '.repeat((indentLength - targetIndent));
          movedLines.push(`${newIndent}- @${author} [${timestamp}]: ${content}`);
          currentLine++;
          continue;
        }

        // If we hit a message at same or less indentation, stop collecting
        if (foundTarget && indentLength <= targetIndent) {
          foundTarget = false;
        }
      } else if (foundTarget && line.trim()) {
        // Handle continued lines with adjusted indentation
        const indentMatch = line.match(/^(\s*)/);
        const lineIndent = indentMatch ? indentMatch[1].length : 0;
        if (lineIndent > targetIndent) {
          const newIndent = ' '.repeat(lineIndent - targetIndent);
          movedLines.push(`${newIndent}${line.trim()}`);
        } else {
          movedLines.push(line.trim());
        }
        currentLine++;
        continue;
      }
    }

    if (!foundTarget) {
      newLines.push(line);
    }
    currentLine++;
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
  const { threadTitle, messageAuthor, messageTimestamp, newContent } = req.body;
  console.log('Received update request:', { threadTitle, messageAuthor, messageTimestamp, newContent });

  try {
    const mdPath = join(process.cwd(), 'public/data/conversation.md');
    const content = await fs.readFile(mdPath, 'utf-8');
    const lines = content.split('\n');
    let newLines = [];
    let inTargetThread = false;
    let messageFound = false;
    let targetIndent: number | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Handle thread headers
      if (line.startsWith('### ')) {
        inTargetThread = line.includes(threadTitle);
        messageFound = false;
        targetIndent = null;
        newLines.push(line);
        continue;
      }

      if (!inTargetThread) {
        newLines.push(line);
        continue;
      }

      // Check for message header line
      const messageMatch = line.match(/^(\s*)- @(\w+) \[(.*?)Z?\]: /);
      
      if (messageMatch) {
        const [, indent, author, timestamp] = messageMatch;
        const currentIndent = indent.length;

        // If we found our target message
        if (author === messageAuthor && timestamp === messageTimestamp) {
          console.log('Found target message to update');
          messageFound = true;
          targetIndent = currentIndent;
          // Add the new message header with same indentation
          newLines.push(`${indent}- @${author} [${timestamp}]: ${newContent[0]}`);
          // Add remaining content lines with proper indentation
          for (let j = 1; j < newContent.length; j++) {
            newLines.push(`${indent}  ${newContent[j]}`);
          }
          continue;
        }
      } else if (messageFound) {
        // Skip original content lines until we hit next message or different indent
        const lineIndent = line.match(/^(\s*)/)?.[1].length || 0;
        if (lineIndent <= targetIndent! || line.match(/^(\s*)- @/)) {
          messageFound = false;
          targetIndent = null;
          newLines.push(line);
        }
        continue;
      }

      newLines.push(line);
    }

    await fs.writeFile(mdPath, newLines.join('\n') + '\n');
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

// Add this with the other message endpoints
app.post('/api/messages/delete', async (req, res) => {
  const { threadTitle, messageAuthor, messageTimestamp } = req.body;
  console.log('\nDelete request:', { threadTitle, messageAuthor, messageTimestamp });

  try {
    const filePath = path.join(__dirname, '../public/data/conversation.md');
    let content = await fs.readFile(filePath, 'utf8');
    
    const lines = content.split('\n');
    let newLines = [];
    let inTargetThread = false;
    let skipMode = false;
    let targetIndent: number | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.startsWith('### ')) {
        inTargetThread = line.includes(threadTitle);
        skipMode = false;
        targetIndent = null;
        newLines.push(line);
        continue;
      }

      if (!inTargetThread) {
        newLines.push(line);
        continue;
      }

      const messageMatch = line.match(/^(\s*)- @(\w+) \[(.*?)Z?\]: /);
      
      if (messageMatch) {
        const [, indent, author, timestamp] = messageMatch;
        const currentIndent = indent.length;

        if (author === messageAuthor && timestamp === messageTimestamp) {
          skipMode = true;
          targetIndent = currentIndent;
          continue;
        }

        if (skipMode && currentIndent <= targetIndent!) {
          skipMode = false;
          targetIndent = null;
        }
      } else if (skipMode) {
        const lineIndent = line.match(/^(\s*)/)?.[1].length || 0;
        if (lineIndent <= targetIndent!) {
          skipMode = false;
          targetIndent = null;
        }
      }

      if (!skipMode) {
        newLines.push(line);
      }
    }

    const cleanedLines = newLines.reduce((acc, line, i) => {
      if (line.trim() || (i > 0 && i < newLines.length - 1 && 
          (newLines[i-1].trim() || newLines[i+1].trim()))) {
        acc.push(line);
      }
      return acc;
    }, [] as string[]);

    await fs.writeFile(filePath, cleanedLines.join('\n') + '\n');
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