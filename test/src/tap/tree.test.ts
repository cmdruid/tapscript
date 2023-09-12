import { Test } from 'tape'
import { Buff } from '@cmdcode/buff'
import { Tap }  from '../../../src/index.js'

import { encode_script } from '../../../src/lib/script/encode.js'

import tree_vectors from './tree.vectors.json' assert { type: 'json' }

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

export default function (t : Test) {
  t.test('E2E test of tap-key tweaking', t => {
    const vectors : Vector[] = tree_vectors.vectors
    for (const vector of vectors) {
      // Unpack our vector data.
      const { internalPubkey, scripts, merkleRoot, tweakedPubkey, tweak, cblocks, leafHashes } = vector
      // Copy leaf array (so the original does not get mutated).
      if (scripts.length === 0) {
        t.test('Testing empty key tweak.', t => {
          t.plan(1)
          const taptweak = Tap.tweak.get_tweak(internalPubkey)
          const tapkey = Tap.tweak.tweak_pubkey(internalPubkey, taptweak).slice(1)
          t.equal(tapkey.hex, tweakedPubkey, 'Tweaked pubs should match.')
        })
      } else {
        t.test('Testing key: ' + tweakedPubkey, t => {
          t.plan(3)
          const root = Tap.tree.get_root(leafHashes)
          t.equal(Buff.raw(root).hex, merkleRoot, 'Root hash should match.')
          const taptweak = Tap.tweak.get_tweak(internalPubkey, merkleRoot as string)
          t.equal(taptweak.hex, tweak, 'Tweak hash should match.')
          const tapkey = Tap.tweak.tweak_pubkey(internalPubkey, taptweak).slice(1)
          t.equal(tapkey.hex, tweakedPubkey, 'Tweaked pubs should match.')
        })

        const leaves = flattenArray(leafHashes)
        
        for (let i = 0; i < leaves.length; i++) {
          t.test('Testing leaf: ' + leaves[i], t => {
            t.plan(2)
            const cbyte   = Buff.hex(cblocks[i]).slice(0, 1).num
            const version = cbyte & 0xfe
            const sbytes  = encode_script(scripts[i]).hex
            const target = Tap.encode.leaf(sbytes, version)
            t.equal(target, leaves[i], 'Leaf hash should match.')
            const { cblock } = Tap.key.from_pubkey(internalPubkey, { tree: leafHashes, target,  version })
            t.equal(cblock, cblocks[i], 'Control blocks should be equal.')
          })
        }
      }
    }
  })
}
