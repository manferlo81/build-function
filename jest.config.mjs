import { createDefaultPreset } from 'ts-jest';

const collectCoverage = !process.env.SKIP_COVERAGE;
const coverageOnCI = process.env.CI;

const typescriptJestPreset = createDefaultPreset({
  tsconfig: './tsconfig.json',
});

/** @type { import("ts-jest").JestConfigWithTsJest } */
const config = {
  ...typescriptJestPreset,

  collectCoverage,
  collectCoverageFrom: [
    'src/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: coverageOnCI
    ? ['text', 'json', 'clover', 'cobertura']
    : ['text', 'html'],

  testMatch: [
    '**/__test__/**/*.test.ts',
  ],

  cacheDirectory: 'node_modules/.cache/jest',
  verbose: true,
};

export default config;
