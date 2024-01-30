import { Buff, Bytes, Stream } from '@cmdcode/buff'

import {
  get_op_code,
  get_op_type,
  is_valid_op
} from './words.js'

/**
 * Decode a bitcoin script into asm instructions.
 */
export function decode_script (
  script : Bytes,
  varint = false
) : string[] {

  let bytes = Buff.bytes(script)

  if (varint) {
    const stream = bytes.stream
    const len = stream.read_varint('le')
    if (stream.size !== len) {
      throw new Error(`Varint does not match stream size: ${String(len)} !== ${bytes.length}`)
    }
    bytes = bytes.slice(1)
  }
  return decode_word_bytes(bytes)
}

/*
 * Decode word-bytes into asm strings.
 */
export function decode_word_bytes (
  words : Uint8Array
) : string[] {

  const stream = new Stream(words)

  const stack : string[] = []
  const stack_size = stream.size

  let word      : number
  let word_type : string
  let word_size : number

  let count = 0

  while (count < stack_size) {
    word = stream.read(1).num
    word_type = get_op_type(word)
    count++
    switch (word_type) {
      case 'varint':
        stack.push(stream.read(word).hex)
        count += word
        break
      case 'pushdata1':
        word_size = stream.read(1).reverse().num
        stack.push(stream.read(word_size).hex)
        count += word_size + 1
        break
      case 'pushdata2':
        word_size = stream.read(2).reverse().num
        stack.push(stream.read(word_size).hex)
        count += word_size + 2
        break
      case 'pushdata4':
        word_size = stream.read(4).reverse().num
        stack.push(stream.read(word_size).hex)
        count += word_size + 4
        break
      case 'opcode':
        if (!is_valid_op(word)) {
          throw new Error(`Invalid OPCODE: ${word}`)
        }
        stack.push(get_op_code(word))
        break
      default:
        throw new Error(`Word type undefined: ${word}`)
    }
  }
  return stack
}
