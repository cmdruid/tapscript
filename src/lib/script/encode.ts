import { Buff, Stream } from '@cmdcode/buff-utils'
import { getOpCode }    from './words.js'
import { isHex }        from '../check.js'
import { ScriptData, Word } from '../../schema/types.js'

const MAX_WORD_SIZE = 0x208

export function encodeScript (
  script : ScriptData = [],
  varint = true
) : Buff {
  let buff = Buff.num(0)

  if (Array.isArray(script)) {
    buff = Buff.raw(encodeWords(script))
  }

  if (isHex(script)) {
    buff = Buff.hex(script)
  }

  if (script instanceof Uint8Array) {
    buff = Buff.raw(script)
  }

  if (varint) {
    buff = buff.prefixSize('le')
  }

  return buff
}

export function encodeWords (
  wordArray : Word[]
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
    } else if (isHex(word)) {
      // If word is valid hex, encode as hex.
      buff = Buff.hex(word)
    } else {
      // Else, encode word as UTF8 string.
      buff = Buff.str(word)
    }
  } else {
    // If not a string, encode as bytes.
    buff = Buff.bytes(word)
  }

  // If the buffer contains a single value:
  if (buff.length === 1) {
    // If value is between 1-16:
    if (buff[0] !== 0 && buff[0] <= 16) {
      // Number values 1-16 must be treated as opcodes.
      buff[0] += 0x50
    // If the value is between 129-255:
    } else if (buff[0] > 128 && buff[0] <= 255) {
      // Value must be padded with a zero byte.
      buff = new Uint8Array([ buff[0], 0 ])
    }
    return buff
  // If the buffer is greater than the max size:
  } else if (buff.length > MAX_WORD_SIZE) {
    // Split the buffer into chunks.
    const words = splitWord(buff)
    // Run data chunks through the encoder.
    return encodeWords(words)
  // Else:
  } else {
    // Return the current buffer with a prefixed varint.
    return Buff.join([ encodeSize(buff.length), buff ])
  }
}

function encodeSize (size : number) : Uint8Array {
  const OP_DATAPUSH1 = Buff.num(0x4c, 1)
  const OP_DATAPUSH2 = Buff.num(0x4d, 1)

  switch (true) {
    case (size <= 0x4b):
      return Buff.num(size)
    case (size > 0x4b && size < 0x100):
      return Buff.join([ OP_DATAPUSH1, Buff.num(size, 1, 'le') ])
    case (size >= 0x100 && size <= MAX_WORD_SIZE):
      return Buff.join([ OP_DATAPUSH2, Buff.num(size, 2, 'le') ])
    default:
      throw new Error('Invalid word size:' + size.toString())
  }
}

function splitWord (word : Uint8Array) : Word[] {
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
