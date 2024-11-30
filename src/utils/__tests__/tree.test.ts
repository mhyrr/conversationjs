import { buildMessageTree } from '../tree'
import type { Message } from '../markdown'

describe('buildMessageTree', () => {
  test('handles empty message list', () => {
    expect(buildMessageTree([])).toEqual([])
  })

  test('handles single root message', () => {
    const messages: Message[] = [{
      author: 'user1',
      timestamp: '2024-01-01',
      content: ['Hello'],
      depth: 0
    }]
    
    const result = buildMessageTree(messages)
    expect(result).toHaveLength(1)
    expect(result[0].children).toHaveLength(0)
  })

  test('handles direct replies', () => {
    const messages: Message[] = [
      {
        author: 'user1',
        timestamp: '2024-01-01',
        content: ['Hello'],
        depth: 0
      },
      {
        author: 'user2',
        timestamp: '2024-01-02',
        content: ['Hi'],
        depth: 1
      }
    ]
    
    const result = buildMessageTree(messages)
    expect(result).toHaveLength(1)
    expect(result[0].children).toHaveLength(1)
    expect(result[0].children[0].author).toBe('user2')
  })

  test('handles nested replies', () => {
    const messages: Message[] = [
      {
        author: 'user1',
        timestamp: '2024-01-01',
        content: ['Hello'],
        depth: 0
      },
      {
        author: 'user2',
        timestamp: '2024-01-02',
        content: ['Hi'],
        depth: 1
      },
      {
        author: 'user3',
        timestamp: '2024-01-03',
        content: ['Hey'],
        depth: 2
      }
    ]
    
    const result = buildMessageTree(messages)
    expect(result).toHaveLength(1)
    expect(result[0].children).toHaveLength(1)
    expect(result[0].children[0].children).toHaveLength(1)
    expect(result[0].children[0].children[0].author).toBe('user3')
  })

  test('handles multiple root messages', () => {
    const messages: Message[] = [
      {
        author: 'user1',
        timestamp: '2024-01-01',
        content: ['Hello'],
        depth: 0
      },
      {
        author: 'user2',
        timestamp: '2024-01-02',
        content: ['Another topic'],
        depth: 0
      }
    ]
    
    const result = buildMessageTree(messages)
    expect(result).toHaveLength(2)
    expect(result[0].children).toHaveLength(0)
    expect(result[1].children).toHaveLength(0)
  })

  test('handles orphaned messages', () => {
    const messages: Message[] = [
      {
        author: 'user1',
        timestamp: '2024-01-01',
        content: ['Hello'],
        depth: 0
      },
      {
        author: 'user2',
        timestamp: '2024-01-02',
        content: ['Orphaned'],
        depth: 2  // No depth 1 parent
      }
    ]
    
    const result = buildMessageTree(messages)
    expect(result).toHaveLength(1)
    expect(result[0].children).toHaveLength(0)  // Orphaned message should be ignored
  })
}) 