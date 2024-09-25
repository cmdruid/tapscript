import { Test } from 'tape'
import { Buff } from '@cmdcode/buff'
import { Tap }  from '../../../src/index.js'
import tree_vectors     from './tree.vectors.json' assert { type: 'json' }
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

export function tweak_test(t : Test) : void {
  t.test('E2E test of tap-key tweaking', t => {
    const vectors : Vector[] = tree_vectors.vectors
    for (const vector of vectors) {
      // Unpack our vector data.
      const { internalPubkey, scripts, merkleRoot, tweakedPubkey, tweak, cblocks, leafHashes } = vector
      // Copy leaf array (so the original does not get mutated).
      if (scripts.length === 0) {
        t.test('Testing empty key tweak.', t => {
          t.plan(1)
          const tapkey = Tap.tweak.getPubKey(internalPubkey).slice(1)
          t.equal(tapkey.hex, tweakedPubkey, 'Tweaked pubs should match.')
        })
      } else {
        t.test('Testing key: ' + tweakedPubkey, t => {
          t.plan(3)
          const root = Tap.tree.getRoot(leafHashes)
          t.equal(Buff.raw(root).hex, merkleRoot, 'Root hash should match.')
          const taptweak = Tap.tweak.getTweak(internalPubkey, merkleRoot as string)
          t.equal(taptweak.hex, tweak, 'Tweak hash should match.')
          const tapkey = Tap.tweak.tweakPubKey(internalPubkey, taptweak).slice(1)
          t.equal(tapkey.hex, tweakedPubkey, 'Tweaked pubs should match.')
        })

        const leaves = flattenArray(leafHashes)
        
        for (let i = 0; i < leaves.length; i++) {
          t.test('Testing leaf: ' + leaves[i], t => {
            t.plan(2)
            const cbyte   = Buff.hex(cblocks[i]).slice(0, 1).num
            const version = cbyte & 0xfe
            const sbytes  = encodeScript(scripts[i]).hex
            const target = Tap.tree.getLeaf(sbytes, version)
            t.equal(target, leaves[i], 'Leaf hash should match.')
            const [ _, cblock ] = Tap.getPubKey(internalPubkey, { tree: leafHashes, target,  version })
            t.equal(cblock, cblocks[i], 'Control blocks should be equal.')
          })
        }
      }
    }
  })
}
