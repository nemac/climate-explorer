// rollup.config.js
import babel from '@rollup/plugin-babel';
import {nodeResolve} from '@rollup/plugin-node-resolve';

const production =  process.env.build_env === 'production'
const plugins = [
  nodeResolve(),
  babel({
    exclude: 'node_modules/**', // only transpile our source code
    babelHelpers: 'bundled'
  })
];
export default [
  {
    input: 'resources/js/local-climate-maps.js',
    output: {
      file: 'dist/resources/js/local-climate-maps.js',
      format: 'umd',
      name: 'LocalClimateMaps',
      sourcemap: !production ? 'inline' : false,
    },
    plugins: plugins
  },


];
