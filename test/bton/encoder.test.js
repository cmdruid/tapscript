import test from 'tape'
import BTON from '../../index.js'
import { ecVectors } from './vectors/encoder.js'

test('BTON.encode()', t => {
  for (const { label, input, target } of ecVectors) {
    t.test(label, async t => {
      t.plan(1)
      const res = await BTON.encode.tx(input)
      t.equal(res, target)
    })
  }
})
