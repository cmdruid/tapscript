import tape from 'tape'

import address_tests  from './src/addr/addr.test.js'
import sig_tests      from './src/sig/sig.test.js'
import tx_tests       from './src/tx/tx.test.js'
import { unit_tests } from './src/tap/unit.test.js'
import { tweak_test } from './src/tap/tree.test.js'

import example_tests  from './example/ex_test.js'

tape('Tapscript Test Suite', async t => {

  t.test('Address Tests', t => {
    address_tests(t)
  })

  t.test('Signature Tests', async t => {
    await sig_tests(t)
  })

  t.test('Transaction Tests', t => {
    tx_tests(t)
  })

  t.test('Tapscript Tests', async t => {
    tweak_test(t)
    await unit_tests(t)
  })

  await example_tests(t)
})
