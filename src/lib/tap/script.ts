import { Buff }              from '@cmdcode/buff-utils'
import { Hash }              from '@cmdcode/crypto-utils'
import { TapTree, TapProof } from './types.js'

const DEFAULT_VERSION = 0xc0
const ec = new TextEncoder()

export async function getTapTag (tag : string) : Promise<Uint8Array> {
  const htag = await Hash.sha256(ec.encode(tag))
  return Uint8Array.of(...htag, ...htag)
}

export async function getTapLeaf (
  data : string | Uint8Array,
  version = DEFAULT_VERSION
) : Promise<string> {
  return Hash.sha256(Uint8Array.of(
    ...await getTapTag('TapLeaf'),
    getVersion(version),
    ...Buff.normalize(data)
  )).then(e => Buff.raw(e).hex)
}

export async function getTapBranch (
  leafA : string,
  leafB : string
) : Promise<string> {
  if (leafB < leafA) {
    // Ensure that both branches
    // are sorted lexographically.
    [ leafA, leafB ] = [ leafB, leafA ]
  }
  return Hash.sha256(Uint8Array.of(
    ...await getTapTag('TapBranch'),
    ...Buff.hex(leafA).raw,
    ...Buff.hex(leafB).raw
  )).then(e => Buff.raw(e).hex)
}

export async function getTapRoot (
  leaves : TapTree
) : Promise<Uint8Array> {
  // Merkelize the leaves into a root hash.
  return merkleize(leaves).then(r => Buff.hex(r[0]))
}

export function decodeTapAddress (
  address : string
) : Uint8Array {
  return Buff.bech32(address, 1)
}

export function encodeTapAddress (
  tapkey : string | Uint8Array,
  prefix = 'bc'
) : string {
  tapkey = Buff.normalize(tapkey)
  if (tapkey.length > 32) {
    tapkey = tapkey.slice(1, 33)
  }
  return Buff.raw(tapkey).toBech32(prefix, 1)
}

export async function merkleize (
  taptree : TapTree,
  target  : string | null = null,
  path    : string[] = []
) : Promise<TapProof> {
  const leaves : string[] = []
  const tree   : string[] = []

//   console.log(`
// Tree: ${JSON.stringify(taptree, null, 2)}
// Target: ${String(target)}
// Path: ${JSON.stringify(path, null, 2)}
// `)

  // If there are nested leaves, resolve them.
  for (let i = 0; i < taptree.length; i++) {
    const leaf = taptree[i]
    // console.log('leaf:', leaf)
    if (Array.isArray(leaf)) {
      const [ r, t, p ] = await merkleize(leaf, target)
      leaves.push(r); target = t; path.push(...p)
    } else { leaves.push(leaf) }
  }

  // If there is only one leaf,
  // then return it as the root.
  if (leaves.length === 1) {
    // console.log('root:', leaves[0])
    return [ leaves[0], target, path ]
  }
  // Ensure the tree is sorted.
  leaves.sort()
  // Ensure the tree is balanced.
  if (leaves.length % 2 !== 0) {
    // If uneven, duplicate the last leaf.
    leaves.push(leaves[leaves.length - 1])
  }

  // console.log(leaves)

  // Sort through the leaves (two at a time).
  for (let i = 0; i < leaves.length - 1; i += 2) {
    // Compute two leaves into a branch.
    const branch = await getTapBranch(leaves[i], leaves[i + 1])
    // Push our branch to the tree.
    tree.push(branch)
    // Check if a proof target is specified.
    if (typeof target === 'string') {
      // Check if this branch is part of our proofs.
      if (target === leaves[i]) {
        // Include right-side of branch.
        // console.log('append i1:', leaves[i + 1])
        path.push(leaves[i + 1])
        target = branch
      } else if (target === leaves[i + 1]) {
        // Include left-side of branch.
        // console.log('append i:', leaves[i])
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
