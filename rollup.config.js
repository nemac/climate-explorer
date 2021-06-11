// rollup.config.js

//
//  "@rollup/plugin-babel": "^5.2.1",
//     "@rollup/plugin-node-resolve": "^9.0.0",
//
//     "rollup": "^2.31.0"

import babel from '@rollup/plugin-babel';
import nodeResolve from '@rollup/plugin-node-resolve';
let production = process.env.build_env === 'prod' || process.env.build_env === 'production'
const plugins = [
  // nodeResolve(),
];
if (production){
  plugins.push(
      babel({
        exclude: 'node_modules/**', // only transpile our source code
        babelHelpers: 'bundled',
      })
  )
}
export default [
  {
    input: './js/climate_maps.js',
    output: {
      file: 'dist/js/climate_maps.js',
      format: 'umd',
      name: 'LocalClimateMaps',
      sourcemap: !production ? 'inline' : false,
    },
    plugins: plugins
  },{
    input: './js/scenario_comparison_map.js',
    output: {
      file: 'dist/js/scenario_comparison_map.js',
      format: 'umd',
      name: 'ScenarioMapComparison',
      sourcemap: !production ? 'inline' : false,
    },
    plugins: plugins
  }
];
