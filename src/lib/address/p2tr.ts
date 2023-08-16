import { Buff, Bytes } from '@cmdcode/buff-utils'
import { check_size }  from '../utils.js'

import { BECH32_PREFIXES, lookup } from './const.js'

import { assert } from '../../lib/utils.js'

import {
  AddressData,
  Network,
  ScriptData,
  Word
} from '../../schema/index.js'

import { Bech32m } from './encoder.js'

const VALID_PREFIXES = [ 'bc1p', 'tb1p', 'bcrt1p' ]

export function check_address (
  address : string
) : boolean {
  for (const prefix of VALID_PREFIXES) {
    if (address.startsWith(prefix)) {
      return true
    }
  }
  return false
}

export function encode_keydata (
  keydata : Bytes,
  network : Network = 'main'
) : string {
  const prefix = BECH32_PREFIXES[network]
  const bytes = Buff.bytes(keydata)
  check_size(bytes, 32)
  return Bech32m.encode(prefix, bytes)
}

export function decode_address (
  address : string
) : AddressData {
  const meta = lookup(address)
  assert(meta !== null)
  const { type, network } = meta
  if (!check_address(address)) {
    throw new TypeError('Invalid segwit address!')
  }
  const { data, version } = Bech32m.decode(address)
  const script = create_script(data)
  assert(version === 1)
  return { type, data, network, script }
}

function create_address (
  input    : ScriptData,
  network ?: Network
) : string {
  const bytes = Buff.bytes(input)
  assert(bytes.length === 32)
  return encode_keydata(bytes, network)
}

export function create_script (
  keydata : Bytes
) : Word[] {
  const bytes = Buff.bytes(keydata)
  check_size(bytes, 32)
  return [ 'OP_1', bytes.hex ]
}

export const P2TR =  {
  create : create_address,
  encode : encode_keydata,
  decode : decode_address
}
