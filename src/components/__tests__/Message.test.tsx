import { render, screen } from '@testing-library/react'
import { Message } from '../Message'
import type { Message as MessageType } from '../utils/markdown'

describe('Message', () => {
  const mockMessage: MessageType = {
    author: 'user1',
    timestamp: '2024-01-01',
    content: 'Hello world',
    depth: 0,
    replies: []
  }

  test('renders message content', () => {
    render(<Message message={mockMessage} />)
    expect(screen.getByText('Hello world')).toBeInTheDocument()
  })

  test('renders nested messages', () => {
    const messageWithChildren: MessageType = {
      ...mockMessage,
      replies: [{
        author: 'user2',
        timestamp: '2024-01-02',
        content: 'Reply message',
        depth: 1,
        replies: []
      }]
    }

    const { rerender } = render(<Message message={mockMessage} />)
    expect(screen.queryByText('Reply message')).not.toBeInTheDocument()

    rerender(<Message message={messageWithChildren} />)
    expect(screen.getByText('Reply message')).toBeInTheDocument()
  })
}) 