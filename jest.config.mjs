import { createDefaultPreset } from 'ts-jest';

const typescriptJestPreset = createDefaultPreset({});

/** @type { import("ts-jest").JestConfigWithTsJest } */
const config = {
  preset: 'ts-jest',
  ...typescriptJestPreset,

  collectCoverage: !process.env.SKIP_COVERAGE,
  collectCoverageFrom: [
    'src/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: process.env.CI
    ? ['text', 'json', 'clover', 'cobertura']
    : ['text', 'html'],

  testMatch: [
    '**/__test__/**/*.test.ts',
  ],

  cacheDirectory: 'node_modules/.cache/jest',
  verbose: true,
};

export default config;
