import { Buff } from '@cmdcode/buff'
import { encode_tapbranch } from './encode.js'

import {
  TapTree,
  TapProof
} from '../../types/index.js'

export function get_taproot (
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
    const branch = encode_tapbranch(leaves[i], leaves[i + 1])
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
