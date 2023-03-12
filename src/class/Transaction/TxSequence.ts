import { SequenceData } from '../../schema/types.js'

const MAX_VAL     = 0xFFFFFFFF
const NO_LOCK     = (1 << 31)
const TIME_MOD    = 512
const LOCK_TYPE   = (1 << 22)
// const LOCK_MASK   = 0x0000FFFF
// const BIT_SHIFT   = 9
// const MAX_BLOCKS  = LOCK_MASK
// const MAX_SECONDS = LOCK_MASK << BIT_SHIFT

export default class TxSequence {
  public value : number

  constructor (value : SequenceData) {
    if (typeof value === 'string') {
      this.value = parseInt(value, 16)
    } else {
      this.value = value
    }
  }

  get isReplaceable () : boolean {
    return this.value < MAX_VAL
  }

  get isLocked () : boolean {
    return !(this.value !== MAX_VAL || (this.value & NO_LOCK) !== 0)
  }

  get isTimelock () : boolean {
    return (this.value & LOCK_TYPE) !== 0
  }

  get timestamp () : number {
    return this.isLocked
      ? this.isTimelock
        ? this.value * TIME_MOD
        : this.value * TIME_MOD * 600
      : 0
  }

  set timestamp (value : number) {
    // Check if valid timestamp range.
    // Check if within modulo 512.
    this.value = Math.ceil(value / TIME_MOD)
  }

  get blockheight () : number {
    return this.isLocked
      ? !this.isTimelock
        ? this.value
        : Math.ceil((this.value * TIME_MOD) / 600)
      : 0
  }

  set blockheight (value : number) {
    // Check if valid blockheight range.
    this.value = value
  }

  get estDate () : Date {
    return this.isTimelock
      ? new Date(Date.now() + (this.value * TIME_MOD * 1000))
      : new Date(Date.now() + (this.value * 600 * 1000))
  }

  set estDate (date : Date) {
    const delta = date.getTime() - Date.now()
    // Validate delta is above 512,000ms
    this.value = (delta > (TIME_MOD * 1000))
      ? Math.ceil(delta / 1000 / TIME_MOD)
      : 1
  }

  toJSON () : number {
    return this.value
  }
}

// function validateSequence(seq : TxSequence) {
//   const { hex, inSeconds, inBlocks, replaceByFee } = seq

//   switch (true) {
//     case (inSeconds && inBlocks):
//       throw new TypeError('Both timelock and blocklock are specified!')
//     case (inSeconds && typeof inSeconds !== 'number'):
//       throw new TypeError('Invalid timelock value: ' + inSeconds)
//     case (inSeconds && (inSeconds < 0 || inSeconds > MAX_SECONDS)):
//       throw new TypeError('Timelock out of range: ' + inSeconds)
//     case (inSeconds && inSeconds % TIME_MOD !== 0):
//       throw new TypeError('Timelock value must be multiple of 512')
//     case (inSeconds && inSeconds > 0):
//       return LOCK_TYPE | (inSeconds >> BIT_SHIFT) // plus bitfield
//     case (inBlocks && typeof inBlocks !== 'number'):
//       throw new TypeError('Invalid blocklock value: ' + inBlocks)
//     case (inBlocks && (inBlocks < 0 || inBlocks > MAX_BLOCKS)):
//       throw new TypeError('Blocklock out of range: ' + inBlocks)
//     case (inBlocks && inBlocks > 0):
//       return inBlocks // plus bitfield
//     case (replaceByFee === true):
//       return MAX_VAL - 1 // or use bitfield
//     default:
//       return MAX_VAL // ignore bitfield
//   }
// }
