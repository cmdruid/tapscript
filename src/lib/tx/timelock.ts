import { Buff } from '@cmdcode/buff'

import {
  LockType,
  TimelockData
} from '../../types/index.js'

const MAX_VAL    = 0xFFFFFFFF
const NO_LOCK    = (1 << 31)
const TIME_LOCK  = (1 << 22)
const LOCK_MASK  = 0x0000FFFF
const TIME_SHIFT = 9
const MAX_BLOCKS = LOCK_MASK - 1
const MAX_STAMP  = (LOCK_MASK << TIME_SHIFT) - 1
const LOCK_THOLD = 500_000_000

export function parse_locktime (
  locktime : string | number
) : TimelockData {
  const value   = parse_value(locktime)
  const enabled = (value > 0)
    let type : LockType = null
  if (enabled) {
    type = (value > LOCK_THOLD) ? 'stamp' : 'block'
  }
  const blocks = (type === 'block') ? value : null
  const stamp  = (type === 'stamp') ? value : null
  return { value, blocks, stamp, type, enabled }
}

export function parse_sequence (
  sequence : string | number
) : TimelockData {
  const value   = parse_value(sequence)
  const enabled = value !== MAX_VAL && (value & NO_LOCK) !== NO_LOCK
    let type : LockType = null
  if (enabled) {
    type = ((value & TIME_LOCK) === TIME_LOCK) ? 'stamp' : 'block'
  }
  const masked = (value & LOCK_MASK)
  const blocks = (type === 'block') ? masked : null
  const stamp  = (type === 'stamp') ? masked << TIME_SHIFT : null
  return { value, blocks, stamp, type, enabled }
}

export function create_sequence (
  type  : 'block' | 'stamp',
  value : number
) {
  let seq = LOCK_MASK
  if (type === 'stamp') {
    seq &= value >>> TIME_SHIFT
    seq |= TIME_LOCK
  } else {
    seq &= value
  }
  return seq
}

export function validate_sequence (
  sequence : TimelockData
) : void {
  const { enabled, blocks, stamp, value } = sequence
  if (enabled) {
    if (value > MAX_VAL) {
      throw new Error('Sequence value exceeds maximum:' + String(value))
    }
    if (blocks !== null && blocks > MAX_BLOCKS) {
      throw new Error('Sequence block height exceeds maximum: ' + String(blocks))
    }
    if (stamp !== null && stamp > MAX_STAMP) {
      throw new Error('Sequence time value exceeds maximum: ' + String(stamp))
    }
  }
}

function parse_value (input : string | number) {
  return (typeof input === 'string')
  ? Buff.hex(input).reverse().num
  : input
}
