import { Buff, Stream }             from '@cmdcode/buff-utils'
import { merkleize, getTapBranch }  from './script.js'
import { getTapTweak, tweakPubkey } from './tweak.js'
import { TapTree }                  from './types.js'

const DEFAULT_VERSION = 0xc0

export async function getTapPath (
  pubkey  : string | Uint8Array,
  target  : string,
  taptree : TapTree = [ target ],
  version = DEFAULT_VERSION,
  parity  = 0
) : Promise<string> {
  // Merkelize the leaves into a root hash (with proof).
  const p = Buff.normalize(pubkey)
  const [ root, _t, path ] = await merkleize(taptree, target)

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

  if (!await checkTapPath(tapkey, cblock, target)) {
    if (parity === 0) {
      return getTapPath(pubkey, target, taptree, version, 1)
    }
    throw new Error('Path checking failed! Unable to generate path.')
  }

  return cblock.hex
}

export async function checkTapPath (
  tapkey : string | Uint8Array,
  cblock : string | Uint8Array,
  target : string
) : Promise<boolean> {
  const buffer   = new Stream(Buff.normalize(cblock))
  const [ _v, y ] = decodeCByte(buffer.read(1).num)
  const intkey   = buffer.read(32)
  const pubkey   = Buff.of(y, ...Buff.normalize(tapkey))

  const path = []

  let branch = target

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
