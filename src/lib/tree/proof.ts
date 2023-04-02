import { Buff, Stream }             from '@cmdcode/buff-utils'
import { getTapBranch, merkleize }  from './script.js'
import { getTapTweak, tweakPubkey } from './tweak.js'
import { ProofConfig }              from './types.js'
import { safeThrow }                from '../utils.js'

const DEFAULT_VERSION = 0xc0

export function getTapPath (
  pubkey  : string | Uint8Array,
  target  : string,
  config  : ProofConfig = {}
) : string {
  const { version = DEFAULT_VERSION, parity = 0, tree = [] } = config
  // Parse the 32-33 byte public key.
  const [ pub, par ] = parsePubkey(pubkey)
  // Set the parity bit based on info we have collected.
  const p = (par !== undefined) ? par : parity
  // Get the block version / parity bit.
  const cbit = Buff.num(version + getParityBit(p))
  // Create the control block and append pubkey.
  const block = [ cbit, pub ]
  // Make sure the tree contains at least one leaf.
  if (tree.length < 1) {
    tree.push(target)
  }
  // Merkelize the leaves into a root hash (with proof).
  const [ root, _t, path ] = merkleize(tree, target)

  if (tree.length > 1) {
    // If there is more than one path, add to block.
    path.forEach(e => block.push(Buff.hex(e)))
  }

  // Merge the data together into one array.
  const cblock = Buff.join(block)
  // Calculate the tweak for the pubkey.
  const tweak  = getTapTweak(pub, Buff.hex(root))
  // Tweak the public key.
  const tapkey = tweakPubkey(pub, tweak).slice(1)

  // console.log('intkey:', Buff.bytes(pubkey).hex)
  // console.log('tapkey:', Buff.raw(tapkey).hex)
  // console.log('cblock:', cblock.hex)
  // console.log('target:', target)

  if (!checkTapPath(tapkey, cblock, target, true)) {
    if (parity === 0) {
      return getTapPath(pubkey, target, { ...config, parity: 1 })
    }
    throw new Error('Path checking failed! Unable to generate path.')
  }

  return cblock.hex
}

export function checkTapPath (
  tapkey : string | Uint8Array,
  cblock : string | Uint8Array,
  target : string,
  throws = false
) : boolean {
  const buffer    = new Stream(Buff.bytes(cblock))
  const [ _v, p ] = decodeCByte(buffer.read(1).num)
  const intkey    = Buff.join([ p, buffer.read(32) ])
  const pubkey    = Buff.join([ p, Buff.bytes(tapkey) ])

  if (pubkey.length !== 33) {
    return safeThrow('Invalid tapkey: ' + pubkey.hex, throws)
  }

  const path = []

  let branch = target

  while (buffer.size >= 32) {
    path.push(buffer.read(32).hex)
  }

  if (buffer.size !== 0) {
    return safeThrow('Invalid control block size!', throws)
  }

  for (const b of path) {
    branch = getTapBranch(branch, b)
  }

  const t = getTapTweak(intkey, branch)
  const k = tweakPubkey(intkey, t)

  // console.log('tweak:', t.hex)
  // console.log('branch:', branch)
  // console.log('intkey:', intkey.hex)
  // console.log('pubkey:', pubkey.hex)
  // console.log('tapkey:', k.hex)

  return (Buff.raw(k).hex === Buff.raw(pubkey).hex)
}

export function getParityBit (parity : number | string = 0x02) : number {
  if (parity === 0 || parity === 1) return parity
  if (parity === 0x02 || parity === '02') return 0
  if (parity === 0x03 || parity === '03') return 1
  throw new Error('Invalid parity bit: ' + String(parity))
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
