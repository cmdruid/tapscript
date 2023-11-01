import { Buff, Bytes }   from '@cmdcode/buff'
import { hash160sh }     from './hash.js'
import { lookup }        from './const.js'
import { buffer_asm }    from '../script/parse.js'
import { encode_script } from '../script/encode.js'

import * as assert from '../assert.js'

import {
  AddressData,
  Network,
  ScriptData,
  ScriptWord
} from '../../types/index.js'

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
  assert.size(bytes, 20)
  return bytes.prepend(prefix).to_b58chk()
}

export function decode_address (
  address : string
) : AddressData {
  const meta = lookup(address)
  assert.ok(meta !== null)
  const { type, network } = meta
  if (!check_address(address, network)) {
    throw new TypeError('Invalid p2sh address:' + address)
  }
  const dat = Buff.b58chk(address).slice(1)
  const asm = create_script(dat)
  const hex = encode_script(asm, false).hex
  const key = dat.hex
  return { asm, hex, key, network, type }
}

function create_address (
  input    : ScriptData,
  network ?: Network
) : string {
  const bytes = buffer_asm(input, false)
  const hash  = hash160sh(bytes)
  return encode_keydata(hash, network)
}

export function create_script (
  keydata : Bytes
) : ScriptWord[] {
  const bytes = Buff.bytes(keydata)
  assert.size(bytes, 20)
  return [ 'OP_HASH160', bytes.hex, 'OP_EQUAL' ]
}

export default {
  create : create_address,
  encode : encode_keydata,
  decode : decode_address
}
