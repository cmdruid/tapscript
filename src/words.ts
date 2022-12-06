import { Buff, Stream } from "@cmdcode/bytes-utils"
import * as Type from './types.js'

export const SIGHASH_MAP = {
  0x01: 'ALL',
  0x02: 'NONE',
  0x03: 'SINGLE',
  0x80: 'ANYPAY'
}

export const OPCODE_MAP = {
  0: 'OP_0',
  76: 'OP_PUSHDATA1',
  77: 'OP_PUSHDATA2',
  78: 'OP_PUSHDATA4',
  79: 'OP_1NEGATE',
  81: 'OP_1',
  82: 'OP_2',
  83: 'OP_3',
  84: 'OP_4',
  85: 'OP_5',
  86: 'OP_6',
  87: 'OP_7',
  88: 'OP_8',
  89: 'OP_9',
  90: 'OP_10',
  91: 'OP_11',
  92: 'OP_12',
  93: 'OP_13',
  94: 'OP_14',
  95: 'OP_15',
  96: 'OP_16',
  97: 'OP_NOP',
  99: 'OP_IF',
  100: 'OP_NOTIF',
  103: 'OP_ELSE',
  104: 'OP_ENDIF',
  105: 'OP_VERIFY',
  106: 'OP_RETURN',
  107: 'OP_TOALTSTACK',
  108: 'OP_FROMALTSTACK',
  109: 'OP_2DROP',
  110: 'OP_2DUP',
  111: 'OP_3DUP',
  112: 'OP_2OVER',
  113: 'OP_2ROT',
  114: 'OP_2SWAP',
  115: 'OP_IFDUP',
  116: 'OP_DEPTH',
  117: 'OP_DROP',
  118: 'OP_DUP',
  119: 'OP_NIP',
  120: 'OP_OVER',
  121: 'OP_PICK',
  122: 'OP_ROLL',
  123: 'OP_ROT',
  124: 'OP_SWAP',
  125: 'OP_TUCK',
  130: 'OP_SIZE',
  135: 'OP_EQUAL',
  136: 'OP_EQUALVERIFY',
  139: 'OP_1ADD',
  140: 'OP_1SUB',
  143: 'OP_NEGATE',
  144: 'OP_ABS',
  145: 'OP_NOT',
  146: 'OP_0NOTEQUAL',
  147: 'OP_ADD',
  148: 'OP_SUB',
  154: 'OP_BOOLAND',
  155: 'OP_BOOLOR',
  156: 'OP_NUMEQUAL',
  157: 'OP_NUMEQUALVERIFY',
  158: 'OP_NUMNOTEQUAL',
  159: 'OP_LESSTHAN',
  160: 'OP_GREATERTHAN',
  161: 'OP_LESSTHANOREQUAL',
  162: 'OP_GREATERTHANOREQUAL',
  163: 'OP_MIN',
  164: 'OP_MAX',
  165: 'OP_WITHIN',
  166: 'OP_RIPEMD160',
  167: 'OP_SHA1',
  168: 'OP_SHA256',
  169: 'OP_HASH160',
  170: 'OP_HASH256',
  171: 'OP_CODESEPARATOR',
  172: 'OP_CHECKSIG',
  173: 'OP_CHECKSIGVERIFY',
  174: 'OP_CHECKMULTISIG',
  175: 'OP_CHECKMULTISIGVERIFY',
  176: 'OP_NOP1',
  177: 'OP_CHECKLOCKTIMEVERIFY',
  178: 'OP_CHECKSEQUENCEVERIFY',
  179: 'OP_NOP4',
  180: 'OP_NOP5',
  181: 'OP_NOP6',
  182: 'OP_NOP7',
  183: 'OP_NOP8',
  184: 'OP_NOP9',
  185: 'OP_NOP10'
}

export function getOpName(num : number) : string {
  return OPCODE_MAP[num as keyof typeof OPCODE_MAP]
}

export function getOpCode(string : string) : number {
  for (const [k, v] of Object.entries(OPCODE_MAP)) {
    if (v === string) return Number(k)
  }
  throw new Error('OPCODE not found:' + string)
}

export function getSigCode(string : string) : number {
  for (const [k, v] of Object.entries(SIGHASH_MAP)) {
    if (v === string) return Number(k)
  }
  throw new Error('SIGCODE not found:' + string)
}

export function encodeWord(
  word : string | number
) : string | number {
  /** Check if the word is a valid opcode,
   *  and return its integer value.
   */
  if (typeof (word) === 'string') {
    if (word.startsWith('OP_')) {
      return getOpCode(word)
    }
    return word
  }
  return word
}

function encodeWordSize(size : number) : Uint8Array {
  const MAX_SIZE = 0x208
  const OP_DATAPUSH1 = Buff.num(0x4c, 1)
  const OP_DATAPUSH2 = Buff.num(0x4d, 1)

  switch (true) {
    case (size <= 0x4b):
      return Buff.num(size)
    case (size > 0x4b && size < 0x100):
      return Buff.join([OP_DATAPUSH1, Buff.num(size, 1)])
    case (size >= 0x100 && size < MAX_SIZE):
      return Buff.join([OP_DATAPUSH2, Buff.num(size, 2)])
    default:
      throw new Error('Invalid word size:' + size.toString())
  }
}

export function encodeWords(
  wordArray : Type.WordArray
) : Uint8Array {
  const words = []

  for (let word of wordArray) {
    word = encodeWord(word)
    if (typeof word === 'number') {
      words.push(Buff.num(word))
    } else {
      const bytes = Buff.hex(word)
      words.push(encodeWordSize(bytes.length))
      words.push(bytes)
    }
  }
  return (words.length > 0)
    ? Buff.join(words)
    : new Uint8Array()
}

export function getWordType(word : number) : string {
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

export function isValidWord(word : number) : boolean {
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

export function decodeWords(
  words : Uint8Array,
  fmt = 'asm'
) : Type.WordArray {
  const stream = new Stream(words)

  const stack = []
  const stackSize = stream.size

  let word; let wordType; let wordSize; let count = 0

  while (count < stackSize) {
    word = stream.read(1).toNum()
    wordType = getWordType(word)
    count++
    switch (wordType) {
      case 'varint':
        stack.push(stream.read(word).toHex())
        count += word
        break
      case 'pushdata1':
        wordSize = stream.read(1).toNum()
        stack.push(stream.read(wordSize).toHex())
        count += wordSize + 1
        break
      case 'pushdata2':
        wordSize = stream.read(2).toNum()
        stack.push(stream.read(wordSize).toHex())
        count += wordSize + 2
        break
      case 'pushdata4':
        wordSize = stream.read(4).toNum()
        stack.push(stream.read(wordSize).toHex())
        count += wordSize + 4
        break
      case 'opcode':
        if (!isValidWord(word)) {
          throw new Error(`Invalid OPCODE: ${word}`)
        }
        word = (fmt === 'asm')
          ? getOpName(word)
          : word
        stack.push(word)
        break
      default:
        throw new Error(`Word type undefined: ${word}`)
    }
  }

  return stack
}