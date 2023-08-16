import { Buff, Bytes }  from '@cmdcode/buff-utils'
import { check_size }   from '../utils.js'
import { hash160pkh }   from './hash.js'

import assert from 'assert'

import {
  AddressData,
  Network,
  ScriptData,
  Word
} from '../../schema/index.js'

import { lookup } from './const.js'

function check_address (
  address : string,
  network : Network = 'main'
) : boolean {
  const prefixes = (network === 'main') ? [ '1' ] : [ 'm', 'n' ]
  for (const prefix of prefixes) {
    if (address.startsWith(prefix)) {
      return true
    }
  }
  return false
}

function encode_keydata (
  keydata : Bytes,
  network : Network = 'main'
) : string {
  /* Encode a pubkey hash into a p2pkh address. */
  const bytes  = Buff.bytes(keydata)
  const prefix = (network === 'main') ? Buff.num(0x00) : Buff.num(0x6F)
  check_size(keydata, 20)
  return bytes.prepend(prefix).tob58chk()
}

function decode_address (
  address  : string
) : AddressData {
  /* Decode a p2pkh address into a pubkey hash. */
  const meta = lookup(address)
  assert.ok(meta !== null)
  const { type, network } = meta
  if (!check_address(address, network)) {
    throw new TypeError('Invalid p2pkh address:' + address)
  }
  const data   = Buff.b58chk(address).slice(1)
  const script = create_script(data)
  return { type, data, network, script }
}

function create_address (
  input    : ScriptData,
  network ?: Network
) : string {
  const bytes = Buff.bytes(input)
  assert.ok(bytes.length === 33)
  const hash  = hash160pkh(bytes)
  return encode_keydata(hash, network)
}

function create_script (
  keydata : Bytes
) : Word[] {
  /* Create a p2pkh script template. */
  const bytes = Buff.bytes(keydata)
  check_size(bytes, 20)
  return [ 'OP_DUP', 'OP_HASH160', bytes.hex, 'OP_EQUALVERIFY', 'OP_CHECKSIG' ]
}

export const P2PKH = {
  create : create_address,
  encode : encode_keydata,
  decode : decode_address
}
