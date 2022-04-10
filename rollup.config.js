import { terser } from 'rollup-plugin-terser';

export default {
  input: 'scripts/bolme.js',
  output: {
    file: 'scripts/bolme.min.js',
    format: 'esm',
    plugins: [terser()]
  }
};
