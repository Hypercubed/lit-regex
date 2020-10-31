module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/**/*.spec.ts'],
  coverageReporters: [
    'json-summary',
    'text',
    'lcov'
  ],
  collectCoverageFrom: [
    '<rootDir>/src/lib/**/*.ts'
  ]
};