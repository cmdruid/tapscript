import { Test } from 'tape'
import { Buff } from '@cmdcode/buff-utils'
import * as TAP from '../../../src/lib/tap/script.js'

import tree_vectors from './tree.vectors.json' assert { type: 'json' }
import { encodeScript } from '../../../src/lib/script/encode.js'

interface Vector {
  internalPubkey : string
  scripts        : string[]
  leafHashes     : Array<string | string[]>
  merkleRoot     : string | null
  tweak          : string
  tweakedPubkey  : string
  scriptPubKey   : string
  address        : string
  cblocks        : string[]
}

function flattenArray (
  arr : Array<string | string[]>
) : string[] {
  const ret : string[] = []
  for (const e of arr) {
    if (Array.isArray(e)) {
      ret.push(...flattenArray(e))
    } else { ret.push(e) }
  }
  return ret
}

export async function tweak_test(t : Test) : Promise<void> {
  t.test('E2E test of tap-key tweaking', async t => {
    const vectors : Vector[] = tree_vectors.vectors
    for (const vector of vectors) {
      // Unpack our vector data.
      const { internalPubkey, scripts, merkleRoot, tweakedPubkey, tweak, cblocks, leafHashes } = vector
      // Copy leaf array (so the original does not get mutated).
      if (scripts.length === 0) {
        t.test('Testing empty key tweak.', async t => {
          t.plan(1)
          const [ tapkey ] = await TAP.getTapKey(internalPubkey)
          t.equal(tapkey, tweakedPubkey, 'Tweaked pubs should match.')
        })
      } else {
        t.test('Testing key: ' + tweakedPubkey, async t => {
          t.plan(3)
          const root = await TAP.getTapRoot(leafHashes)
          t.equal(Buff.raw(root).hex, merkleRoot, 'Root hash should match.')
          const taptweak = await TAP.getTapTweak(internalPubkey, merkleRoot as string)
          t.equal(Buff.raw(taptweak).hex, tweak, 'Tweak hash should match.')
          const [ tapkey ] = (await TAP.getTapKey(internalPubkey, leafHashes))
          t.equal(tapkey, tweakedPubkey, 'Tweaked pubs should match.')
        })

        const leaves = flattenArray(leafHashes)
        
        for (let i = 0; i < leaves.length; i++) {
          t.test('Testing leaf: ' + leaves[i], async t => {
            t.plan(2)
            const cblock  = cblocks[i]
            const cbyte   = Buff.hex(cblocks[i]).slice(0, 1).num
            const parity  = (cbyte % 2 === 0) ? 0 : 1
            const version = cbyte & 0xfe
            const script  = Buff.raw(encodeScript(scripts[i])).hex

            const tapleaf = await TAP.getTapLeaf(script, version)
            t.equal(tapleaf, leaves[i], 'Leaf hash should match.')

            const target = leaves[i]
            const block  = await TAP.getTapPath(internalPubkey, leafHashes, target, version, parity, true)
            t.equal(block, cblocks[i], 'Control blocks should be equal.')
          })
        }
      }
    }
  })
}
