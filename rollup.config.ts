// rollup.config.ts
import json from '@rollup/plugin-json'
import typescript  from '@rollup/plugin-typescript'
// import terser      from '@rollup/plugin-terser'
import { terser } from 'rollup-plugin-terser'
import nodeResolve from '@rollup/plugin-node-resolve'
import commonjs    from '@rollup/plugin-commonjs'
import camelcase   from 'camelcase'

import pkg from './package.json' assert { type: 'json' }

const libName = camelcase(String('/' + pkg.name)).split('/').at(-1)

const treeshake = {
	moduleSideEffects: false,
	propertyReadSideEffects: false,
	tryCatchDeoptimization: false
}

const onwarn = warning => {
	// eslint-disable-next-line no-console
	console.error(
		'Building Rollup produced warnings that need to be resolved. ' +
			'Please keep in mind that the browser build may never have external dependencies!'
	);
	// eslint-disable-next-line unicorn/error-message
	throw Object.assign(new Error(), warning);
}

const tsConfig = { 
  compilerOptions: {
    declaration: false,
    declarationDir: null,
    declarationMap: false
  }
}

const nodeConfig = {
  input: 'src/index.ts',
  onwarn,
  output: [
    {
      file: 'dist/main.js',
      format: 'cjs',
      sourcemap: true,
    },
    {
      file: 'dist/module.js',
      format: 'es',
      sourcemap: true,
      minifyInternalExports: false
    },
  ],
  plugins: [json(), typescript(tsConfig), nodeResolve(), commonjs()],
  strictDeprecations: true,
  treeshake
}

const browserConfig = {
  input: 'src/index.ts',
  onwarn,
  output: [
    {
      file: 'dist/bundle.min.js',
      format: 'iife',
      name: libName,
      plugins: [terser()],
      sourcemap: true,
      globals: {
        crypto: 'crypto',
      }
    },
  ],
  external: ['crypto'],
  plugins: [json(), typescript(tsConfig), nodeResolve({ browser: true }), commonjs()],
  strictDeprecations: true,
  treeshake
}

// const testConfig = {
//   input: 'test/index.test.js',
//   onwarn,
//   output: [
//     {
//       file: 'test/browser.test.js',
//       format: 'iife',
//       name: 'test',
//       plugins: [terser()],
//       sourcemap: false,
//       inlineDynamicImports: true,
//       globals: {
//         crypto: 'crypto',
//         tape: 'tape'
//       }
//     }
//   ],
//   external: ['crypto', 'tape'],
//   plugins: [
//     json(), 
//     typescript({ ...tsConfig, sourceMap: false }), 
//     nodeResolve({ browser: true }), 
//     commonjs(),
//   ],
//   strictDeprecations: true,
//   treeshake
// }

export default [ nodeConfig, browserConfig, /* testConfig */ ];