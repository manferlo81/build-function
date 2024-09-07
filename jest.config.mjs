/** @type { import("jest").Config } */
const config = {
  cacheDirectory: 'node_modules/.cache/jest',
  preset: 'ts-jest',

  collectCoverage: true,
  collectCoverageFrom: [
    'src/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: [
    process.env.CI ? 'json' : 'lcov',
    'text',
  ],

  testMatch: [
    '**/__test__/**/*.test.ts',
  ],

  verbose: true,
};

export default config;
