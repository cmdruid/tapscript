import CONST from '../const.js'

export function getOpLabel (num : number) : string {
  if (num > 186 && num < 255) {
    return 'OP_SUCCESS' + String(num)
  }
  for (const [ k, v ] of Object.entries(CONST.OPCODE_MAP)) {
    if (v === num) return k
  }
  throw new Error('OPCODE not found:' + String(num))
}

export function getOpCode (string : string) : number {
  for (const [ k, v ] of Object.entries(CONST.OPCODE_MAP)) {
    if (k === string) return Number(v)
  }
  throw new Error('OPCODE not found:' + string)
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
    case (word <= 254):
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
  const MAX_RANGE = 254

  const DISABLED_OPCODES : number[] = []

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
