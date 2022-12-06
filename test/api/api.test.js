import { Type } from '@cmdcode/buff-utils'
import camelcase from 'camelcase'
import pkg from '../../package.json' assert { type: 'json' }

const SOURCE_PATH = './src'
const DEFAULT_EXT = 'test.js'
const DEFAULT_LIB = '../src/index.js'

let testCache

export default async function (t) {
  testCache = t
  const libName = camelcase(String('/' + pkg.name).split('/').at(-1))
  const mainLib = await getLibrary(libName)
  crawlAPI(mainLib)
}

async function getLibrary(libName) {
  if (typeof window !== 'undefined') {
    return window[libName]
  }

  const libpath = (process?.argv && process.argv.length > 2)
    ? process.argv.slice(2,3)
    : DEFAULT_LIB

  if (String(libpath).includes('main')) {
    throw new Error('Unable to run tests on a commonJs module!')
  }

  console.log(`Testing package: ${libpath}`)

  return import('../' + libpath).then(m => {
    return (m.default)
      ? m.default
      : m
  })
}

async function crawlAPI(lib, paths = []) {
  for (const [key, val] of Object.entries(lib)) {
    // console.log(`Crawling ${key}: ${Type.of(val)}`)
    if (Type.is.class(val)) {
      const newpath = [...paths, key]
      testInstance(val, newpath)
      crawlAPI(val, newpath)
      console.log('Registering tests for class:', key)
    }

    else if (Type.is.function(val)) {
      testLoader(key, val, paths)
    }

    else if (Type.is.object(val)) {
      const newpath = [...paths, key]
      crawlAPI(val, newpath)
    }

    else {
      // console.log(paths, val)
    }
  }
}

async function testInstance(val, paths) {
  const newpath = [...paths, 'new']
  for (const prop of Object.getOwnPropertyNames(val.prototype)) {
    testLoader(prop, val, newpath)
  }
}

async function testLoader(key, val, paths) {
  const relpath  = paths.join('/').toLowerCase()
  const fullpath = `${SOURCE_PATH}/${relpath}/${key}.${DEFAULT_EXT}`
  import(fullpath)
    .then(importedTests => {
      for (const method of Object.keys(importedTests)) {
        testCache.test(fullpath.split('/').at(-1), t => {
          console.log(`Running ${method} tests:\n`)
          importedTests[method](t, val)
        })
      }
    })
    .catch(err => {
      if (err.message.includes('Cannot find module')) return
      console.log(`Failed to import test for: ${fullpath}\n${err}`)
    })
}
