import type {Config} from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-jsdom',
  testMatch: ['<rootDir>/**/*.spec.ts'],
  testPathIgnorePatterns: [
    '/node_modules/'
  ],
  coverageDirectory: './coverage',
  coveragePathIgnorePatterns: ['node_modules'],
  reporters: ['default'],
  globals: { 'ts-jest': { diagnostics: false } },
  transform: {},
  setupFilesAfterEnv: ['<rootDir>/jest-setup.ts'],
  moduleNameMapper: {
    '\\.(css|less|sass|scss)$': '<rootDir>/__mocks__/styleMock.js'
  }
};

export default config;
