import { Buff, Stream }             from '@cmdcode/buff-utils'
import { getTapBranch, merkleize }  from './script.js'
import { getTapTweak, tweakPubkey } from './tweak.js'
import { TapTree }                  from './types.js'

const DEFAULT_VERSION = 0xc0

export function getTapPath (
  pubkey  : string | Uint8Array,
  target  : string,
  taptree : TapTree = [ target ],
  version = DEFAULT_VERSION,
  parity  = 0
) : string {
  // Parse the 32-33 byte public key.
  const [ pub, par ] = parsePubkey(pubkey)
  // Set the parity bit based on info we have collected.
  parity = (par !== undefined) ? par : parity
  // Create the control block and append pubkey.
  const ctrl  = Buff.num(version + getParityBit(parity))
  const block = [ ctrl, pub ]
  // Merkelize the leaves into a root hash (with proof).
  const [ root, _t, path ] = merkleize(taptree, target)

  if (taptree.length > 1) {
    // If there is more than one path, add to block.
    path.forEach(e => block.push(Buff.hex(e)))
  }

  // Merge the data together into one array.
  const cblock = Buff.join(block)
  // Calculate the tweak for the pubkey.
  const tweak  = getTapTweak(pub, Buff.hex(root))
  // Tweak the public key.
  const tapkey = tweakPubkey(pub, tweak).slice(1)

  if (!checkTapPath(tapkey, cblock, target)) {
    if (parity === 0) {
      return getTapPath(pubkey, target, taptree, version, 1)
    }
    throw new Error('Path checking failed! Unable to generate path.')
  }

  return cblock.hex
}

export function checkTapPath (
  tapkey : string | Uint8Array,
  cblock : string | Uint8Array,
  target : string
) : boolean {
  const buffer    = new Stream(Buff.normalize(cblock))
  const [ _v, y ] = decodeCByte(buffer.read(1).num)
  const intkey    = buffer.read(32)
  const pubkey    = Buff.join([ y, Buff.normalize(tapkey) ])

  const path = []

  let branch = target

  while (buffer.size >= 32) {
    path.push(buffer.read(32).hex)
  }

  if (buffer.size !== 0) {
    throw new Error('Invalid control block size!')
  }

  for (const p of path) {
    branch = getTapBranch(branch, p)
  }

  const t = getTapTweak(intkey, Buff.hex(branch))
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

function parsePubkey (
  pubkey : string | Uint8Array
) : [ Uint8Array, number | undefined ] {
  let parity
  pubkey = Buff.normalize(pubkey)
  if (pubkey.length > 32) {
    parity = pubkey[0]
    pubkey = pubkey.slice(1, 33)
  }
  return [ pubkey, parity ]
}
