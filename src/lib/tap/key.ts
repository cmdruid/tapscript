import { Buff, Bytes } from '@cmdcode/buff-utils'
import { keys }        from '@cmdcode/crypto-utils'

import assert from 'assert'

import { get_tweaked_key } from './tweak.js'
import { safeThrow }       from '../utils.js'
import { parse_xonly }     from './utils.js'
import { merkleize }       from './tree.js'
import { encode_branch }   from './encode.js'

import {
  parse_cblock,
  read_parity
} from './parse.js'

import {
  TapConfig,
  TapKey
} from '../../schema/index.js'

const DEFAULT_VERSION = 0xc0

export function get_seckey (
  seckey  : Bytes,
  config  : TapConfig = {}
) : TapKey {
  return get_tapkey(seckey, { ...config, isPrivate: true })
}

export function get_pubkey (
  pubkey  : Bytes,
  config  : TapConfig = {}
) : TapKey {
  return get_tapkey(pubkey, { ...config, isPrivate: false })
}

function get_tapkey (
  intkey : Bytes,
  config : TapConfig = {}
) : TapKey {
  const {
    isPrivate = false,
    tree      = [],
    version   = DEFAULT_VERSION
  } = config

  const int_key = (isPrivate)
    ? keys.get_pubkey(intkey, true)
    : Buff.bytes(intkey)

  assert.ok(int_key.length === 32)

  let { target } = config

  let tapkey : Buff, ctrlpath : string[] = []

  if (target !== undefined) {
    target = Buff.bytes(target).hex
    if (tree.length > 0) {
      // Merkelize the leaves into a root hash (with proof).
      const [ root, _t, path ] = merkleize(tree, target)
      // Get the control path from the merkelized output.
      ctrlpath = path
      // Get the tapped key from the internal key.
      tapkey = get_tweaked_key(intkey, root, isPrivate)
       // Get the tapped key from the single tapleaf.
    } else {
      tapkey = get_tweaked_key(intkey, target, isPrivate)
    }
  } else {
    // Get the tapped key from an empty tweak.
    tapkey = get_tweaked_key(intkey, undefined, isPrivate)
  }
  // Get the parity bit for the (public) tapkey.
  const parity : number = (isPrivate)
    ? keys.get_pubkey(tapkey, false)[0]
    : tapkey[0]
  // Get the block version / parity bit.
  const cbit = Buff.num(version + read_parity(parity))
  // Create the control block, starting with
  // the control bit and the (x-only) pubkey.
  const block = [ cbit, int_key ]
  // If there is more than one path, add to block.
  if (ctrlpath.length > 0) {
    ctrlpath.forEach(e => block.push(Buff.hex(e)))
  }
  // Merge the data together into one array.
  const cblock = Buff.join(block)
  // If target is not undefined:
  if (target !== undefined) {
    // Check that the path is valid.
    if (!check_proof(tapkey, target, cblock, config)) {
      throw new Error('Path checking failed! Unable to generate path.')
    }
  }
  return [ parse_xonly(tapkey).hex, cblock.hex ]
}

export function check_proof (
  tapkey : Bytes,
  target : Bytes,
  cblock : Bytes,
  config : TapConfig = {}
) : boolean {
  const { isPrivate = false, throws = false } = config
  const { parity, paths, intkey } = parse_cblock(cblock)

  const pub = (isPrivate)
    ? keys.get_pubkey(tapkey, true)
    : parse_xonly(tapkey)

  const extkey = Buff.join([ parity, pub ])

  if (extkey.length !== 33) {
    return safeThrow('Invalid tapkey: ' + extkey.hex, throws)
  }

  let branch = Buff.bytes(target).hex

  for (const path of paths) {
    branch = encode_branch(branch, path)
  }

  const k = get_tweaked_key(intkey, branch)

  // console.log('branch:', branch)
  // console.log('intkey:', Buff.raw(intkey).hex)
  // console.log('extkey:', extkey.hex)
  // console.log('tapkey:', k.hex)

  return (Buff.raw(k).hex === Buff.raw(extkey).hex)
}
