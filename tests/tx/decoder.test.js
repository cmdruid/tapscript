import test from 'tape'
import BTON from '../../index.js'
import { dcVectors } from './vectors/decoder.js'

test('BTON.decode()', t => {
  for (const { label, input, target } of dcVectors) {
    t.test(label, async t => {
      t.plan(1)
      const res = await BTON.decode.tx(input)
      t.deepEqual(res, target)
    })
  }
})
