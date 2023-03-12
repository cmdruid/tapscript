import { Buff, Stream } from '@cmdcode/buff-utils'
import { Hash }         from '@cmdcode/crypto-utils'
import { tweakPubkey }  from '../sig/taproot.js'

import { TapTree, TapRoot, TapKey } from './types.js'

const DEFAULT_VERSION = 0xc0
const ec = new TextEncoder()

export async function getTapKey (
  pubkey : string | Uint8Array,
  leaves : TapTree = []
) : Promise<TapKey> {
  const p = Buff.normalize(pubkey)
  const r = (leaves.length > 0)
    ? await getTapRoot(leaves)
    : new Uint8Array()
  const t = await getTapTweak(p, r)
  const k = Buff.raw(tweakPubkey(p, t))
  return [ k.slice(1).hex, k.slice(0, 1).num ]
}

export async function getTapRoot (
  leaves : TapTree
) : Promise<Uint8Array> {
  // Merkelize the leaves into a root hash.
  return merkleize(leaves).then(r => Buff.hex(r[0]))
}

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

export async function getTapTweak (
  pubkey : string | Uint8Array,
  tweak  : string | Uint8Array
) : Promise<Uint8Array> {
  return Hash.sha256(Uint8Array.of(
    ...await getTapTag('TapTweak'),
    ...Buff.normalize(pubkey),
    ...Buff.normalize(tweak)
  ))
}

export async function getTapPath (
  pubkey  : string | Uint8Array,
  taptree : TapTree = [],
  target  : string,
  version = DEFAULT_VERSION,
  parity  = 0,
  isLeaf  = false
) : Promise<string> {
  // Merkelize the leaves into a root hash (with proof).
  const p = Buff.normalize(pubkey)
  const t = (isLeaf) ? target : await getTapLeaf(target, version)
  const [ root, _t, path ] = await merkleize(taptree, t)

  // Create the control block with pubkey.
  const ctrl  = Buff.num(version + getParityBit(parity))
  const block = [ ctrl, Buff.normalize(pubkey) ]

  if (taptree.length > 1) {
    // If there is more than one path, add to block.
    path.forEach(e => block.push(Buff.hex(e)))
  }

  const cblock = Buff.join(block)
  const tweak  = await getTapTweak(p, Buff.hex(root))
  const tapkey = tweakPubkey(p, tweak).slice(1)

  if (!await checkTapPath(tapkey, cblock, target, isLeaf)) {
    if (parity === 0) {
      return getTapPath(pubkey, taptree, target, version, 1, isLeaf)
    }
    throw new Error('Path checking failed! Unable to generate path.')
  }

  return cblock.hex
}

export async function checkTapPath (
  tapkey : string | Uint8Array,
  cblock : string | Uint8Array,
  target : string,
  isLeaf = false
) : Promise<boolean> {
  const buffer   = new Stream(Buff.normalize(cblock))
  const [ v, y ] = decodeCByte(buffer.read(1).num)
  const intkey   = buffer.read(32)
  const pubkey   = Buff.of(y, ...Buff.normalize(tapkey))

  const path = []

  let branch = (isLeaf) ? target : await getTapLeaf(target, v)

  while (buffer.size >= 32) {
    path.push(buffer.read(32).hex)
  }

  if (buffer.size !== 0) {
    throw new Error('Invalid control block size!')
  }

  for (const p of path) {
    branch = await getTapBranch(branch, p)
  }

  const t = await getTapTweak(intkey, Buff.hex(branch))
  const k = tweakPubkey(intkey, t)

  return (Buff.raw(k).hex === Buff.raw(pubkey).hex)
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
  if (tapkey.length > 32) {
    tapkey = tapkey.slice(1, 33)
  }
  return Buff.any(tapkey).toBech32(prefix, 1)
}

export async function merkleize (
  taptree : TapTree,
  target  : string | null = null,
  path    : string[] = []
) : Promise<TapRoot> {
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

export function getParityBit (parity : number | string = 0x02) : number {
  if (parity === 0 || parity === 1) return parity
  if (parity === 0x02 || parity === '02') return 0
  if (parity === 0x03 || parity === '03') return 1
  throw new Error('Invalid parity bit:' + String(parity))
}

export function decodeCByte (
  byte : number
) : number[] {
  return (byte % 2 === 0) ? [ byte, 0x02 ] : [ byte - 1, 0x03 ]
}
