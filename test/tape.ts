import tape from 'tape'

import address_tests  from './src/addr/addr.test.js'
import { unit_tests } from './src/tap/unit.test.js'
import { bip_tests }  from './src/tap/bip.test.js'
import { tweak_test } from './src/tap/tree.test.js'

import {
  test_computehash,
  test_signatures
} from './src/tap/sig.test.js'

import {
  tx_encode,
  tx_decode
} from './src/bton/bton.test.js'

tape('BTON Test Suite', async t => {

  t.test('Address Tests', t => {
    address_tests(t)
  })

  // t.test('BIP Tests', t => {
  //   txTest(t)
  // })
  
  // t.test('Tapscript Unit Tests', async t => {
  //   await unit_tests(t)
  // })
  // t.test('BTON Tests', async t => {
  //   // tx_encode(t)
  //   // tx_decode(t)
  // })

  t.test('Tapscript Tests', async t => {
    await test_computehash(t)
    await test_signatures(t)
    tweak_test(t)
    await unit_tests(t)
  })
})
