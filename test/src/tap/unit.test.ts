import { Test }          from 'tape'
import { Buff }          from '@cmdcode/buff-utils'
import test_vectors      from './unit.vectors.json' assert { type: 'json' }
import { encode_script } from '../../../src/lib/script/encode.js'

import { Tap, Script, Address } from '../../../src/index.js'

export default function (t : Test) {
  t.test('Testing tapleaf creation:', t => {
    const vectors = test_vectors.tapleaf
    t.plan(vectors.length)
    for (const [ src, ans ] of vectors) {
      const s = encode_script(src)
      const leaf = Tap.encode.leaf(s, 0xc0)
      t.equal(leaf, ans, 'Tapleaf should match')
    }
  })
  t.test('Testing tapbranch creation', t => {
    const vectors = test_vectors.tapbranch
    t.plan(vectors.length)
    for (const [ src1, src2, ans ] of vectors) {
      const branch = Tap.encode.branch(src1, src2)
      t.equal(branch, ans, 'Tapbranch should match')
    }
  })
  t.test('Testing taproot creation', t => {
    const vectors = test_vectors.taproot
    t.plan(vectors.length)
    for (const [ pub, root, ans ] of vectors) {
      const key = Tap.tweak.get_tweak(Buff.hex(pub), Buff.hex(root))
      t.equal(Buff.raw(key).hex, ans, 'Taptweak should match')
    }
  }),
  t.test('Testing control block creation', t => {
    const vectors = test_vectors.ctrlblock
    t.plan(vectors.length)
    for (const { scripts, index, pubkey, cblock } of vectors) {
      const data   = scripts.map(e => Script.encode(e))
      const leaves = data.map(e => Tap.encode.leaf(e, 0xc0))
      const script = Buff.raw(data[index]).hex
      const target = Tap.encode.leaf(script)
      const { cblock : block } = Tap.key.from_pubkey(pubkey, { tree: leaves, target })
      t.equal(block, cblock, 'Control block should match')
    }
  }),
  t.test('Testing control block validation', t => {
    const vectors = test_vectors.ctrlblock
    t.plan(vectors.length)
    for (const { address, scripts, index, cblock } of vectors) {
      const decoded  = Address.P2TR.decode(address)
      const script  = Script.encode(scripts[index])
      const target  = Tap.encode.leaf(script)
      const isValid = Tap.key.check_proof(decoded.data, target, cblock)
      t.true(isValid, 'Control block should be valid.')
    }
  })
}
