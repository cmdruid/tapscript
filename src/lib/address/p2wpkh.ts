import { Buff, Bytes } from '@cmdcode/buff'
import { hash160pkh }  from './hash.js'

import { BECH32_PREFIXES, lookup } from './const.js'

import * as assert from '../assert.js'

import {
  AddressData,
  Network,
  ScriptData,
  Word
} from '../../types/index.js'

import { Bech32 } from './encoder.js'

const VALID_PREFIXES = [ 'bc1q', 'tb1q', 'bcrt1q' ]

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
  assert.size(bytes, 20)
  return Bech32.encode(prefix, bytes, 0)
}

export function decode_address (
  address : string
) : AddressData {
  const meta = lookup(address)
  assert.ok(meta !== null)
  const { type, network } = meta
  if (!check_address(address)) {
    throw new TypeError('Invalid segwit address!')
  }
  const { data, version } = Bech32.decode(address)
  const script = create_script(data)
  assert.ok(version === 0)
  return { type, key: data, network, script }
}

function create_address (
  input    : ScriptData,
  network ?: Network
) : string {
  const bytes = Buff.bytes(input)
  assert.size(bytes, 33)
  const hash  = hash160pkh(bytes)
  return encode_keydata(hash, network)
}

export function create_script (
  keydata : Bytes
) : Word[] {
  const bytes = Buff.bytes(keydata)
  assert.size(bytes, 20)
  return [ 'OP_0', bytes.hex ]
}

export default {
  create : create_address,
  encode : encode_keydata,
  decode : decode_address
}
