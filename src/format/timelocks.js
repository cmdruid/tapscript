const MAX_VAL = 0xFFFFFFFF
const NO_LOCK = (1 << 31)
const TIME_MOD = 512
const LOCK_TYPE = (1 << 22)
const LOCK_MASK = 0x0000FFFF
const BIT_SHIFT = 9
const MAX_BLOCKS = LOCK_MASK
const MAX_SECONDS = LOCK_MASK << BIT_SHIFT

export function addSequenceMeta(seq) {
  const value = parseInt('0x' + seq.hex, 16)
  const isMax = (value === MAX_VAL)
  const isLocked = !(isMax || value & NO_LOCK)
  // const bitfield = (some logic to test bitfield usage)

  seq.replaceByFee = !isMax
  seq.isTimeLocked = isLocked
  seq.inBlocks = null
  seq.inSeconds = null
  seq.estimatedDate = null
  seq.bitfield = null

  if (isLocked) {
    if (value & LOCK_TYPE) {
      seq.inSeconds = (value & LOCK_MASK) << BIT_SHIFT
      seq.estimatedDate = new Date(Date.now() + (seq.inSeconds * 1000))
    } else {
      seq.inBlocks = value & LOCK_MASK
      seq.estimatedDate = new Date(Date.now() + (seq.inBlocks * 600 * 1000))
    }
  }
}

export function encodeSequenceMeta(seq) {
  const { hex, inSeconds, inBlocks, replaceByFee } = seq

  switch (true) {
    case (typeof hex === 'string'):
      return hex
    case (inSeconds && inBlocks):
      throw new TypeError('Both timelock and blocklock are specified!')
    case (inSeconds && typeof inSeconds !== 'number'):
      throw new TypeError('Invalid timelock value: ' + inSeconds)
    case (inSeconds && (inSeconds < 0 || inSeconds > MAX_SECONDS)):
      throw new TypeError('Timelock out of range: ' + inSeconds)
    case (inSeconds && inSeconds % TIME_MOD !== 0):
      throw new TypeError('Timelock value must be multiple of 512')
    case (inSeconds && inSeconds > 0):
      return LOCK_TYPE | (inSeconds >> BIT_SHIFT) // plus bitfield
    case (inBlocks && typeof inBlocks !== 'number'):
      throw new TypeError('Invalid blocklock value: ' + inBlocks)
    case (inBlocks && (inBlocks < 0 || inBlocks > MAX_BLOCKS)):
      throw new TypeError('Blocklock out of range: ' + inBlocks)
    case (inBlocks && inBlocks > 0):
      return inBlocks // plus bitfield
    case (replaceByFee === true):
      return MAX_VAL - 1 // or use bitfield
    default:
      return MAX_VAL // ignore bitfield
  }
}
