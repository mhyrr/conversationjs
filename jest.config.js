module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },
  globals: {
    'import.meta': {
      env: {
        MODE: 'test'
      }
    }
  }
} 