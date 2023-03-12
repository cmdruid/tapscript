import { Buff, Stream } from '@cmdcode/buff-utils'
import { getOpLabel }   from './words.js'

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

export function getWordType (word : number) : string {
  switch (true) {
    case (word === 0):
      return 'opcode'
    case (word >= 1 && word <= 75):
      return 'varint'
    case (word === 76):
      return 'pushdata1'
    case (word === 77):
      return 'pushdata2'
    case (word === 78):
      return 'pushdata4'
    case (word <= 185):
      return 'opcode'
    default:
      throw new Error(`Invalid word range: ${word}`)
  }
}

export function isValidWord (word : number) : boolean {
  /** Check if the provided value
   * is a valid script opcode.
   * */
  const MIN_RANGE = 75
  const MAX_RANGE = 186

  const DISABLED_OPCODES = [
    126, 127, 128, 129, 131, 132, 133, 134,
    141, 142, 149, 150, 151, 152, 153
  ]

  switch (true) {
    case (typeof (word) !== 'number'):
      return false
    case (word === 0):
      return true
    case (DISABLED_OPCODES.includes(word)):
      return false
    case (MIN_RANGE < word && word < MAX_RANGE):
      return true
    default:
      return false
  }
}
