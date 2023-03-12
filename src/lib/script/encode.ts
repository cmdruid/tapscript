import { Buff, Stream } from '@cmdcode/buff-utils'
import { getOpCode }    from './words.js'

import {
  ScriptData,
  WordArray,
  Word
} from '../../schema/types.js'

const MAX_WORD_SIZE = 0x208

export function encodeScript (
  script : ScriptData = [],
  varint = true
) : Uint8Array {
  let buff = Buff.num(0)

  if (Array.isArray(script)) {
    buff = Buff.raw(encodeWords(script))
  }

  if (typeof script === 'string') {
    buff = Buff.hex(script)
  }

  if (script instanceof Uint8Array) {
    buff = Buff.raw(script)
  }

  if (varint) {
    buff = buff.prefixSize()
  }

  return buff.raw
}

export function encodeWords (
  wordArray : WordArray
) : Uint8Array {
  const words = []
  for (const word of wordArray) {
    words.push(encodeWord(word))
  }
  return (words.length > 0)
    ? Buff.join(words)
    : new Uint8Array()
}

export function encodeWord (
  word : Word
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
      return Buff.num(getOpCode(word), 1)
    }
    if (word.startsWith('STR_')) {
      // If word is marked as a string,
      // encode to uint8 array.
      buff = Buff.str(word.slice(3))
    }
    // Else, encode word as hex string.
    buff = Buff.hex(word)
  }
  if (typeof (word) === 'number') {
    // If word is a number value,
    // encode to uint8 array.
    buff = Buff.num(word)
  }
  if (word instanceof Uint8Array) {
    buff = word
  }
  if (buff.length > MAX_WORD_SIZE) {
    const words = splitWord(buff)
    return encodeWords(words)
  }
  return Buff.of(
    ...encodeSize(buff.length),
    ...buff
  )
}

function encodeSize (size : number) : Uint8Array {
  const OP_DATAPUSH1 = Buff.num(0x4c, 1)
  const OP_DATAPUSH2 = Buff.num(0x4d, 1)

  switch (true) {
    case (size <= 0x4b):
      return Buff.num(size)
    case (size > 0x4b && size < 0x100):
      return Buff.join([ OP_DATAPUSH1, Buff.num(size, 1) ])
    case (size >= 0x100 && size <= MAX_WORD_SIZE):
      return Buff.join([ OP_DATAPUSH2, Buff.num(size, 2, 'be') ])
    default:
      throw new Error('Invalid word size:' + size.toString())
  }
}

function splitWord (word : Uint8Array) : WordArray {
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
