import { render, screen } from '@testing-library/react'
import { Thread } from '../Thread'
import type { Thread as ThreadType, Message as MessageType } from '../utils/markdown'

describe('Thread', () => {
  const mockThread: ThreadType = {
    title: 'Test Thread',
    messages: [{
      author: 'user1',
      timestamp: '2024-01-01',
      content: 'Hello world',
      depth: 0,
      replies: []
    }],
    collapsed: false
  }

  test('renders thread title and messages', () => {
    render(<Thread thread={mockThread} />)
    expect(screen.getByText('Test Thread')).toBeInTheDocument()
    expect(screen.getByText('Hello world')).toBeInTheDocument()
  })
}) 