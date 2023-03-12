import { Buff }         from '@cmdcode/buff-utils'
import { Hash }         from '@cmdcode/crypto-utils'
import { encodeScript } from '../script/encode.js'
import * as ENC         from '../tx/encode.js'

import {
  InputData,
  OutputData,
  TxData,
  ScriptData
} from '../../schema/types.js'

const VALID_HASH_TYPES = [ 0x01, 0x02, 0x03, 0x81, 0x82, 0x83 ]

export async function segwitHash (
  txdata    : TxData,
  idx       : number,
  value     : number,
  script    : ScriptData,
  sigflag   : number
) : Promise<Uint8Array> {
  if (!VALID_HASH_TYPES.includes(sigflag)) {
    // Check if the sigflag type is valid.
    throw new Error('Invalid hash type: ' + String(sigflag))
  }

  const { version, input, output, locktime } = txdata
  const { txid, vout, sequence } = input[idx]

  const isAnypay = sigflag > 0x80
  const stack    = [ ENC.encodeVersion(version) ]

  stack.push(
    await hashPrevouts(input, isAnypay),
    await hashSequence(input, sigflag),
    ENC.encodeTxid(txid),
    ENC.encodePrevOut(vout),
    encodeScript(script, true),
    ENC.encodeValue(value),
    ENC.encodeSequence(sequence),
    await hashOutputs(output, idx, sigflag),
    ENC.encodeLocktime(locktime),
    Buff.num(sigflag, 4).reverse()
  )

  return Hash.hash256(Buff.join(stack))
}

async function hashPrevouts (
  vin : InputData[],
  isAnypay ?: boolean
) : Promise<Uint8Array> {
  if (isAnypay === true) {
    return Buff.num(0, 32)
  }

  const stack = []

  for (const { txid, vout } of vin) {
    stack.push(ENC.encodeTxid(txid))
    stack.push(ENC.encodePrevOut(vout))
  }

  return Hash.hash256(Buff.join(stack))
}

async function hashSequence (
  vin     : InputData[],
  sigflag : number
) : Promise<Uint8Array> {
  if (sigflag !== 0x01) {
    return Buff.num(0, 32)
  }

  const stack = []

  for (const { sequence } of vin) {
    stack.push(ENC.encodeSequence(sequence))
  }
  return Hash.hash256(Buff.join(stack))
}

async function hashOutputs (
  vout    : OutputData[],
  idx     : number,
  sigflag : number
) : Promise<Uint8Array> {
  const stack = []

  if (sigflag === 0x01) {
    for (const { value, scriptPubKey } of vout) {
      stack.push(ENC.encodeValue(value))
      stack.push(encodeScript(scriptPubKey))
    }
    return Hash.hash256(Buff.join(stack))
  }

  if (sigflag === 0x03 && idx < vout.length) {
    const { value, scriptPubKey } = vout[idx]
    stack.push(ENC.encodeValue(value))
    stack.push(encodeScript(scriptPubKey))
    return Hash.hash256(Buff.join(stack))
  }

  return Buff.num(0, 32)
}
