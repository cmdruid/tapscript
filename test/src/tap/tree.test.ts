import { Test } from 'tape'
import { Buff } from '@cmdcode/buff-utils'
import { Key, Tree, Tweak } from '../../../src/index.js'
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
          const [ tapkey ] = Key.tapPubKey(internalPubkey)
          t.equal(tapkey, tweakedPubkey, 'Tweaked pubs should match.')
        })
      } else {
        t.test('Testing key: ' + tweakedPubkey, t => {
          t.plan(3)
          const root = Tree.getRoot(leafHashes)
          t.equal(Buff.raw(root).hex, merkleRoot, 'Root hash should match.')
          const taptweak = Tweak.getTweak(internalPubkey, merkleRoot as string)
          t.equal(Buff.raw(taptweak).hex, tweak, 'Tweak hash should match.')
          const [ tapkey ]= Key.tapPubKey(internalPubkey, root)
          t.equal(tapkey, tweakedPubkey, 'Tweaked pubs should match.')
        })

        const leaves = flattenArray(leafHashes)
        
        for (let i = 0; i < leaves.length; i++) {
          t.test('Testing leaf: ' + leaves[i], t => {
            t.plan(2)
            const cbyte   = Buff.hex(cblocks[i]).slice(0, 1).num
            const version = cbyte & 0xfe
            const script  = Buff.raw(encodeScript(scripts[i])).hex

            const tapleaf = Tree.getLeaf(script, version)
            t.equal(tapleaf, leaves[i], 'Leaf hash should match.')

            const target = leaves[i]
            const [ _, cblock ] = Key.tapPubKey(internalPubkey, target, { tree: leafHashes, version })
            t.equal(cblock, cblocks[i], 'Control blocks should be equal.')
          })
        }
      }
    }
  })
}
