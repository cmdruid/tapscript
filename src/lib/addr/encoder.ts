import {
  Buff,
  Bytes,
  Bech32  as B32,
  Bech32m as B32m
} from '@cmdcode/buff'

import { DecodedData } from '../../types/index.js'

/**
 * Encode data as a bech32 string.
 */
function bech32_encode (
  prefix  : string,
  data    : Bytes,
  version : number = 0
) : string {
  const { encode, to_words } = B32
  const bytes = Buff.bytes(data)
  const words = [ version, ...to_words(bytes) ]
  return encode(prefix, words)
}

/**
 * Decode data as a bech32 string.
 */
function bech32_decode (
  str : string
) : DecodedData {
  const { decode, to_bytes } = B32
  const { prefix, words } = decode(str)
  const [ version, ...rest ] = words
  const data = Buff.raw(to_bytes(rest))
  return { prefix, version, data }
}

/**
 * Encode data as a bech32m string.
 */
function bech32m_encode (
  prefix  : string,
  data    : Bytes,
  version : number = 1
) : string {
  const { encode, to_words } = B32m
  const bytes = Buff.bytes(data)
  const words = [ version, ...to_words(bytes) ]
  return encode(prefix, words)
}

/**
 * Decode data as a bech32m string.
 */
function bech32m_decode (
  str : string
) : DecodedData {
  const { decode, to_bytes } = B32m
  const { prefix, words } = decode(str)
  const [ version, ...rest ] = words
  const data = Buff.raw(to_bytes(rest))
  return { prefix, version, data }
}

/**
 * Decode a string based on the provided type.
 */
export function decode_data (
  str  : string,
  type : string
) : Buff {
  if (type === 'base58') {
    return Buff.b58chk(str).slice(1)
  } else if (type === 'bech32') {
    const decoded = bech32_decode(str)
    return decoded.data
  } else if (type === 'bech32m') {
    const decoded = bech32m_decode(str)
    return decoded.data
  }
  throw new Error('Unrecognized format type: ' + type)
}

export const Bech32 = {
  encode : bech32_encode,
  decode : bech32_decode
}

export const Bech32m = {
  encode : bech32m_encode,
  decode : bech32m_decode
}
