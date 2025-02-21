import type { MessageUpdate, MessageReply, ThreadCreate, MessageMove, MessageDelete } from './api/types';

export function updateMarkdownContent(content: string, update: MessageUpdate): string {
  const lines = content.split('\n');
  let inTargetThread = false;
  let inTargetMessage = false;
  let currentIndent = '';
  const newLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('### ')) {
      inTargetThread = line.includes(update.threadTitle);
      newLines.push(line);
      continue;
    }

    if (inTargetThread && line.match(/^\s*- @/)) {
      const indentMatch = line.match(/^(\s*)/);
      currentIndent = indentMatch ? indentMatch[1] : '';
      
      const messageMatch = line.match(/- @(\w+) \[(.*?)Z?\]:/);
      if (messageMatch && 
          messageMatch[1] === update.messageAuthor && 
          messageMatch[2] === update.messageTimestamp.replace(/Z$/, '')) {
        inTargetMessage = true;
        const timestamp = update.newTimestamp || update.messageTimestamp;
        newLines.push(`${currentIndent}- @${update.messageAuthor} [${timestamp}]: ${update.newContent[0]}`);
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

export function addReplyToMarkdown(content: string, reply: MessageReply): string {
  const lines = content.split('\n');
  let newLines = [];
  let inTargetThread = false;
  let parentFound = false;
  let collectingContent = false;
  let parentIndent = '';
  let currentLine = 0;

  while (currentLine < lines.length) {
    const line = lines[currentLine];

    // Handle thread headers
    if (line.startsWith('### ')) {
      inTargetThread = line.includes(reply.threadTitle);
      if (!inTargetThread && collectingContent) {
        // Add reply before next thread if we haven't already
        newLines.push('');
        newLines.push(`${parentIndent}  - @${reply.author} [${reply.timestamp}]: ${reply.content[0]}`);
        for (let j = 1; j < reply.content.length; j++) {
          newLines.push(`${parentIndent}    ${reply.content[j]}`);
        }
        newLines.push('');
        collectingContent = false;
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

    // Check for message lines
    const messageMatch = line.match(/^(\s*)- @(\w+) \[(.*?)Z?\]: /);
    if (messageMatch) {
      const [, indent, author, timestamp] = messageMatch;
      
      if (!parentFound && author === reply.parentAuthor && timestamp === reply.parentTimestamp.replace(/Z$/, '')) {
        // Found parent message
        parentFound = true;
        collectingContent = true;
        parentIndent = indent;
      } else if (collectingContent) {
        // If we hit another message at same or higher level than parent, add our reply
        if (indent.length <= parentIndent.length) {
          newLines.push('');
          newLines.push(`${parentIndent}  - @${reply.author} [${reply.timestamp}]: ${reply.content[0]}`);
          for (let j = 1; j < reply.content.length; j++) {
            newLines.push(`${parentIndent}    ${reply.content[j]}`);
          }
          newLines.push('');
          collectingContent = false;
        }
      }
      newLines.push(line);
      currentLine++;
      continue;
    }

    // Handle content lines
    const indentMatch = line.match(/^(\s*)/);
    const lineIndent = indentMatch ? indentMatch[1] : '';

    if (collectingContent) {
      // If this is a content line of the parent message, add it
      if (line.trim() === '' || lineIndent.length > parentIndent.length) {
        newLines.push(line);
        currentLine++;
        continue;
      } else {
        // If we hit any other kind of line, add our reply
        newLines.push('');
        newLines.push(`${parentIndent}  - @${reply.author} [${reply.timestamp}]: ${reply.content[0]}`);
        for (let j = 1; j < reply.content.length; j++) {
          newLines.push(`${parentIndent}    ${reply.content[j]}`);
        }
        newLines.push('');
        collectingContent = false;
      }
    }

    newLines.push(line);
    currentLine++;
  }

  // If we were still collecting at end of file, add the reply
  if (collectingContent) {
    newLines.push('');
    newLines.push(`${parentIndent}  - @${reply.author} [${reply.timestamp}]: ${reply.content[0]}`);
    for (let j = 1; j < reply.content.length; j++) {
      newLines.push(`${parentIndent}    ${reply.content[j]}`);
    }
    newLines.push('');
  }

  return newLines.join('\n');
}

export function createNewThread(content: string, thread: ThreadCreate): string {
  const lines = content.split('\n');
  const newLines: string[] = [];
  
  newLines.push(...lines);

  if (newLines[newLines.length - 1].trim() !== '') {
    newLines.push('');
  }
  
  newLines.push(`### ${thread.title}`);
  newLines.push('');
  
  if (thread.initialMessage) {
    const timestamp = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
    newLines.push(`- @${thread.initialMessage.author} [${timestamp}]: ${thread.initialMessage.content[0]}`);
    for (let j = 1; j < thread.initialMessage.content.length; j++) {
      newLines.push(`  ${thread.initialMessage.content[j]}`);
    }
    newLines.push('');
  }

  return newLines.join('\n');
}

export function moveMessageToThread(content: string, move: MessageMove): string {
  const lines = content.split('\n');
  const newLines: string[] = [];
  const movedLines: string[] = [];
  let inSourceThread = false;
  let foundTarget = false;
  let targetIndent: number | null = null;
  let currentLine = 0;

  // First pass: collect the message and its children while removing from source
  while (currentLine < lines.length) {
    const line = lines[currentLine];

    if (line.startsWith('### ')) {
      inSourceThread = line.includes(move.sourceThreadTitle);
      newLines.push(line);
      currentLine++;
      continue;
    }

    if (!inSourceThread) {
      newLines.push(line);
      currentLine++;
      continue;
    }

    const messageMatch = line.match(/^(\s*)- @(\w+) \[(.*?)Z?\]: (.*)/);
    if (messageMatch) {
      const [, indent, author, timestamp] = messageMatch;
      const indentLength = indent ? indent.length : 0;

      if (!foundTarget && author === move.messageAuthor && timestamp === move.messageTimestamp) {
        foundTarget = true;
        targetIndent = indentLength;
        movedLines.push(line);
        currentLine++;
        continue;
      }

      if (foundTarget) {
        if (indentLength > targetIndent!) {
          // This is a child message, include it
          movedLines.push(line);
          currentLine++;
          continue;
        } else {
          // Same or lower indent level - no longer a child
          foundTarget = false;
          targetIndent = null;
        }
      }
    } else if (foundTarget) {
      // Handle content lines of the current message or its children
      const lineIndent = line.match(/^(\s*)/)?.[1].length || 0;
      if (lineIndent > targetIndent!) {
        movedLines.push(line);
        currentLine++;
        continue;
      } else {
        foundTarget = false;
        targetIndent = null;
      }
    }

    if (!foundTarget) {
      newLines.push(line);
    }
    currentLine++;
  }

  // Add the moved content to the new thread
  if (newLines[newLines.length - 1].trim() !== '') {
    newLines.push('');
  }
  newLines.push(`### ${move.newTitle}`);
  newLines.push('');
  movedLines.forEach(line => newLines.push(line));
  newLines.push('');

  return newLines.join('\n');
}

export function deleteMessageFromMarkdown(content: string, del: MessageDelete): string {
  const lines = content.split('\n');
  let newLines = [];
  let inTargetThread = false;
  let skipMode = false;
  let targetIndent: number | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('### ')) {
      inTargetThread = line.includes(del.threadTitle);
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

      if (author === del.messageAuthor && timestamp === del.messageTimestamp) {
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

  return cleanedLines.join('\n') + '\n';
} 