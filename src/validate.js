export const isNumber = x => typeof (x) === 'number'

export const isString = x => typeof (x) === 'string'

export function isValidCode(num) {
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
    case (typeof (num) !== 'number'):
      return false
    case (num === 0):
      return true
    case (DISABLED_OPCODES.includes(num)):
      return false
    case (MIN_RANGE < num && num < MAX_RANGE):
      return true
    default:
      return false
  }
}
