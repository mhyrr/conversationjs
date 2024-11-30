export interface Thread {
  title: string;
  messages: Message[];
}

export interface Message {
  author: string;
  timestamp: string;
  content: string[];
  depth: number;
}

export function parseMarkdown(content: string): Thread[] {
  const lines = content.split('\n');
  const threads: Thread[] = [];
  let currentThread: Thread | null = null;
  let currentMessage: Message | null = null;

  lines.forEach((line) => {
    if (line.startsWith('### ')) {
      if (currentThread) threads.push(currentThread);
      currentThread = {
        title: line.replace('### ', '').replace(/ \[.*\]/, ''),
        messages: []
      };
    } else if (line.match(/^\s*- @/)) {
      const indentLevel = (line.match(/^\s*/) ?? [''])[0].length / 2;
      const match = line.match(/- @(\w+) \[(.*?)\]: (.*)/);
      if (match && currentThread) {
        currentMessage = {
          author: match[1],
          timestamp: match[2],
          content: [match[3]],
          depth: indentLevel
        };
        currentThread.messages.push(currentMessage);
      }
    } else if (line.trim() && currentMessage) {
      currentMessage.content.push(line.trim());
    }
  });

  if (currentThread) threads.push(currentThread);
  return threads;
} 