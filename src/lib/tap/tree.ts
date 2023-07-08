import { Buff }              from '@cmdcode/buff-utils'
import { TapTree, TapProof } from './types.js'
import { Bytes, ScriptData } from '../../schema/types.js'
import { Script } from '../script/index.js'

const DEFAULT_VERSION = 0xc0

export function getTapTag (tag : string) : Buff {
  const htag = Buff.str(tag).digest
  return Buff.join([ htag, htag ])
}

export function getTapLeaf (
  data : Bytes,
  version = DEFAULT_VERSION
) : string {
  return Buff.join([
    getTapTag('TapLeaf'),
    getVersion(version),
    Buff.bytes(data)
  ]).digest.hex
}

export function getTapScript (
  script   : ScriptData,
  version ?: number
) : string {
  return getTapLeaf(Script.fmt.toBytes(script), version)
}

export function getTapBranch (
  leafA : string,
  leafB : string
) : string {
  // Compare leaves in lexical order.
  if (leafB < leafA) {
    // Swap leaves if needed.
    [ leafA, leafB ] = [ leafB, leafA ]
  }
  // Return digest of leaves as a branch hash.
  return Buff.join([
    getTapTag('TapBranch'),
    Buff.hex(leafA).raw,
    Buff.hex(leafB).raw
  ]).digest.hex
}

export function getTapRoot (
  leaves : TapTree
) : Buff {
  // Merkelize the leaves into a root hash.
  return Buff.hex(merkleize(leaves)[0])
}

export function merkleize (
  taptree  : TapTree,
  target  ?: string,
  path     : string[] = []
) : TapProof {
  const leaves : string[] = []
  const tree   : string[] = []

  if (taptree.length < 1) {
    throw new Error('Tree is empty!')
  }

  // If there are any nested leaves,
  // resolve them before moving on.
  for (let i = 0; i < taptree.length; i++) {
    const leaf = taptree[i]
    if (Array.isArray(leaf)) {
      const [ r, t, p ] = merkleize(leaf, target)
      target = t
      leaves.push(r)
      for (const e of p) {
        path.push(e)
      }
    } else { leaves.push(leaf) }
  }

  // If there is only one leaf,
  // then return it as the root.
  if (leaves.length === 1) {
    return [ leaves[0], target, path ]
  }
  // Ensure the tree is sorted.
  leaves.sort()
  // Ensure the tree is balanced evenly.
  if (leaves.length % 2 !== 0) {
    // If uneven, duplicate the last leaf.
    leaves.push(leaves[leaves.length - 1])
  }

  // Sort through the leaves (two at a time).
  for (let i = 0; i < leaves.length - 1; i += 2) {
    // Compute two leaves into a branch.
    const branch = getTapBranch(leaves[i], leaves[i + 1])
    // Push our branch to the tree.
    tree.push(branch)
    // Check if a proof target is specified.
    if (typeof target === 'string') {
      // Check if this branch is part of our proofs.
      if (target === leaves[i]) {
        // If so, include right-side of branch.
        path.push(leaves[i + 1])
        target = branch
      } else if (target === leaves[i + 1]) {
        // If so, include left-side of branch.
        path.push(leaves[i])
        target = branch
      }
    }
  }
  return merkleize(tree, target, path)
}

export function getVersion (version = 0xc0) : number {
  return version & 0xfe
}
