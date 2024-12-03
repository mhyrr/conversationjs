import { buildMessageTree } from '../tree'
import type { Thread } from '../markdown'

describe('buildMessageTree', () => {
  test('handles single message', () => {
    const messages = [{
      author: 'user1',
      timestamp: '2024-01-01',
      content: ['Hello'],
      depth: 0,
      children: []
    }]
    const result = buildMessageTree(messages)
    expect(result).toHaveLength(1)
    expect(result[0].content).toEqual(['Hello'])
  })

  test('builds simple tree', () => {
    const messages = [
      {
        author: 'user1',
        timestamp: '2024-01-01',
        content: ['Hello'],
        depth: 0,
        children: []
      },
      {
        author: 'user2',
        timestamp: '2024-01-02',
        content: ['Hi'],
        depth: 1,
        children: []
      }
    ]
    const result = buildMessageTree(messages)
    expect(result).toHaveLength(1)
    expect(result[0].children?.[0]?.author).toBe('user2')
  })
}) 