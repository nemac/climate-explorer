// rollup.config.js

//
//  "@rollup/plugin-babel": "^5.2.1",
//     "@rollup/plugin-node-resolve": "^9.0.0",
//
//     "rollup": "^2.31.0"

import babel from '@rollup/plugin-babel';
import nodeResolve from '@rollup/plugin-node-resolve';

let production = process.env.build_env === 'prod' || process.env.build_env === 'production';
let pkg = process.env.pkg;

const plugins = [
  nodeResolve()
];

if (production){
  plugins.push(
      babel({
        exclude: 'node_modules/**', // only transpile our source code
        babelHelpers: 'bundled',
      })
  )
}
let pages = [
  'cards_home',
  'climate_graphs',
  'climate_maps',
  'high_tide_flooding',
  'extreme_events',
  'index',
  'next_steps'
]; // Pages 404, error, about, faq, glossary do not have their own JS packages

let packages = []

for(const p of pages) {
  if (!pkg || p === pkg) {
    packages.push({
      input: `./js/${p}.js`,
      output: {
        file: `./dist/js/${p}.js`,
        format: 'umd',
        name: p,
        sourcemap: !production ? 'inline' : false,
      },
      plugins: plugins
    })
  }
}

export default packages;
