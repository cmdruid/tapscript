import { Buff } from '@cmdcode/buff-utils'

import { LockData } from '../schema/index.js'

const LOCKTIME_THRESHOLD = 500000000

export class Locktime {
  _data : number

  constructor (value : LockData = 0) {
    this._data = Buff.bytes(value).num
  }

  get data () : number {
    return this._data
  }

  get is_timelock () : boolean {
    return this.data > LOCKTIME_THRESHOLD
  }

  get timestamp () : number {
    return this.is_timelock
      ? this.data
      : this.data * 600
  }

  set timestamp (value : number) {
    this._data = value
  }

  get block_height () : number {
    return !this.is_timelock
      ? this.data
      : Math.floor(this.data / 600)
  }

  set block_height (value : number) {
    this._data = value
  }

  get est_date () : Date {
    return this.is_timelock
      ? new Date(Date.now() + (this.data * 1000))
      : new Date(Date.now() + (this.data * 600 * 1000))
  }

  set est_date (date : Date) {
    this._data = Math.floor((date.getTime() - Date.now()) / 1000)
  }

  toJSON () : number {
    return this.data
  }
}
