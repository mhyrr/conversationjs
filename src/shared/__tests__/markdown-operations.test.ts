import { 
  updateMarkdownContent, 
  addReplyToMarkdown, 
  createNewThread,
  moveMessageToThread, 
  deleteMessageFromMarkdown 
} from '../markdown-operations';

const sampleContent = `### Thread One

- @user1 [2024-03-21]: First message
  Some content here
  More content

  - @user2 [2024-03-21]: A reply
    With multiple lines
    Of content

### Thread Two

- @user1 [2024-03-21]: Another message
  With content`;

describe('markdown operations', () => {
  describe('updateMarkdownContent', () => {
    it('updates a message with single line content', () => {
      const update = {
        threadTitle: 'Thread One',
        messageAuthor: 'user1',
        messageTimestamp: '2024-03-21',
        newContent: ['Updated content']
      };

      const result = updateMarkdownContent(sampleContent, update);
      expect(result).toContain('- @user1 [2024-03-21]: Updated content');
      expect(result).not.toContain('Some content here');
    });

    it('updates a message with multiple lines', () => {
      const update = {
        threadTitle: 'Thread One',
        messageAuthor: 'user1',
        messageTimestamp: '2024-03-21',
        newContent: ['Line 1', 'Line 2']
      };

      const result = updateMarkdownContent(sampleContent, update);
      expect(result).toContain('- @user1 [2024-03-21]: Line 1');
      expect(result).toContain('  Line 2');
    });

    it('preserves other messages and threads', () => {
      const update = {
        threadTitle: 'Thread One',
        messageAuthor: 'user1',
        messageTimestamp: '2024-03-21',
        newContent: ['Updated content']
      };

      const result = updateMarkdownContent(sampleContent, update);
      expect(result).toContain('### Thread Two');
      expect(result).toContain('- @user2 [2024-03-21]: A reply');
    });
  });

  describe('addReplyToMarkdown', () => {
    it('adds a reply to a message', () => {
      const reply = {
        threadTitle: 'Thread One',
        parentAuthor: 'user1',
        parentTimestamp: '2024-03-21',
        content: ['New reply'],
        author: 'user3',
        timestamp: '2024-03-21'
      };

      const result = addReplyToMarkdown(sampleContent, reply);
      expect(result).toContain('- @user3 [2024-03-21]: New reply');
      expect(result).toContain('- @user1 [2024-03-21]: First message');
    });

    it('maintains proper indentation for replies', () => {
      const reply = {
        threadTitle: 'Thread One',
        parentAuthor: 'user2',
        parentTimestamp: '2024-03-21',
        content: ['Nested reply'],
        author: 'user3',
        timestamp: '2024-03-21'
      };

      const result = addReplyToMarkdown(sampleContent, reply);
      const lines = result.split('\n');
      const replyLine = lines.find(l => l.includes('Nested reply'));
      expect(replyLine?.startsWith('      ')).toBe(true);
    });
  });

  describe('createNewThread', () => {
    it('creates a new thread with initial message', () => {
      const thread = {
        title: 'New Thread',
        initialMessage: {
          content: ['Initial message'],
          author: 'user1'
        }
      };

      const result = createNewThread(sampleContent, thread);
      expect(result).toContain('### New Thread');
      expect(result).toMatch(/- @user1 \[\d{4}-\d{2}-\d{2}\]: Initial message/);
    });

    it('creates a new thread without initial message', () => {
      const thread = {
        title: 'Empty Thread'
      };

      const result = createNewThread(sampleContent, thread);
      expect(result).toContain('### Empty Thread');
      expect(result.endsWith('\n')).toBe(true);
    });
  });

  describe('moveMessageToThread', () => {
    it('moves a message and its replies to a new thread', () => {
      const move = {
        newTitle: 'New Thread',
        sourceThreadTitle: 'Thread One',
        messageAuthor: 'user1',
        messageTimestamp: '2024-03-21',
        messageContent: ['First message']
      };

      const result = moveMessageToThread(sampleContent, move);
      expect(result).toContain('### New Thread');
      expect(result).toContain('- @user1 [2024-03-21]: First message');
      expect(result).toContain('- @user2 [2024-03-21]: A reply');
      expect(result).not.toContain('Some content here');
    });

    it('preserves indentation when moving nested messages', () => {
      const move = {
        newTitle: 'New Thread',
        sourceThreadTitle: 'Thread One',
        messageAuthor: 'user2',
        messageTimestamp: '2024-03-21',
        messageContent: ['A reply']
      };

      const result = moveMessageToThread(sampleContent, move);
      const lines = result.split('\n');
      const movedLine = lines.find(l => l.includes('A reply'));
      expect(movedLine?.startsWith('- @user2')).toBe(true);
    });
  });

  describe('deleteMessageFromMarkdown', () => {
    it('deletes a message and its replies', () => {
      const del = {
        threadTitle: 'Thread One',
        messageAuthor: 'user1',
        messageTimestamp: '2024-03-21'
      };

      const result = deleteMessageFromMarkdown(sampleContent, del);
      expect(result).not.toContain('First message');
      expect(result).not.toContain('A reply');
      expect(result).toContain('### Thread Two');
    });

    it('preserves surrounding messages', () => {
      const del = {
        threadTitle: 'Thread One',
        messageAuthor: 'user2',
        messageTimestamp: '2024-03-21'
      };

      const result = deleteMessageFromMarkdown(sampleContent, del);
      expect(result).toContain('First message');
      expect(result).not.toContain('A reply');
      expect(result).toContain('### Thread Two');
    });

    it('cleans up empty lines appropriately', () => {
      const del = {
        threadTitle: 'Thread One',
        messageAuthor: 'user1',
        messageTimestamp: '2024-03-21'
      };

      const result = deleteMessageFromMarkdown(sampleContent, del);
      const lines = result.split('\n');
      expect(lines.filter(l => l.trim() === '').length).toBeLessThan(3);
    });
  });
}); 