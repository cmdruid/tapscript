import { Buff, Bytes } from '@cmdcode/buff-utils'
import { check_size }  from '../utils.js'
import { hash160sh }   from './hash.js'

import * as Script from '../script/index.js'

import {
  AddressData,
  Network,
  ScriptData,
  Word
} from '../../schema/index.js'

import { lookup } from './const.js'
import { assert } from '../../lib/utils.js'

export function check_address (
  address : string,
  network : Network = 'main'
) : boolean {
  const prefixes = (network === 'main') ? [ '3' ] : [ '2' ]
  for (const prefix of prefixes) {
    if (address.startsWith(prefix)) {
      return true
    }
  }
  return false
}

export function encode_keydata (
  input   : Bytes,
  network : Network = 'main'
) : string {
  const prefix = (network === 'main') ? Buff.num(0x05) : Buff.num(0xC4)
  const bytes  = Buff.bytes(input)
  check_size(bytes, 20)
  return bytes.prepend(prefix).tob58chk()
}

export function decode_address (
  address : string
) : AddressData {
  const meta = lookup(address)
  assert(meta !== null)
  const { type, network } = meta
  if (!check_address(address, network)) {
    throw new TypeError('Invalid p2sh address:' + address)
  }
  const data   = Buff.b58chk(address).slice(1)
  const script = create_script(data)
  return { type, data, network, script }
}

function create_address (
  input    : ScriptData,
  network ?: Network
) : string {
  const bytes = Script.to_bytes(input, false)
  const hash  = hash160sh(bytes)
  return encode_keydata(hash, network)
}

export function create_script (
  keydata : Bytes
) : Word[] {
  const bytes = Buff.bytes(keydata)
  check_size(bytes, 20)
  return [ 'OP_HASH160', bytes.hex, 'OP_EQUAL' ]
}

export const P2SH = {
  create : create_address,
  encode : encode_keydata,
  decode : decode_address
}
