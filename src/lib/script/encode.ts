import { Buff, Stream } from '@cmdcode/buff'
import { get_asm_code } from './words.js'
import { is_hex }       from '../util.js'

import {
  ScriptData,
  ScriptWord
} from '../../types/index.js'

const MAX_WORD_SIZE = 0x208

export function encode_script (
  script : ScriptData = [],
  varint = true
) : Buff {
  let buff = Buff.num(0)

  if (Array.isArray(script)) {
    buff = Buff.raw(encode_words(script))
  }

  if (is_hex(script)) {
    buff = Buff.hex(script)
  }

  if (script instanceof Uint8Array) {
    buff = Buff.raw(script)
  }

  if (varint) {
    buff = buff.add_varint('le')
  }

  return buff
}

export function encode_words (
  words : ScriptWord[]
) : Uint8Array {
  const bytes = []
  for (const word of words) {
    bytes.push(format_word(word))
  }
  return (bytes.length > 0)
    ? Buff.join(bytes)
    : new Uint8Array()
}

export function format_word (
  word : ScriptWord
) : Uint8Array {
  /** Check if the word is a valid opcode,
   *  and return its integer value.
   */
  // Initialize buff variable.
  let buff = new Uint8Array()

  if (typeof (word) === 'string') {
    if (word.startsWith('OP_')) {
      // If word is an opcode, return a
      // number value without size prefix.
      return Buff.num(get_asm_code(word), 1)
    } else if (is_hex(word)) {
      // If word is valid hex, encode as hex.
      buff = Buff.hex(word)
    } else {
      // Else, encode word as UTF8 string.
      buff = Buff.str(word)
    }
  } else {
    // If not a string, encode as bytes.
    buff = Buff.bytes(word)

    if (buff.length === 1 && buff[0] <= 16) {
    // Number values 0-16 must be treated as opcodes.
      if (buff[0] !== 0) buff[0] += 0x50
      return buff
    }
  }

  if (buff.length > MAX_WORD_SIZE) {
    const words = split_word(buff)
    return encode_words(words)
  }
  return Buff.join([ encode_size(buff.length), buff ])
}

export function encode_size (size : number) : Uint8Array {
  const OP_DATAPUSH1 = Buff.num(0x4c, 1)
  const OP_DATAPUSH2 = Buff.num(0x4d, 1)

  switch (true) {
    case (size <= 0x4b):
      return Buff.num(size)
    case (size > 0x4b && size < 0x100):
      return Buff.join([ OP_DATAPUSH1, Buff.num(size, 1) ])
    case (size >= 0x100 && size <= MAX_WORD_SIZE):
      return Buff.join([ OP_DATAPUSH2, Buff.num(size, 2) ])
    default:
      throw new Error('Invalid word size:' + size.toString())
  }
}

export function split_word (word : Uint8Array) : ScriptWord[] {
  const words = []
  const buff  = new Stream(word)
  while (buff.size > MAX_WORD_SIZE) {
    // Push a word chunk to the array.
    words.push(buff.read(MAX_WORD_SIZE))
  }
  // Push the remainder to the array.
  words.push(buff.read(buff.size))
  return words
}
