import '@testing-library/jest-dom'
import { jest } from '@jest/globals'

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    search: '',
    pathname: '/',
    hash: '',
    host: 'localhost',
    hostname: 'localhost',
    href: 'http://localhost',
    origin: 'http://localhost',
    port: '',
    protocol: 'http:',
  },
  writable: true
})

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
  },
  writable: true
}) 