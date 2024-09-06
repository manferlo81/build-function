import { config } from 'bundlib';

export default config({
  name: 'buildFunc',
  min: ['browser', 'module'],
  globals: {
    'object-hash': 'objectHash',
  },
  project: 'tsconfig-build.json',
});
