
import { Bytes }    from '@cmdcode/buff-utils'
import { Sequence } from './Sequence.js'
import { TxOut }    from './TxOut.js'
import { Witness }  from './Witness.js'

import { segwit, taproot }     from '../lib/sig/index.js'
import { parse_vin, parse_tx } from '../lib/tx/index.js'

import * as assert from '../lib/assert.js'

import {
  SigHashOptions,
  TxInput,
  VinTemplate,
  ScriptData,
  ScriptEnum,
  TxBytes,
  TxData
} from '../types/index.js'

export class TxIn {
  readonly _data : TxInput
  readonly _idx ?: number

  constructor (
    txinput : VinTemplate | TxInput,
    idx    ?: number
  ) {
    this._data = parse_vin(txinput)
    this._idx  = idx
  }

  get data () : TxInput {
    return this._data
  }

  get idx () : number | undefined {
    return this._idx
  }

  get txid () : string {
    return this.data.txid
  }

  get vout () : number {
    return this.data.vout
  }

  get prevout () : TxOut | undefined {
    return (this.data.prevout !== undefined)
      ? new TxOut(this.data.prevout)
      : undefined
  }

  get scriptSig () : ScriptData {
    return this.data.scriptSig
  }

  get sequence () : Sequence {
    return new Sequence(this.data.sequence)
  }

  get witness () : Witness {
    return new Witness(this.data.witness)
  }

  get type () : ScriptEnum | 'raw' | 'unknown' {
    if (this.prevout !== undefined) {
      return this.prevout.script.type
    }
    return 'unknown'
  }

  sign (
    seckey  : Bytes,
    txdata  : TxBytes | TxData, 
    config ?: SigHashOptions
  ) {
    const { txindex = this.idx } = config ?? {}
    const tx = parse_tx(txdata)

    assert.ok(typeof txindex === 'number')
    assert.ok(txindex < tx.vin.length)

    tx.vin[txindex] = this.data

    if (this.type.startsWith('p2w')) {
      return segwit.sign_tx(seckey, tx, config)
    }
    if (this.type.startsWith('p2tr')) {
      return taproot.sign_tx(seckey, tx, config)
    }
    if (this.type.startsWith('p2pkh') || this.type.startsWith('p2sh')) {
      throw new Error('This library currently does not support signing legacy transactions.')
    }
    throw new Error('Unable to sign for input type:' + String(this.type))
  }
}
