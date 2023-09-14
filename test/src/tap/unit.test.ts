import { Test } from 'tape'
import { Buff } from '@cmdcode/buff'
import { P2TR } from '@cmdcode/tapscript/address'

import { encode_script } from '@cmdcode/tapscript/script'

import {
  get_taptweak,
  encode_tapleaf,
  tap_pubkey,
  encode_tapbranch,
  verify_cblock
} from '@cmdcode/tapscript/tapkey'

import test_vectors from './unit.vectors.json' assert { type: 'json' }

export default function (t : Test) {
  t.test('Testing tapleaf creation:', t => {
    const vectors = test_vectors.tapleaf
    t.plan(vectors.length)
    for (const [ src, ans ] of vectors) {
      const s = encode_script(src)
      const leaf = encode_tapleaf(s, 0xc0)
      t.equal(leaf, ans, 'Tapleaf should match')
    }
  })
  t.test('Testing tapbranch creation', t => {
    const vectors = test_vectors.tapbranch
    t.plan(vectors.length)
    for (const [ src1, src2, ans ] of vectors) {
      const branch = encode_tapbranch(src1, src2)
      t.equal(branch, ans, 'Tapbranch should match')
    }
  })
  t.test('Testing taproot creation', t => {
    const vectors = test_vectors.taproot
    t.plan(vectors.length)
    for (const [ pub, root, ans ] of vectors) {
      const key = get_taptweak(Buff.hex(pub), Buff.hex(root))
      t.equal(Buff.raw(key).hex, ans, 'Taptweak should match')
    }
  }),
  t.test('Testing control block creation', t => {
    const vectors = test_vectors.ctrlblock
    t.plan(vectors.length)
    for (const { scripts, index, pubkey, cblock } of vectors) {
      const data    = scripts.map(e => encode_script(e))
      const leaves  = data.map(e => encode_tapleaf(e, 0xc0))
      const script  = Buff.raw(data[index]).hex
      const tapleaf = encode_tapleaf(script)
      const { cblock : block } = tap_pubkey(pubkey, { taptree: leaves, tapleaf })
      t.equal(block, cblock, 'Control block should match')
    }
  }),
  t.test('Testing control block validation', t => {
    const vectors = test_vectors.ctrlblock
    t.plan(vectors.length)
    for (const { address, scripts, index, cblock } of vectors) {
      const decoded = P2TR.decode(address)
      const script  = encode_script(scripts[index])
      const target  = encode_tapleaf(script)
      const isValid = verify_cblock(decoded.key, target, cblock)
      t.true(isValid, 'Control block should be valid.')
    }
  })
}
