import { Buff } from '@cmdcode/buff-utils'
import { hash } from '@cmdcode/crypto-utils'

import { parse_tx } from '../../tx/index.js'

import * as assert from '../../../lib/assert.js'
import * as ENC    from '../../tx/encode.js'
import * as Script from '../../script/index.js'
import * as util   from '../utils.js'

import {
  SigHashOptions,
  TxInput,
  TxOutput,
  TxBytes,
  TxData
} from '../../../types/index.js'

const { hash160, hash256 } = hash

const VALID_HASH_TYPES = [ 0x01, 0x02, 0x03 ]

export function hash_tx (
  txdata  : TxBytes | TxData,
  options : SigHashOptions = {}
) : Buff {
  // Unpack the sigflag from our config object.
  const { sigflag = 0x01, txindex } = options
  // Normalize the tx into JSON format.
  const tx = parse_tx(txdata)
  // Check if the ANYONECANPAY flag is set.
  const is_anypay = (sigflag & 0x80) === 0x80
  // Save a normalized version of the sigflag.
  const flag = sigflag % 0x80
  // Check if the sigflag exists as a valid type.
  if (!VALID_HASH_TYPES.includes(flag)) {
    throw new Error('Invalid hash type: ' + String(sigflag))
  }
  // Unpack the tx object.
  const { version, vin, vout, locktime } = tx
  // Parse the input we are signing from the config.
  const txinput = util.parse_txinput(tx, options)
  // Unpack the chosen input for signing.
  const { txid, vout: prevIdx, prevout, sequence } = txinput
  // Unpack the prevout for the chosen input.
  const { value } = prevout ?? {}
  // Check if a prevout value is provided.
  if (value === undefined) {
    throw new Error('Prevout value is empty!')
  }
  // Initialize our script variable from the config.
  let { pubkey, script } = options
  // Check if a pubkey is provided (instead of a script).
  if (
    script === undefined &&
    pubkey !== undefined
  ) {
    const pkhash = hash160(pubkey).hex
    script = `76a914${String(pkhash)}88ac`
  }
  // Make sure that some form of script has been provided.
  if (script === undefined) {
    throw new Error('No pubkey / script has been set!')
  }
  // Throw if OP_CODESEPARATOR is used in a script.
  if (Script.to_asm(script).includes('OP_CODESEPARATOR')) {
    throw new Error('This library does not currently support the use of OP_CODESEPARATOR in segwit scripts.')
  }

  const sighash = [
    ENC.encode_version(version),
    hash_prevouts(vin, is_anypay),
    hash_sequence(vin, flag, is_anypay),
    ENC.encode_txid(txid),
    ENC.encode_idx(prevIdx),
    Script.encode(script, true),
    ENC.encode_value(value),
    ENC.encode_sequence(sequence),
    hash_outputs(vout, flag, txindex),
    ENC.encode_locktime(locktime),
    Buff.num(sigflag, 4).reverse()
  ]

  // console.log('sighash:', sighash.map(e => Buff.bytes(e).hex))

  return hash256(Buff.join(sighash))
}

function hash_prevouts (
  vin : TxInput[],
  isAnypay ?: boolean
) : Uint8Array {
  if (isAnypay === true) {
    return Buff.num(0, 32)
  }

  const stack = []

  for (const { txid, vout } of vin) {
    stack.push(ENC.encode_txid(txid))
    stack.push(ENC.encode_idx(vout))
  }

  return hash256(Buff.join(stack))
}

function hash_sequence (
  vin      : TxInput[],
  sigflag  : number,
  isAnyPay : boolean
) : Uint8Array {
  if (isAnyPay || sigflag !== 0x01) {
    return Buff.num(0, 32)
  }

  const stack = []

  for (const { sequence } of vin) {
    stack.push(ENC.encode_sequence(sequence))
  }
  return hash256(Buff.join(stack))
}

function hash_outputs (
  vout    : TxOutput[],
  sigflag : number,
  idx    ?: number
) : Uint8Array {
  const stack = []

  if (sigflag === 0x01) {
    for (const { value, scriptPubKey } of vout) {
      stack.push(ENC.encode_value(value))
      stack.push(Script.encode(scriptPubKey, true))
    }
    return hash256(Buff.join(stack))
  }

  if (sigflag === 0x03) {
    assert.ok(idx !== undefined)
    if (idx < vout.length) {
      const { value, scriptPubKey } = vout[idx]
      stack.push(ENC.encode_value(value))
      stack.push(Script.encode(scriptPubKey, true))
      return hash256(Buff.join(stack))
    }
  }

  return Buff.num(0, 32)
}
