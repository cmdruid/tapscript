import { Buff, Stream } from '@cmdcode/buff-utils'

import {
  getOpLabel,
  getWordType,
  isValidWord
} from './words.js'

import { ScriptData, WordArray } from '../../schema/types.js'

export function decodeScript (
  script : string | Uint8Array
) : WordArray {
  return decodeWords(Buff.normalize(script))
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

export function decodeAddress (address : string) : string {
  // if (address.length === 20)
  return address
}

export function decodeWords (
  words : Uint8Array,
  fmt = 'asm'
) : WordArray {
  const stream = new Stream(words)

  const stack : WordArray = []
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
        stack.push(stream.read(word).toHex())
        count += word
        break
      case 'pushdata1':
        wordSize = stream.read(1).reverse().num
        stack.push(stream.read(wordSize).toHex())
        count += wordSize + 1
        break
      case 'pushdata2':
        wordSize = stream.read(2).reverse().num
        stack.push(stream.read(wordSize).toHex())
        count += wordSize + 2
        break
      case 'pushdata4':
        wordSize = stream.read(4).reverse().num
        stack.push(stream.read(wordSize).toHex())
        count += wordSize + 4
        break
      case 'opcode':
        if (!isValidWord(word)) {
          throw new Error(`Invalid OPCODE: ${word}`)
        }
        if (fmt === 'asm') {
          stack.push(getOpLabel(word))
        } else { stack.push(word) }
        break
      default:
        throw new Error(`Word type undefined: ${word}`)
    }
  }
  return stack
}
