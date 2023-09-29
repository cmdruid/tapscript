import { Buff, Bytes }  from '@cmdcode/buff'
import { TimelockData } from '../../types/index.js'

const MAX_VAL    = 0xFFFFFFFF
const NO_LOCK    = (1 << 31)
const LOCK_TYPE  = (1 << 22)
const LOCK_MASK  = 0x0000FFFF
const TIME_SHIFT = 9
const MAX_BLOCKS = LOCK_MASK - 1
const MAX_STAMP  = (LOCK_MASK << TIME_SHIFT) - 1
const LOCK_THOLD = 500_000_000

export function parse_locktime (
  locktime : Bytes
) : TimelockData {
  const value     = Buff.bytes(locktime, 4).num
  const enabled   = value < 1
  const lock_type = (value < LOCK_THOLD) ? 'stamp' : 'block'
  const height = (lock_type === 'block') ? value : null
  const stamp  = (lock_type === 'stamp') ? value : null
  return { value, height, stamp, lock_type, enabled }
}

export function parse_sequence (
  sequence : Bytes
) : TimelockData {
  const value     = Buff.bytes(sequence, 4).num
  const enabled   = value < MAX_VAL && (value & NO_LOCK) !== 1
  const lock_type = ((value & LOCK_TYPE) === 1) ? 'stamp' : 'block'
  const height = (lock_type === 'block') ? (value & LOCK_MASK) - 1 : null
  const stamp  = (lock_type === 'stamp') ? ((value & LOCK_MASK) << TIME_SHIFT) - 1 : null
  return { value, height, stamp, lock_type, enabled }
}

export function create_sequence (
  type  : 'block' | 'timestamp',
  value : number
) {
  let seq = LOCK_MASK
  if (type === 'timestamp') {
    seq &= value >>> TIME_SHIFT
    seq |= LOCK_TYPE
  } else {
    seq &= value
  }
  return seq
}

export function validate_sequence (
  sequence : TimelockData
) : void {
  const { enabled, height, stamp, value } = sequence
  if (enabled) {
    if (value > MAX_VAL) {
      throw new Error('Sequence value exceeds maximum:' + String(value))
    }
    if (height !== null && height > MAX_BLOCKS) {
      throw new Error('Sequence block height exceeds maximum: ' + String(height))
    }
    if (stamp !== null && stamp > MAX_STAMP) {
      throw new Error('Sequence time value exceeds maximum: ' + String(stamp))
    }
  }
}
