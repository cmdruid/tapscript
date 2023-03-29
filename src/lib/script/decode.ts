import { Buff, Stream } from '@cmdcode/buff-utils'

import {
  getOpLabel,
  getWordType,
  isValidWord
} from './words.js'

import { ScriptData } from '../../schema/types.js'

export function decodeScript (
  script  : string | Uint8Array,
  format ?: 'asm' | 'hex'
) : string[] {
  return decodeWords(Buff.normalize(script), format)
}

export function normalizeData (
  script ?: ScriptData
) : Uint8Array {
  if (script === undefined) {
    throw new Error('Script data is undefined!')
  }
  if (Array.isArray(script)) {
    throw new Error('Script data is an array!')
  }
  return Buff.normalize(script)
}

export function decodeWords (
  words : Uint8Array,
  fmt = 'asm'
) : string[] {
  const stream = new Stream(words)

  const stack : string[] = []
  const stackSize = stream.size

  let word     : number
  let wordType : string
  let wordSize : number

  let count = 0

  while (count < stackSize) {
    word = stream.read(1).num
    wordType = getWordType(word)
    count++
    switch (wordType) {
      case 'varint':
        stack.push(stream.read(word).hex)
        count += word
        break
      case 'pushdata1':
        wordSize = stream.read(1).reverse().num
        stack.push(stream.read(wordSize).hex)
        count += wordSize + 1
        break
      case 'pushdata2':
        wordSize = stream.read(2).reverse().num
        stack.push(stream.read(wordSize).hex)
        count += wordSize + 2
        break
      case 'pushdata4':
        wordSize = stream.read(4).reverse().num
        stack.push(stream.read(wordSize).hex)
        count += wordSize + 4
        break
      case 'opcode':
        if (!isValidWord(word)) {
          throw new Error(`Invalid OPCODE: ${word}`)
        }
        stack.push((fmt === 'asm')
          ? getOpLabel(word)
          : Buff.num(word).hex
        )
        break
      default:
        throw new Error(`Word type undefined: ${word}`)
    }
  }
  return stack
}
