import { Buff }         from '@cmdcode/buff-utils'
import * as ENC         from '../../tx/encode.js'
import { Tx }           from '../../tx/index.js'
import { Script }       from '../../script/index.js'
import { encodeScript } from '../../script/encode.js'
import { HashConfig }   from '../types.js'

import {
  Bytes,
  InputData,
  OutputData,
  ScriptData,
  TxTemplate
} from '../../../schema/types.js'

const VALID_HASH_TYPES = [ 0x00, 0x01, 0x02, 0x03, 0x81, 0x82, 0x83 ]

export function hashTx (
  template : TxTemplate | Bytes,
  index    : number,
  config   : HashConfig = {}
) : Buff {
  // Unpack configuration.
  const {
    extension,
    sigflag       = 0x00,
    extflag       = 0x00,
    key_version   = 0x00,
    separator_pos = 0xFFFFFFFF
  } = config

  // Normalize and unpack the txdata object.
  const txdata = Tx.fmt.toJson(template)
  const { version, vin: input, vout: output, locktime } = txdata

  if (index >= input.length) {
    // If index is out of bounds, throw error.
    throw new Error('Index out of bounds: ' + String(index))
  }

  if (!VALID_HASH_TYPES.includes(sigflag)) {
    // If the sigflag is an invalid type, throw error.
    throw new Error('Invalid hash type: ' + String(sigflag))
  }

  if (extflag < 0 || extflag > 127) {
    // If the extflag is out of range, throw error.
    throw new Error('Extention flag out of range: ' + String(extflag))
  }

  // Unpack the input being signed.
  const { txid, vout, sequence, witness = [] } = input[index]

  // Define the parameters of the transaction.
  const isAnyPay  = (sigflag & 0x80) === 0x80
  const annex     = getAnnexData(witness)
  const annexBit  = (annex !== undefined) ? 1 : 0
  const extendBit = (extension !== undefined) ? 1 : 0
  const spendType = ((extflag + extendBit) * 2) + annexBit
  const hashtag   = Buff.str('TapSighash').digest

  // Begin building our preimage.
  const preimage = [
    hashtag,                      // Buffer input with
    hashtag,                      // 2x hashed strings.
    Buff.num(0x00, 1),            // Add zero-byte.
    Buff.num(sigflag, 1),         // Commit to signature flag.
    ENC.encodeVersion(version),   // Commit to tx version.
    ENC.encodeLocktime(locktime)  // Commit to tx locktime.
  ]

  if (!isAnyPay) {
    // If flag ANYONE_CAN_PAY is not set,
    // then commit to all inputs.
    const prevouts = input.map(e => getPrevout(e))
    preimage.push(
      hashOutpoints(input),   // Commit to txid/vout for each input.
      hashAmounts(prevouts),  // Commit to prevout amount for each input.
      hashScripts(prevouts),  // Commit to prevout script for each input.
      hashSequence(input)     // Commit to sequence value for each input.
    )
  }

  if ((sigflag & 0x03) < 2 || (sigflag & 0x03) > 3) {
    // If neither SINGLE or NONE flags are set,
    // include a commitment to all outputs.
    preimage.push(hashOutputs(output))
  }

  // At this step, we include the spend type.
  preimage.push(Buff.num(spendType, 1))

  if (isAnyPay) {
    // If ANYONE_CAN_PAY flag is set, then we will
    // provide a commitment to the input being signed.
    const { value, scriptPubKey } = getPrevout(input[index])
    preimage.push(
      ENC.encodeTxid(txid),               // Commit to the input txid.
      ENC.encodePrevOut(vout),            // Commit to the input vout index.
      ENC.encodeValue(value),             // Commit to the input's prevout value.
      Script.encode(scriptPubKey, true),  // Commit to the input's prevout script.
      ENC.encodeSequence(sequence)        // Commit to the input's sequence value.
    )
  } else {
    // Otherwise, we must have already included a commitment
    // to all inputs in the tx, so simply add a commitment to
    // the index of the input we are signing for.
    preimage.push(Buff.num(index, 4).reverse())
  }

  if (annex !== undefined) {
    // If an annex has been set, include it here.
    preimage.push(annex)
  }

  if ((sigflag & 0x03) === 0x03) {
    // If the SINGLE flag is set, then include a
    // commitment to the output which is adjacent
    // to the input that we are signing for.
    preimage.push(hashOutput(output[index]))
  }

  if (extension !== undefined) {
    // If we are extending this signature to include
    // other commitments (such as a tapleaf), then we
    // will add it to the preimage here.
    preimage.push(
      Buff.bytes(extension),      // Extention data (in bytes).
      Buff.num(key_version),      // Key version (reserved for future upgrades).
      Buff.num(separator_pos, 4, 'le')  // If OP_CODESEPARATOR is used, this must be set.
    )
  }

  // Useful for debugging the preimage stack.
  // console.log(preimage.map(e => Buff.raw(e).hex))

  return Buff.join(preimage).digest
}

export function hashOutpoints (
  vin : InputData[]
) : Uint8Array {
  const stack = []
  for (const { txid, vout } of vin) {
    stack.push(ENC.encodeTxid(txid))
    stack.push(ENC.encodePrevOut(vout))
  }
  return Buff.join(stack).digest
}

export function hashSequence (
  vin : InputData[]
) : Uint8Array {
  const stack = []
  for (const { sequence } of vin) {
    stack.push(ENC.encodeSequence(sequence))
  }
  return Buff.join(stack).digest
}

export function hashAmounts (
  prevouts : OutputData[]
) : Uint8Array {
  const stack = []
  for (const { value } of prevouts) {
    stack.push(ENC.encodeValue(value))
  }
  return Buff.join(stack).digest
}

export function hashScripts (
  prevouts : OutputData[]
) : Uint8Array {
  const stack = []
  for (const { scriptPubKey } of prevouts) {
    stack.push(encodeScript(scriptPubKey, true))
  }
  return Buff.join(stack).digest
}

export function hashOutputs (
  vout : OutputData[]
) : Uint8Array {
  const stack = []
  for (const { value, scriptPubKey } of vout) {
    stack.push(ENC.encodeValue(value))
    stack.push(Script.encode(scriptPubKey, true))
  }
  return Buff.join(stack).digest
}

export function hashOutput (
  vout : OutputData
) : Uint8Array {
  return Buff.join([
    ENC.encodeValue(vout.value),
    Script.encode(vout.scriptPubKey, true)
  ]).digest
}

function getAnnexData (
  witness ?: ScriptData[]
) : Uint8Array | undefined {
  // If no witness exists, return undefined.
  if (witness === undefined) return
  // If there are less than two elements, return undefined.
  if (witness.length < 2) return
  // Define the last element as the annex.
  let annex = witness.at(-1)
  // If element is a string,
  if (typeof annex === 'string') {
    // convert to bytes.
    annex = Buff.hex(annex)
  }
  // If first byte is annex flag,
  if (
    annex instanceof Uint8Array &&
    annex[0] === 0x50
  ) {
    // return a digest of the annex.
    return Buff.raw(annex).prefixSize('be').digest
  }
  // Else, return undefined.
  return undefined
}

function getPrevout (vin : InputData) : OutputData {
  if (vin.prevout === undefined) {
    throw new Error('Prevout data missing for input: ' + String(vin.txid))
  }
  return vin.prevout
}
