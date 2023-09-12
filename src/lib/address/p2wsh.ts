import { Buff, Bytes } from '@cmdcode/buff'
import { sha256sh }    from './hash.js'
import { Bech32 }      from './encoder.js'

import { BECH32_PREFIXES, lookup } from './const.js'

import * as assert from '../assert.js'
import * as Script from '../script/index.js'

import {
  AddressData,
  Network,
  ScriptData,
  Word
} from '../../types/index.js'

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
  assert.size(bytes, 32)
  return Bech32.encode(prefix, bytes)
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
  const bytes = Script.to_bytes(input, false)
  const hash  = sha256sh(bytes)
  return encode_keydata(hash, network)
}

export function create_script (
  keydata : Bytes
) : Word[] {
  const bytes = Buff.bytes(keydata)
  assert.size(bytes, 32)
  return [ 'OP_0', bytes.hex ]
}

export default {
  create : create_address,
  encode : encode_keydata,
  decode : decode_address
}
