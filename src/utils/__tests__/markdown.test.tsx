import { parseMarkdown } from '../markdown'
import type { Thread } from '../../types'

describe('parseMarkdown', () => {
  test('parses basic thread', () => {
    const input = '### Thread\n- @user [2024-01-01]: Hello'
    const result = parseMarkdown(input)
    expect(result).toHaveLength(1)
    expect(result[0].title).toBe('Thread')
    expect(result[0].messages[0].content).toBe('Hello')
  })

  test('handles multi-line message content', () => {
    const input = '### Thread\n- @user [2024-01-01]: First line\nSecond line\nThird line'
    const result = parseMarkdown(input)
    expect(result[0].messages[0].content).toBe('First line\nSecond line\nThird line')
  })

  test('ignores malformed messages', () => {
    const input = '### Thread\nNot a message\n- @user [2024-01-01]: Valid message'
    const result = parseMarkdown(input)
    expect(result[0].messages).toHaveLength(1)
    expect(result[0].messages[0].content).toBe('Valid message')
  })
}) 