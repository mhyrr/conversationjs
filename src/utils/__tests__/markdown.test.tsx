import { parseMarkdown } from '../markdown'

describe('parseMarkdown', () => {
  test('parses thread titles', () => {
    const input = '### Thread 1\n### Thread 2'
    const result = parseMarkdown(input)
    expect(result).toHaveLength(2)
    expect(result[0].title).toBe('Thread 1')
    expect(result[1].title).toBe('Thread 2')
  })

  test('handles multi-line message content', () => {
    const input = '### Thread\n- @user [2024-01-01]: First line\nSecond line\nThird line'
    const result = parseMarkdown(input)
    expect(result[0].messages[0].content).toHaveLength(3)
  })

  test('ignores malformed messages', () => {
    const input = '### Thread\nNot a message\n- @user [2024-01-01]: Valid message'
    const result = parseMarkdown(input)
    expect(result[0].messages).toHaveLength(1)
  })
}) 