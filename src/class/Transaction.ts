import { Buff } from '@cmdcode/buff-utils'
import { hash } from '@cmdcode/crypto-utils'

import { TxInput }  from './TxInput.js'
import { TxOutput } from './TxOutput.js'
import { Locktime } from './Locktime.js'

import * as Tx from '../lib/tx/index.js'

import {
  TransactionData,
  TxBytes,
  TxData,
  TxTemplate,
  validate
} from '../schema/index.js'

const { hash256 } = hash

export class Transaction {
  readonly _data : TxData

  static create (template : TxTemplate) {
    const txdata = Tx.create_tx(template)
    return new Transaction(txdata)
  }

  constructor (
    txdata : TxBytes | TxData
  ) {
    txdata     = Tx.to_json(txdata)
    this._data = validate.tx.data.parse(txdata)
  }

  get data () : TxData {
    return this._data
  }

  get version () : number {
    return this.data.version
  }

  get vin () : TxInput[] {
    return this.data.vin.map((e, i) => new TxInput(e, i))
  }

  get vout () : TxOutput[] {
    return this.data.vout.map((e, i) => new TxOutput(e, i))
  }

  get locktime () : Locktime {
    return new Locktime(this.data.locktime)
  }

  get base () : Buff {
    return Tx.encode_tx(this.data, true)
  }

  get buff () : Buff {
    return Tx.encode_tx(this.data)
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

  async export () : Promise<TransactionData> {
    const { size, weight, bsize, vsize, hex } = this
    const txid = this.txid
    const hash = this.hash
    return { txid, hash, ...this.data, size, weight, bsize, vsize, hex }
  }
}
