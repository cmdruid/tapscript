import { Buff }       from '@cmdcode/buff-utils'
import * as ENC       from '../../tx/encode.js'
import { Script }     from '../../script/index.js'
import { HashConfig } from '../types.js'
import { Tx }         from '../../tx/index.js'

import {
  InputData,
  OutputData,
  TxData,
  Bytes
} from '../../../schema/types.js'

const VALID_HASH_TYPES = [ 0x01, 0x02, 0x03, 0x81, 0x82, 0x83 ]
const DEFAULT_SCRIPT   = ''

export function hashTx (
  txdata : TxData | Bytes,
  idx    : number,
  config : HashConfig = {}
) : Buff {
  const { sigflag = 0x01, script = DEFAULT_SCRIPT } = config
  if (!VALID_HASH_TYPES.includes(sigflag)) {
    // Check if the sigflag type is valid.
    throw new Error('Invalid hash type: ' + String(sigflag))
  }
  const tx = Tx.fmt.toJson(txdata)
  const { version, vin: input, vout: output, locktime } = tx
  const { txid, vout, prevout, sequence } = input[idx]
  const isAnypay = sigflag > 0x80
  const stack    = [ ENC.encodeVersion(version) ]

  if (prevout?.value === undefined) {
    throw new Error('Prevout value is empty!')
  }

  stack.push(
    hashPrevouts(input, isAnypay),
    hashSequence(input, sigflag),
    ENC.encodeTxid(txid),
    ENC.encodePrevOut(vout),
    Script.encode(script, true),
    ENC.encodeValue(prevout.value),
    ENC.encodeSequence(sequence),
    hashOutputs(output, idx, sigflag),
    ENC.encodeLocktime(locktime),
    Buff.num(sigflag, 4).reverse()
  )

  return Buff.join(stack).toHash('hash256')
}

function hashPrevouts (
  vin : InputData[],
  isAnypay ?: boolean
) : Uint8Array {
  if (isAnypay === true) {
    return Buff.num(0, 32)
  }

  const stack = []

  for (const { txid, vout } of vin) {
    stack.push(ENC.encodeTxid(txid))
    stack.push(ENC.encodePrevOut(vout))
  }

  return Buff.join(stack).toHash('hash256')
}

function hashSequence (
  vin     : InputData[],
  sigflag : number
) : Uint8Array {
  if (sigflag !== 0x01) {
    return Buff.num(0, 32)
  }

  const stack = []

  for (const { sequence } of vin) {
    stack.push(ENC.encodeSequence(sequence))
  }
  return Buff.join(stack).toHash('hash256')
}

function hashOutputs (
  vout    : OutputData[],
  idx     : number,
  sigflag : number
) : Uint8Array {
  const stack = []

  if (sigflag === 0x01) {
    for (const { value, scriptPubKey } of vout) {
      stack.push(ENC.encodeValue(value))
      stack.push(Script.encode(scriptPubKey))
    }
    return Buff.join(stack).toHash('hash256')
  }

  if (sigflag === 0x03 && idx < vout.length) {
    const { value, scriptPubKey } = vout[idx]
    stack.push(ENC.encodeValue(value))
    stack.push(Script.encode(scriptPubKey))
    return Buff.join(stack).toHash('hash256')
  }

  return Buff.num(0, 32)
}
