import { Buff }     from '@cmdcode/buff-utils'
import TxInput      from './TxInput.js'
import TxOutput     from './TxOutput.js'
import TxLocktime   from './TxLocktime.js'
import { encodeTx } from '../../lib/tx/encode.js'
import { decodeTx } from '../../lib/tx/decode.js'
import { TxData }   from '../../schema/types.js'
// import { Schema }   from '../../schema/check.js'

export default class Transaction {
  public version  : number
  public vin      : TxInput[]
  public vout     : TxOutput[]
  public locktime : TxLocktime

  constructor (
    txdata : string | Uint8Array | TxData
  ) {
    if (typeof txdata === 'string') {
      txdata = Buff.hex(txdata).raw
    }

    if (txdata instanceof Uint8Array) {
      txdata = decodeTx(txdata)
    }

    // const schema = Schema.TxData
    const data   = txdata // schema.parse(txdata)

    this.version  = data.version
    this.vin      = data.vin?.map(e => new TxInput(e))   ?? []
    this.vout     = data.vout?.map(e => new TxOutput(e)) ?? []
    this.locktime = new TxLocktime(data.locktime)
  }

  get data () : TxData {
    return JSON.parse(JSON.stringify(this))
  }

  get base () : Buff {
    return encodeTx(this.data, true)
  }

  get buff () : Buff {
    return encodeTx(this.data)
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
    return this.buff.toHash('hash160').reverse().hex
  }

  get txid () : string {
    return this.base.toHash('hash256').reverse().hex
  }

  // async sighash (
  //   idx      : number,
  //   value    : number,
  //   script   : ScriptData,
  //   sigflag ?: number = 0x00,
  // ) : Promise<Uint8Array> {
  //   return encodeSighash(this.data, idx, value, script, sigflag, anypay)
  // }

  async export () : Promise<object> {
    const { size, weight, vsize, hex } = this
    const txid = this.txid
    const hash = this.hash
    return { txid, hash, ...this.data, size, weight, vsize, hex }
  }
}
