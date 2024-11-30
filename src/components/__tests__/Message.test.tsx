import { render, screen } from '@testing-library/react'
import { Message } from '../Message'

describe('Message', () => {
  const mockMessage = {
    author: 'user1',
    timestamp: '2024-01-01',
    content: ['Hello', 'Second paragraph'],
    depth: 0,
    children: []
  }

  test('renders message content', () => {
    render(<Message message={mockMessage} />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
    expect(screen.getByText('Second paragraph')).toBeInTheDocument()
  })

  test('shows collapse button only when has children', () => {
    const messageWithChildren = {
      ...mockMessage,
      children: [{
        author: 'user2',
        timestamp: '2024-01-02',
        content: ['Reply'],
        depth: 1,
        children: []
      }]
    }
    
    const { rerender } = render(<Message message={mockMessage} />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    
    rerender(<Message message={messageWithChildren} />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })
}) 