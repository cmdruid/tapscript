import { Buff, Stream }      from '@cmdcode/buff-utils'
import { SecretKey }         from '@cmdcode/crypto-utils'
import { getTweakedKey }     from './tweak.js'
import { safeThrow }         from '../utils.js'
import { xOnlyPub }          from './utils.js'
import { getTapBranch, merkleize }      from './tree.js'
import { CtrlBlock, TapConfig, TapKey } from './types.js'
import { Bytes } from '../../schema/types.js'

const DEFAULT_VERSION = 0xc0

export function getTapSecKey (
  seckey  : Bytes,
  config  : TapConfig = {}
) : TapKey {
  return getTapKey(seckey, { ...config, isPrivate: true })
}

export function getTapPubKey (
  pubkey  : Bytes,
  config  : TapConfig = {}
) : TapKey {
  return getTapKey(pubkey, { ...config, isPrivate: false })
}

function getTapKey (
  intkey : Bytes,
  config : TapConfig = {}
) : TapKey {
  const {
    isPrivate = false,
    tree      = [],
    version   = DEFAULT_VERSION
  } = config

  const pubkey = (isPrivate)
    ? new SecretKey(intkey).pub.rawX
    : xOnlyPub(intkey)

  let { target } = config

  if (target !== undefined) target = Buff.bytes(target).hex

  let tapkey, ctrlpath : string[] = []

  if (tree.length > 0) {
    // Merkelize the leaves into a root hash (with proof).
    const [ root, _t, path ] = merkleize(tree, target)
    // Get the control path from the merkelized output.
    ctrlpath = path
    // Get the tapped key from the internal key.
    tapkey = getTweakedKey(intkey, root, isPrivate)
  } else {
    if (target !== undefined) {
      // Get the tapped key from the single tapleaf.
      tapkey = getTweakedKey(intkey, target, isPrivate)
    } else {
      // Get the tapped key from an empty tweak.
      tapkey = getTweakedKey(intkey, undefined, isPrivate)
    }
  }
  // Get the parity bit for the (public) tapkey.
  const parity : number = (isPrivate)
    ? new SecretKey(tapkey).point.raw[0]
    : tapkey[0]
  // Get the block version / parity bit.
  const cbit = Buff.num(version + readParityBit(parity))
  // Create the control block, starting with
  // the control bit and the (x-only) pubkey.
  const block = [ cbit, pubkey ]
  // If there is more than one path, add to block.
  if (ctrlpath.length > 0) {
    ctrlpath.forEach(e => block.push(Buff.hex(e)))
  }
  // Merge the data together into one array.
  const cblock = Buff.join(block)
  // If target is not undefined:
  if (target !== undefined) {
    // Check that the path is valid.
    if (!checkPath(tapkey, target, cblock, config)) {
      throw new Error('Path checking failed! Unable to generate path.')
    }
  }
  return [ xOnlyPub(tapkey).hex, cblock.hex ]
}

export function checkPath (
  tapkey : Bytes,
  target : Bytes,
  cblock : Bytes,
  config : TapConfig = {}
) : boolean {
  const { isPrivate = false, throws = false } = config
  const { parity, paths, intkey } = readCtrlBlock(cblock)

  const pub = (isPrivate)
    ? new SecretKey(tapkey).pub.rawX
    : xOnlyPub(tapkey)

  const extkey = Buff.join([ parity, pub ])

  if (extkey.length !== 33) {
    return safeThrow('Invalid tapkey: ' + extkey.hex, throws)
  }

  let branch = Buff.bytes(target).hex

  for (const path of paths) {
    branch = getTapBranch(branch, path)
  }

  const k = getTweakedKey(intkey, branch)

  // console.log('branch:', branch)
  // console.log('intkey:', Buff.raw(intkey).hex)
  // console.log('extkey:', extkey.hex)
  // console.log('tapkey:', k.hex)

  return (Buff.raw(k).hex === Buff.raw(extkey).hex)
}

export function readCtrlBlock (cblock : Bytes) : CtrlBlock {
  const buffer = new Stream(Buff.bytes(cblock))
  const cbyte  = buffer.read(1).num
  const intkey = buffer.read(32)
  const [ version, parity ] = (cbyte % 2 === 0)
    ? [ cbyte, 0x02 ]
    : [ cbyte - 1, 0x03 ]
  const paths  = []
  while (buffer.size >= 32) {
    paths.push(buffer.read(32).hex)
  }
  if (buffer.size !== 0) {
    throw new Error('Non-empty buffer on control block: ' + String(buffer))
  }
  return { intkey, paths, parity, version }
}

export function readParityBit (parity : number | string = 0x02) : number {
  if (parity === 0 || parity === 1) return parity
  if (parity === 0x02 || parity === '02') return 0
  if (parity === 0x03 || parity === '03') return 1
  throw new Error('Invalid parity bit: ' + String(parity))
}
