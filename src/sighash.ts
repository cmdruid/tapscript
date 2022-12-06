import { Buff } from '@cmdcode/bytes-utils'
import { Hash } from '@cmdcode/crypto-utils'

import * as ENC       from './encode.js'
import * as Type      from './types.js'
import { getSigCode } from './words.js'

export default async function encodeSighash(
  txdata    : Type.Data,
  idx       : number,
  value     : number,
  script    : Type.ScriptData,
  sigflag   : string | number,
  isAnypay? : boolean
) : Promise<Uint8Array> {

  const { version, vin, vout, locktime } = txdata

  if (typeof sigflag === 'string') {
    sigflag = getSigCode(sigflag)
  }

  const { prevTxid, prevOut, sequence } = vin[idx]
  const stack = [ ENC.encodeVersion(version) ]

  sigflag = (isAnypay === true) ? sigflag + 0x80 : sigflag

  stack.push(await hashPrevouts(vin, isAnypay))
  stack.push(await hashSequence(vin, sigflag))
  stack.push(ENC.encodeTxid(prevTxid))
  stack.push(ENC.encodePrevOut(prevOut))
  stack.push(ENC.encodeScript(script, true))
  stack.push(ENC.encodeValue(value))
  stack.push(ENC.encodeSequence(sequence))
  stack.push(await hashOutputs(vout, idx, sigflag))
  stack.push(ENC.encodeLocktime(locktime))
  stack.push(Buff.num(sigflag, 4).reverse())

  return Hash.hash256(Buff.join(stack))
}

async function hashPrevouts(
  vin : Type.InData[], 
  isAnypay? : boolean
) : Promise<Uint8Array> {

  if (isAnypay === true) {
    return Buff.num(0, 32)
  }

  const stack = []

  for (const { prevTxid, prevOut } of vin) {
    stack.push(ENC.encodeTxid(prevTxid))
    stack.push(ENC.encodePrevOut(prevOut))
  }

  return Hash.hash256(Buff.join(stack))
}

async function hashSequence(
  vin       : Type.InData[],
  sigflag   : number
) : Promise<Uint8Array> {

  if (sigflag > 0x01) {
    return Buff.num(0, 32)
  }

  const stack = []

  for (const { sequence } of vin) {
    stack.push(ENC.encodeSequence(sequence))
  }
  return Hash.hash256(Buff.join(stack))
}

async function hashOutputs(
  vout    : Type.OutData[],
  idx     : number, 
  sigflag : number
) : Promise<Uint8Array> {

  const stack = []

  if (sigflag === 0x01) {
    for (const { value, scriptPubKey } of vout) {
      stack.push(ENC.encodeValue(value))
      stack.push(ENC.encodeScript(scriptPubKey))
    }
    return Hash.hash256(Buff.join(stack))
  } 
  
  if (sigflag === 0x03 && idx < vout.length) {
    const { value, scriptPubKey } = vout[idx]
    stack.push(ENC.encodeValue(value))
    stack.push(ENC.encodeScript(scriptPubKey))
    return Hash.hash256(Buff.join(stack))
  }

  return Buff.num(0, 32)
}
