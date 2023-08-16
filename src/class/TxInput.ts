
import { Bytes }  from '@cmdcode/buff-utils'

import { Sequence }  from './Sequence.js'
import { TxOutput }  from './TxOutput.js'
import { Witness }   from './Witness.js'

import { segwit, taproot }     from '../lib/sig/index.js'
import { create_vin, to_json } from '../lib/tx/index.js'

import { SignOptions } from '@cmdcode/crypto-utils'

import assert from 'assert'

import {
  HashConfig,
  InputData,
  InputTemplate,
  ScriptData,
  ScriptEnum,
  TxBytes,
  TxData
} from '../schema/index.js'

export class TxInput {
  readonly _data : InputData
  readonly _idx ?: number

  constructor (
    txinput : InputTemplate | InputData,
    idx    ?: number
  ) {
    this._data = create_vin(txinput)
    this._idx  = idx
  }

  get data () : InputData {
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

  get prevout () : TxOutput | undefined {
    return (this.data.prevout !== undefined)
      ? new TxOutput(this.data.prevout)
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
    seckey   : Bytes,
    txdata   : TxBytes | TxData, 
    config  ?: HashConfig,
    options ?: SignOptions
  ) {
    const { txindex = this.idx } = config ?? {}
    const tx = to_json(txdata)

    assert.ok(typeof txindex === 'number')
    assert.ok(txindex < tx.vin.length)

    tx.vin[txindex] = this.data

    if (this.type.startsWith('p2w')) {
      return segwit.sign_tx(seckey, tx, config)
    }
    if (this.type.startsWith('p2tr')) {
      return taproot.sign_tx(seckey, tx, config, options)
    }
    if (this.type.startsWith('p2pkh') || this.type.startsWith('p2sh')) {
      throw new Error('This library currently does not support signing legacy transactions.')
    }
    throw new Error('Unable to sign for input type:' + String(this.type))
  }
}
