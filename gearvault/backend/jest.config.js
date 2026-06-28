module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: ['src/**/*.js', '!src/seeds/**', '!src/server.js'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  setupFilesAfterFramework: ['./tests/helpers/setup.js'],
  testTimeout: 30000,
  verbose: true,
  runInBand: true,
  detectOpenHandles: true,
}
