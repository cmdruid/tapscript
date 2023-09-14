import { Buff, Bytes } from '@cmdcode/buff'
import { convert_32b } from '@cmdcode/crypto-tools/keys'

import { merkleize }        from './tree.js'
import { encode_tapbranch } from './encode.js'
import { DEFAULT_VERSION }  from './const.js'
import { config_tapleaf }   from './util.js'

import {
  get_taptweak,
  tweak_pubkey
} from './tweak.js'

import {
  parse_cblock,
  parse_parity
} from './parse.js'

import {
  TapConfig,
  TapContext
} from '../../types/index.js'

import * as assert from '../assert.js'

export function tap_pubkey (
  pubkey : Bytes,
  config : TapConfig = {}
) : TapContext {
  const {
    taptree = [],
    version = DEFAULT_VERSION
  } = config

  let path    : string[] = [],
      taproot : string | undefined

  const int_pub = Buff.bytes(pubkey)

  const { data, extension, script } = config_tapleaf(config)

  assert.size(int_pub, 32)

  if (extension !== null) {
    if (taptree.length > 0) {
      // Merkelize the leaves into a root hash (with proof).
      const [ root, _, proofs ] = merkleize(taptree, extension)
      // Get the control path from the merkelized output.
      path    = proofs
      // Get the tapped key from the internal key.
      taproot = root
       // Get the tapped key from the single tapleaf.
    } else {
      taproot = extension
    }
  }

  const taptweak = get_taptweak(int_pub, taproot)
  const twk_key  = tweak_pubkey(int_pub, taptweak)
  const parity   = parse_parity(twk_key)
  const tapkey   = convert_32b(twk_key)
  // Get the block version / parity bit.
  const cbit = Buff.num(version + parity)
  // Create the control block, starting with
  // the control bit and the (x-only) pubkey.
  const block = [ cbit, int_pub.hex ]
  // If there is more than one path, add to block.
  if (path.length > 0) {
    path.forEach(e => block.push(Buff.hex(e)))
  }
  // Merge the data together into one array.
  const cblock = Buff.join(block)

  return {
    data,
    extension,
    parity,
    path,
    script,
    taproot,
    taptree,
    version,
    cblock   : cblock.hex,
    int_pub  : int_pub.hex,
    tapkey   : tapkey.hex,
    taptweak : taptweak.hex
  }
}

export function verify_cblock (
  tapkey : Bytes,
  target : Bytes,
  cblock : Bytes
) : boolean {
  assert.size(tapkey, 32)
  const { parity, path, int_pub } = parse_cblock(cblock)

  const extkey = Buff.join([ parity, tapkey ])

  let branch = Buff.bytes(target).hex

  for (const leaf of path) {
    branch = encode_tapbranch(branch, leaf)
  }

  const twk = get_taptweak(int_pub, branch)
  const key = tweak_pubkey(int_pub, twk)

  // console.log('branch:', branch)
  // console.log('intkey:', int_pub)
  // console.log('extkey:', extkey.hex)
  // console.log('tapkey:', key.hex)

  return (Buff.raw(key).hex === Buff.raw(extkey).hex)
}
