import { render, screen, waitFor } from '@testing-library/react'
import { AuthCallback } from '../AuthCallback'
import { useNavigate, BrowserRouter } from 'react-router-dom'
import { isAuthorizedUser } from '../../utils/auth'
import { jest } from '@jest/globals'

// Mock config
jest.mock('@/config', () => ({
  config: {
    MODE: 'test',
    useAuth: true,
    dataSource: 'local',
    conversationPath: '/data/conversation.md',
    faviconPath: '/favicon.svg',
    PROD: {
      clientId: 'test-client-id',
      redirectUri: 'http://localhost:3000/callback'
    }
  }
}))

// Mock localStorage
const mockStorage: { [key: string]: string } = {}
const localStorageMock = {
  getItem: jest.fn((key: string) => mockStorage[key] || null),
  setItem: jest.fn((key: string, value: string) => {
    mockStorage[key] = value
  }),
  removeItem: jest.fn((key: string) => {
    delete mockStorage[key]
  }),
  clear: jest.fn(() => {
    Object.keys(mockStorage).forEach(key => delete mockStorage[key])
  })
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

const mockNavigate = jest.fn()

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useNavigate: () => mockNavigate
}))

// Mock fetch
global.fetch = jest.fn(() => 
  Promise.resolve(new Response())
) as unknown as typeof global.fetch

describe('AuthCallback', () => {
  const renderWithRouter = (component: React.ReactNode) => {
    return render(
      <BrowserRouter>
        {component}
      </BrowserRouter>
    )
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockStorage.clear
    // Mock URL params
    const searchParams = new URLSearchParams({ code: 'test_code' })
    Object.defineProperty(window, 'location', {
      value: { search: searchParams.toString() }
    })
  })

  test('redirects if no code present', async () => {
    Object.defineProperty(window, 'location', {
      value: { search: '' }
    })
    renderWithRouter(<AuthCallback />)
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  test('handles successful auth for authorized user', async () => {
    // Mock successful token exchange
    ;(global.fetch as jest.Mock).mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ access_token: 'test_token' })
      })
    )
    // Mock successful user info fetch
    ;(global.fetch as jest.Mock).mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          login: 'mhyrr',
          name: 'Tim',
          avatar_url: 'test_url'
        })
      })
    )

    renderWithRouter(<AuthCallback />)

    await waitFor(() => {
      expect(localStorage.getItem('github_token')).toBe('test_token')
      expect(JSON.parse(localStorage.getItem('github_user') || '{}')).toEqual({
        login: 'mhyrr',
        name: 'Tim',
        avatar_url: 'test_url'
      })
      expect(mockNavigate).toHaveBeenCalledWith('/')
    })
  })

  test('handles unauthorized user', async () => {
    // Mock successful token exchange
    ;(global.fetch as jest.Mock).mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ access_token: 'test_token' })
      })
    )
    // Mock successful user info fetch for unauthorized user
    ;(global.fetch as jest.Mock).mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          login: 'unauthorized_user',
          name: 'Unauthorized',
          avatar_url: 'test_url'
        })
      })
    )

    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {})
    renderWithRouter(<AuthCallback />)

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith(
        expect.stringContaining('is not a participant')
      )
      expect(localStorage.getItem('github_token')).toBeNull()
      expect(localStorage.getItem('github_user')).toBeNull()
      expect(mockNavigate).toHaveBeenCalledWith('/')
    })
  })

  test('handles auth error', async () => {
    // Mock failed token exchange
    ;(global.fetch as jest.Mock).mockImplementationOnce(() => 
      Promise.reject(new Error('Auth failed'))
    )

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {})
    renderWithRouter(<AuthCallback />)

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled()
      expect(alertMock).toHaveBeenCalledWith('Authentication failed. Please try again.')
      expect(mockNavigate).toHaveBeenCalledWith('/')
    })
  })
}) 