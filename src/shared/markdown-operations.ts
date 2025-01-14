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
      
      const messageMatch = line.match(/- @(\w+) \[(.*?)\]:/);
      if (messageMatch && 
          messageMatch[1] === update.messageAuthor && 
          messageMatch[2] === update.messageTimestamp) {
        inTargetMessage = true;
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

export function addReplyToMarkdown(content: string, reply: MessageReply): string {
  const lines = content.split('\n');
  let newLines = [];
  let inTargetThread = false;
  let parentFound = false;
  let parentIndent: number | null = null;
  let currentLine = 0;

  while (currentLine < lines.length) {
    const line = lines[currentLine];

    if (line.startsWith('### ')) {
      if (inTargetThread && !parentFound) {
        inTargetThread = line.includes(reply.threadTitle);
      } else if (inTargetThread && parentFound) {
        newLines.push(...lines.slice(currentLine));
        break;
      } else {
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

    const messageMatch = line.match(/^(\s*)- @(\w+) \[(.*?)Z?\]: /);
    if (messageMatch) {
      const [, indent, author, timestamp] = messageMatch;
      
      if (author === reply.parentAuthor && timestamp === reply.parentTimestamp) {
        parentFound = true;
        parentIndent = indent.length;
        newLines.push(line);
        
        while (currentLine + 1 < lines.length) {
          const nextLine = lines[currentLine + 1];
          
          if (nextLine.startsWith('### ')) break;

          const nextMatch = nextLine.match(/^(\s*)- @/);
          if (nextMatch) {
            const nextIndent = nextMatch[1].length;
            if (nextIndent <= parentIndent) break;
          }
          currentLine++;
          newLines.push(nextLine);
        }

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
  let targetIndent = 0;
  let currentLine = 0;

  while (currentLine < lines.length) {
    const line = lines[currentLine];

    if (line.startsWith('### ')) {
      inSourceThread = line.includes(move.sourceThreadTitle);
      if (foundTarget) {
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

        if (!foundTarget && 
            author === move.messageAuthor && 
            timestamp === move.messageTimestamp) {
          foundTarget = true;
          targetIndent = indentLength;
          movedLines.push(`- @${author} [${timestamp}]: ${content}`);
          currentLine++;
          continue;
        }

        if (foundTarget && indentLength > targetIndent) {
          const newIndent = ' '.repeat((indentLength - targetIndent));
          movedLines.push(`${newIndent}- @${author} [${timestamp}]: ${content}`);
          currentLine++;
          continue;
        }

        if (foundTarget && indentLength <= targetIndent) {
          foundTarget = false;
        }
      } else if (foundTarget && line.trim()) {
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