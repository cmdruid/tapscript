import * as Type  from '../../schema/types.js'

const LOCKTIME_THRESHOLD = 500000000

export default class TxLocktime {
  public value : number

  constructor (value ?: Type.LockData) {
    this.value = value ?? 0
  }

  get isTimelock () : boolean {
    return this.value > LOCKTIME_THRESHOLD
  }

  get timestamp () : number {
    return this.isTimelock
      ? this.value
      : this.value * 600
  }

  set timestamp (value : number) {
    this.value = value
  }

  get blockheight () : number {
    return !this.isTimelock
      ? this.value
      : Math.floor(this.value / 600)
  }

  set blockheight (value : number) {
    this.value = value
  }

  get estDate () : Date {
    return this.isTimelock
      ? new Date(Date.now() + (this.value * 1000))
      : new Date(Date.now() + (this.value * 600 * 1000))
  }

  set estDate (date : Date) {
    this.value = Math.floor((date.getTime() - Date.now()) / 1000)
  }

  toJSON () : number {
    return this.value
  }
}
