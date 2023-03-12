import { Test } from 'tape'
import { Buff } from '@cmdcode/buff-utils'
import { Tap, Script } from '../../../src/index.js'
import test_vectors    from './unit.vectors.json' assert { type: 'json' }
import { encodeScript } from '../../../src/lib/script/encode.js'

export async function unit_tests(t : Test) : Promise<void> {
  t.test('Testing tapleaf creation:', async t => {
    const vectors = test_vectors.tapleaf
    t.plan(vectors.length)
    for (const [ src, ans ] of vectors) {
      const s = encodeScript(src)
      const leaf = await Tap.getLeaf(s, 0xc0)
      t.equal(leaf, ans, 'Tapleaf should match')
    }
  })
  t.test('Testing tapbranch creation', async t => {
    const vectors = test_vectors.tapbranch
    t.plan(vectors.length)
    for (const [ src1, src2, ans ] of vectors) {
      const branch = await Tap.getBranch(src1, src2)
      t.equal(branch, ans, 'Tapbranch should match')
    }
  })
  t.test('Testing taproot creation', async t => {
    const vectors = test_vectors.taproot
    t.plan(vectors.length)
    for (const [ pub, root, ans ] of vectors) {
      const key = await Tap.getTweak(Buff.hex(pub), Buff.hex(root))
      t.equal(Buff.raw(key).hex, ans, 'Taptweak should match')
    }
  }),
  t.test('Testing control block creation', async t => {
    const vectors = test_vectors.ctrlblock
    t.plan(vectors.length)
    for (const { scripts, index, pubkey, cblock } of vectors) {
      const data   = scripts.map(e => Script.encode(e))
      const leaves = await Promise.all(data.map(e => Tap.getLeaf(e, 0xc0)))
      const script = Buff.raw(data[index]).hex
      const target = await Tap.getLeaf(script)
      const block  = await Tap.getPath(pubkey, target, leaves)
      t.equal(block, cblock, 'Control block should match')
    }
  }),
  t.test('Testing control block validation', async t => {
    const vectors = test_vectors.ctrlblock
    t.plan(vectors.length)
    for (const { address, scripts, index, cblock } of vectors) {
      const tapkey  = Tap.decodeAddress(address)
      const script  = Script.encode(scripts[index])
      const target  = await Tap.getLeaf(script)
      const isValid = await Tap.checkPath(tapkey, cblock, target)
      t.true(isValid, 'Control block should be valid.')
    }
  })
}
