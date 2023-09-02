import { Buff, Bytes } from '@cmdcode/buff-utils'
import { keys }        from '@cmdcode/crypto-utils'

import * as assert from '../assert.js'

import { merkleize }       from './tree.js'
import { encode_branch }   from './encode.js'

import {
  get_tweak,
  tweak_pubkey,
  tweak_seckey
} from './tweak.js'

import {
  parse_cblock,
  parse_parity_bit
} from './parse.js'

import {
  TapConfig,
  TapKey
} from '../../types/index.js'

const DEFAULT_VERSION = 0xc0

export function from_seckey (
  seckey  : Bytes,
  config ?: TapConfig
) : TapKey {
  return get_tapkey(seckey, { ...config, is_secret: true })
}

export function from_pubkey (
  pubkey  : Bytes,
  config ?: TapConfig
) : TapKey {
  return get_tapkey(pubkey, { ...config, is_secret: false })
}

function get_tapkey (
  int_key : Bytes,
  config  : TapConfig = {}
) : TapKey {
  const {
    is_secret = false,
    tree      = [],
    version   = DEFAULT_VERSION
  } = config

  const int_pub = (is_secret)
    ? keys.get_pubkey(int_key, true)
    : keys.convert_32(int_key)

  let { target } = config

  let taptweak : Buff,
      ctrlpath : string[] = []

  if (target !== undefined) {
    target = Buff.bytes(target).hex
    if (tree.length > 0) {
      // Merkelize the leaves into a root hash (with proof).
      const [ root, _t, path ] = merkleize(tree, target)
      // Get the control path from the merkelized output.
      ctrlpath = path
      // Get the tapped key from the internal key.
      taptweak = get_tweak(int_pub, root)
       // Get the tapped key from the single tapleaf.
    } else {
      taptweak = get_tweak(int_pub, target)
    }
  } else {
    // Get the tapped key from an empty tweak.
    taptweak = get_tweak(int_pub, new Uint8Array())
  }
  const fullkey = (is_secret)
    ? tweak_seckey(int_key, taptweak)
    : tweak_pubkey(int_pub, taptweak)
  const parity = parse_parity_bit(fullkey[0])
  const tapkey = keys.convert_32(fullkey).hex
  // Get the block version / parity bit.
  const cbit = Buff.num(version + parity)
  // Create the control block, starting with
  // the control bit and the (x-only) pubkey.
  const block = [ cbit, int_key ]
  // If there is more than one path, add to block.
  if (ctrlpath.length > 0) {
    ctrlpath.forEach(e => block.push(Buff.hex(e)))
  }
  // Merge the data together into one array.
  const cblock = Buff.join(block)

  return {
    parity,
    tapkey,
    target,
    version,
    cblock   : cblock.hex,
    int_pub  : int_pub.hex,
    path     : ctrlpath,
    taptweak : taptweak.hex
  }
}

export function check_proof (
  tapkey : Bytes,
  target : Bytes,
  cblock : Bytes
) : boolean {
  assert.size(tapkey, 32)
  const { parity, path, int_pub } = parse_cblock(cblock)

  const extkey = Buff.join([ parity, tapkey ])

  let branch = Buff.bytes(target).hex

  for (const leaf of path) {
    branch = encode_branch(branch, leaf)
  }

  const twk = get_tweak(int_pub, branch)
  const key = tweak_pubkey(int_pub, twk)

  // console.log('branch:', branch)
  // console.log('intkey:', int_pub)
  // console.log('extkey:', extkey.hex)
  // console.log('tapkey:', key.hex)

  return (Buff.raw(key).hex === Buff.raw(extkey).hex)
}
