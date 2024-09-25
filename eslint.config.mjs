import globals from 'globals'
import path    from 'node:path'

import js       from '@eslint/js'
import tsParser from '@typescript-eslint/parser'

import tsPlugin      from '@typescript-eslint/eslint-plugin'
import importPlugin  from 'eslint-plugin-import'
import nodePlugin    from 'eslint-plugin-n'
import promisePlugin from 'eslint-plugin-promise'

import { fileURLToPath } from 'node:url'
import { FlatCompat }    from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)

const compat = new FlatCompat({
  baseDirectory     : __dirname,
  recommendedConfig : js.configs.recommended,
  allConfig         : js.configs.all
})

export default [
  {
    ignores: [
      '**/demo',
      '**/dist',
      '**/node_modules',
      '**/scripts',
      '**/test',
      '**/eslint.config.mjs',
      '**/rollup.config.ts'
    ]
  },

  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
      },
      ecmaVersion   : 'latest',
      sourceType    : 'module',
      parser        : tsParser,
      parserOptions : {
        project         : ['./tsconfig.json'],
        tsconfigRootDir : process.cwd()
      },
    },

    plugins: {
      '@typescript-eslint' : tsPlugin,
      'import'             : importPlugin,
      'node'               : nodePlugin,
      'promise'            : promisePlugin,
    },

    files: ["src/**/*.ts"],

    rules: {
      semi                    : [2, 'never'],
      'one-var'               : 'off',
      'return-await'          : 'off',
      indent                  : 'off',
      'no-multi-spaces'       : 'off',
      'operator-linebreak'    : 'off',
      'array-bracket-spacing' : ['error', 'always'],

      'key-spacing': ['error', {
          multiLine: {
              beforeColon: true,
              afterColon: true,
          },

          align: {
              beforeColon: true,
              afterColon: true,
          },
      }],

      'promise/param-names': 'off',
      '@typescript-eslint/indent': 'off',
      '@typescript-eslint/return-await': [1, 'in-try-catch'],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/strict-boolean-expressions': 'off',
      '@typescript-eslint/restrict-plus-operands': 'off',
      '@typescript-eslint/no-base-to-string': 'off',
      '@typescript-eslint/naming-convention': 'off',
      '@typescript-eslint/array-type': 'off',
      '@typescript-eslint/key-spacing': 'off',
      '@typescript-eslint/consistent-type-imports': 'off',
      '@typescript-eslint/require-array-sort-compare': 'off',
      '@typescript-eslint/no-useless-constructor': 'off',

      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
        destructuredArrayIgnorePattern: '^_',
        ignoreRestSiblings: true,
      }],

      '@typescript-eslint/no-invalid-void-type': ['error', {
        allowInGenericTypeArguments: true,
      }],

      // '@typescript-eslint/type-annotation-spacing': [
      //   'error', {
      //     before: true,
      //     after: true,
      //     overrides: {
      //       arrow: {
      //         before: true,
      //         after: true,
      //       },
      //     },
      //   }
      // ],
    },
}];