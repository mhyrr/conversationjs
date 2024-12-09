module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^react-router-dom$': '<rootDir>/node_modules/react-router-dom',
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.json$': '<rootDir>/src/__mocks__/participants.json'
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
      useESM: true,
    }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'cjs', 'mjs'],
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
  globals: {
    'ts-jest': {
      useESM: true,
    }
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  testEnvironmentOptions: {
    url: 'http://localhost/'
  },
  moduleDirectories: ['node_modules', 'src'],
  modulePaths: ['<rootDir>/src'],
  testPathIgnorePatterns: ['/node_modules/'],
  transformIgnorePatterns: [
    '/node_modules/(?!react-router-dom|@remix-run)/'
  ]
}; 