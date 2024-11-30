import { render, screen } from '@testing-library/react'
import { Thread } from '../Thread'

describe('Thread', () => {
  const mockThread = {
    title: 'Test Thread',
    messages: [{
      author: 'user1',
      timestamp: '2024-01-01',
      content: ['Hello'],
      depth: 0
    }]
  }

  test('renders thread title', () => {
    render(<Thread thread={mockThread} />)
    expect(screen.getByText('Test Thread')).toBeInTheDocument()
  })

  // test('collapses thread content when title clicked', () => {
  //   render(<Thread thread={mockThread} />)
  //   const title = screen.getByText('Test Thread')
  //   fireEvent.click(title)
  //   expect(screen.getByText('Hello')).not.toBeVisible()
  // })
}) 