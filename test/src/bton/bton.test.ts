import { Test } from 'tape'
import { Tx } from '../../../src/index.js'

import { ecVectors } from './vectors/encoder.js'
import { dcVectors } from './vectors/decoder.js'

export function tx_decode (t : Test) {
  t.test('Testing TX Decoder', t => {
    for (const { label, input, target } of dcVectors) {
      t.test(label, async t => {
        t.plan(1)
        const res = Tx.decode(input)
        t.deepEqual(res, target)
      })
    }
  })
}

export function tx_encode (t : Test) {
  t.test('Testing TX Encoder', t => {
    for (const { label, input, target } of ecVectors) {
      t.plan(1)
      const res = Tx.encode(input)
      t.equal(res, target)
    }
  })
}
