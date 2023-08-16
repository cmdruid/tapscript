import { Buff } from '@cmdcode/buff-utils'
import { hash } from '@cmdcode/crypto-utils'
import assert   from 'assert'

import * as ENC    from '../../tx/encode.js'
import * as Script from '../../script/index.js'
import * as Tx     from '../../tx/index.js'
import * as util   from '../utils.js'

import {
  HashConfig,
  InputData,
  OutputData,
  TxBytes,
  TxData
} from '../../../schema/index.js'

const { hash160, hash256 } = hash

const VALID_HASH_TYPES = [ 0x01, 0x02, 0x03 ]

export function hash_tx (
  txdata : TxBytes | TxData,
  config : HashConfig = {}
) : Buff {
  // Unpack the sigflag from our config object.
  const { sigflag = 0x01, txindex } = config
  // Normalize the tx into JSON format.
  const tx = Tx.to_json(txdata)
  // Check that the config is valid.
  util.validate_config(tx, config)
  // Check if the ANYONECANPAY flag is set.
  const is_anypay = util.check_anypay(sigflag)
  // Save a normalized version of the sigflag.
  const flag = sigflag % 0x80
  // Check if the sigflag exists as a valid type.
  if (!VALID_HASH_TYPES.includes(flag)) {
    throw new Error('Invalid hash type: ' + String(sigflag))
  }
  // Unpack the tx object.
  const { version, vin, vout, locktime } = tx
  // Parse the input we are signing from the config.
  const txinput = util.parse_txinput(tx, config)
  // Unpack the chosen input for signing.
  const { txid, vout: prevIdx, prevout, sequence } = txinput
  // Unpack the prevout for the chosen input.
  const { value } = prevout ?? {}
  // Check if a prevout value is provided.
  if (value === undefined) {
    throw new Error('Prevout value is empty!')
  }
  // Initialize our script variable from the config.
  let script = config.script
  // Check if a pubkey is provided (instead of a script).
  if (
    script === undefined &&
    config.pubkey !== undefined
  ) {
    const pkhash = hash160(config.pubkey).hex
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
    ENC.encodeVersion(version),
    hashPrevouts(vin, is_anypay),
    hashSequence(vin, flag, is_anypay),
    ENC.encodeTxid(txid),
    ENC.encodePrevOut(prevIdx),
    Script.encode(script, true),
    ENC.encodeValue(value),
    ENC.encodeSequence(sequence),
    hash_outputs(vout, flag, txindex),
    ENC.encodeLocktime(locktime),
    Buff.num(sigflag, 4).reverse()
  ]

  // console.log('sighash:', sighash.map(e => Buff.bytes(e).hex))

  return hash256(Buff.join(sighash))
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

  return hash256(Buff.join(stack))
}

function hashSequence (
  vin      : InputData[],
  sigflag  : number,
  isAnyPay : boolean
) : Uint8Array {
  if (isAnyPay || sigflag !== 0x01) {
    return Buff.num(0, 32)
  }

  const stack = []

  for (const { sequence } of vin) {
    stack.push(ENC.encodeSequence(sequence))
  }
  return hash256(Buff.join(stack))
}

function hash_outputs (
  vout    : OutputData[],
  sigflag : number,
  idx    ?: number
) : Uint8Array {
  const stack = []

  if (sigflag === 0x01) {
    for (const { value, scriptPubKey } of vout) {
      stack.push(ENC.encodeValue(value))
      stack.push(Script.encode(scriptPubKey, true))
    }
    return hash256(Buff.join(stack))
  }

  if (sigflag === 0x03) {
    assert.ok(idx !== undefined)
    if (idx < vout.length) {
      const { value, scriptPubKey } = vout[idx]
      stack.push(ENC.encodeValue(value))
      stack.push(Script.encode(scriptPubKey, true))
      return hash256(Buff.join(stack))
    }
  }

  return Buff.num(0, 32)
}
