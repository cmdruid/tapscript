import commonjs    from '@rollup/plugin-commonjs'
import nodeResolve from '@rollup/plugin-node-resolve'
import terser      from '@rollup/plugin-terser'
import typescript  from '@rollup/plugin-typescript'

const treeshake = {
	moduleSideEffects       : false,
	propertyReadSideEffects : false,
	tryCatchDeoptimization  : false
}

const ignored_warnings = [
//  { code: 'CIRCULAR_DEPENDENCY', message: 'node_modules/@scure/btc-signer' },
  { code: 'INVALID_ANNOTATION',  message : '@__PURE__'      }
]

const onwarn = (warning, rollupWarn) => {
  for (const { code, message } of ignored_warnings) {
    if (warning.code !== code) return
    if (
      message !== undefined &&
      warning.message.includes(message)
    ) {
      rollupWarn(warning)
    }
  }
}

export default {
  input: 'src/index.ts',
  onwarn,
  output: [
    {
      file: 'dist/main.cjs',
      format: 'cjs',
      sourcemap: true,
    },
    {
      file: 'dist/module.mjs',
      format: 'es',
      sourcemap: true,
      minifyInternalExports: false
    },
    {
      file: 'dist/bundle.min.js',
      format: 'iife',
      name: 'tapscript',
      plugins: [terser()],
      sourcemap: true,
    }
  ],
  plugins: [ typescript(), nodeResolve(), commonjs() ],
  strictDeprecations: true,
  treeshake
}
