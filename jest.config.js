module.exports = {
  globals: {
    // we must specify a custom tsconfig for tests because we need the typescript transform
    // to transform jsx into js rather than leaving it jsx such as the next build requires.  you
    // can see this setting in tsconfig.jest.json -> "jsx": "react"
    'ts-jest': {
      tsConfig: 'tsconfig.jest.json'
    },
    'jest-playwright-preset': {
      tsConfig: 'tsconfig.playwright.json'
    },
    roots: ['<rootDir>'],
    verbose: true,
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    transformIgnorePatterns: ['/node_modules/'],
    coveragePathIgnorePatterns: ['/node_modules/'],
    moduleNameMapper: {
      '^src/(.*)': '<rootDir>/src/$1',
      '\\.(css|less|sass|scss)$': '<rootDir>/__mocks__/styleMock.js',
      '\\.(gif|ttf|eot|svg)$': '<rootDir>/__mocks__/fileMock.js'
    }
  },
  projects: [
    {
      displayName: {
        name: 'Unit',
        color: 'green'
      },
      preset: 'ts-jest',
      testEnvironment: 'jsdom',
      setupFiles: ['<rootDir>/__tests__/testUtils/setupBeforeEnv.ts'],
      setupFilesAfterEnv: ['@testing-library/jest-dom'],
      testPathIgnorePatterns: [
        '/node_modules/',
        '__tests__/testUtils',
        '__tests__/fixtures',
        '__tests__/e2e'
      ],
      moduleDirectories: ['node_modules', 'src'],
      transform: {
        '^.+\\.(js|jsx|ts|tsx)$': '<rootDir>/node_modules/babel-jest'
      }
    },
    {
      displayName: {
        name: 'E2E',
        color: 'blue'
      },
      preset: 'jest-playwright-preset',
      setupFiles: ['<rootDir>/__tests__/testUtils/setupBeforeEnv.ts'],
      setupFilesAfterEnv: ['jest-playwright-preset', 'expect-playwright'],
      testPathIgnorePatterns: [
        '/node_modules/',
        '__tests__/testUtils',
        '__tests__/fixtures',
        '__tests__/unit'
      ],
      moduleDirectories: ['node_modules', 'src'],
      testEnvironment: '<rootDir>/__tests__/testUtils/CustomEnvironment.js'
    }
  ],
  testTimeout: 20000
}
