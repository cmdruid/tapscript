import { Buff }     from '@cmdcode/buff'
import { hash256 }  from '@cmdcode/crypto-tools/hash'
import TxInput      from './TxInput.js'
import TxOutput     from './TxOutput.js'
import TxLocktime   from './TxLocktime.js'
import { Tx }       from '../../lib/tx/index.js'
import { Schema }   from '../../schema/index.js'

import {
  TxData,
  TxTemplate
} from '../../schema/types.js'

export default class Transaction {
  readonly _data : TxData

  constructor (
    txdata : string | Uint8Array | TxTemplate
  ) {
    if (typeof txdata === 'string') {
      txdata = Buff.hex(txdata)
    }

    if (txdata instanceof Uint8Array) {
      txdata = Tx.decode(txdata)
    }

    const schema = Schema.TxData
    this._data   = schema.parse(Tx.create(txdata))
  }

  get data () : TxData {
    return this._data
  }

  get version () : number {
    return this.data.version
  }

  get vin () : TxInput[] {
    return this.data.vin.map((_e, i) => new TxInput(this.data, i))
  }

  get vout () : TxOutput[] {
    return this.data.vout.map((e) => new TxOutput(e))
  }

  get locktime () : TxLocktime {
    return new TxLocktime(this.data.locktime)
  }

  get base () : Buff {
    return Tx.encode(this.data, true)
  }

  get buff () : Buff {
    return Tx.encode(this.data)
  }

  get raw () : Uint8Array {
    return this.buff.raw
  }

  get hex () : string {
    return this.buff.hex
  }

  get size () : number {
    return this.raw.length
  }

  get bsize () : number {
    return this.base.length
  }

  get weight () : number {
    return this.bsize * 3 + this.size
  }

  get vsize () : number {
    const remainder = (this.weight % 4 > 0) ? 1 : 0
    return Math.floor(this.weight / 4) + remainder
  }

  get hash () : string {
    const hash = hash256(this.buff)
    return hash.reverse().hex
  }

  get txid () : string {
    const hash = hash256(this.base)
    return hash.reverse().hex
  }

  async export () : Promise<object> {
    const { size, weight, vsize, hex } = this
    const txid = this.txid
    const hash = this.hash
    return { txid, hash, ...this.data, size, weight, vsize, hex }
  }
}
