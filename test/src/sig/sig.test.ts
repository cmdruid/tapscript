import { Test } from 'tape'

import {
  sighash_vector_test
} from './segwit/sighash.test.js'

import {
  test_computehash,
  test_signatures
} from './taproot/sig.test.js'

export default async function sig_tests (t : Test) : Promise<void> {
  t.test('Segwit signature tests', t => {
    sighash_vector_test(t)
  })
  t.test('Taproot signature tests', async t => {
    test_computehash(t)
    await test_signatures(t)
  })
}
