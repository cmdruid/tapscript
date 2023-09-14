import { Buff } from '@cmdcode/buff'

import { parse_tx }         from '../../tx/index.js'
import { encode_script }    from '../../script/encode.js'
import { encode_tapscript } from '../../tap/encode.js'
import { parse_txinput }    from '../utils.js'

import {
  SigHashOptions,
  ScriptData,
  TxBytes,
  TxData,
  TxInput,
  TxOutput
} from '../../../types/index.js'

import * as ENC    from '../../tx/encode.js'
import * as assert from '../../assert.js'

const VALID_HASH_TYPES = [ 0x00, 0x01, 0x02, 0x03, 0x81, 0x82, 0x83 ]

export function hash_tx (
  template : TxBytes | TxData,
  config   : SigHashOptions = {}
) : Buff {
  // Unpack configuration.
  const {
    script,
    txindex,
    sigflag       = 0x00,
    extflag       = 0x00,
    key_version   = 0x00,
    separator_pos = 0xFFFFFFFF
  } = config
  // Normalize the txdata object.
  const tx = parse_tx(template)
  // Unpack the txdata object.
  const { version, vin: input, vout: output, locktime } = tx
  // Parse the input we are signing from the config.
  const txinput = parse_txinput(tx, config)
  // Unpack the txinput object.
  const { txid, vout, sequence, witness = [] } = txinput
  // Check if we are using a valid hash type.
  if (!VALID_HASH_TYPES.includes(sigflag)) {
    // If the sigflag is an invalid type, throw error.
    throw new Error('Invalid hash type: ' + String(sigflag))
  }
  if (extflag < 0 || extflag > 127) {
    // If the extflag is out of range, throw error.
    throw new Error('Extention flag out of range: ' + String(extflag))
  }

  let { extension } = config

  if (script !== undefined) {
    extension = encode_tapscript(script)
  }

  // Define the parameters of the transaction.
  const is_anypay = (sigflag & 0x80) === 0x80
  const annex     = get_annex_data(witness)
  const annexBit  = (annex !== undefined) ? 1 : 0
  const extendBit = (extension !== undefined) ? 1 : 0
  const spendType = ((extflag + extendBit) * 2) + annexBit
  const hashtag   = Buff.str('TapSighash').digest

  // Begin building our preimage.
  const preimage = [
    hashtag,                       // Buffer input with
    hashtag,                       // 2x hashed strings.
    Buff.num(0x00, 1),             // Add zero-byte.
    Buff.num(sigflag, 1),          // Commit to signature flag.
    ENC.encode_version(version),   // Commit to tx version.
    ENC.encode_locktime(locktime)  // Commit to tx locktime.
  ]

  if (!is_anypay) {
    // If flag ANYONE_CAN_PAY is not set,
    // then commit to all inputs.
    const prevouts = input.map(e => get_prevout(e))
    preimage.push(
      hash_outpoints(input),   // Commit to txid/vout for each input.
      hash_amounts(prevouts),  // Commit to prevout amount for each input.
      hash_scripts(prevouts),  // Commit to prevout script for each input.
      hash_sequence(input)     // Commit to sequence value for each input.
    )
  }

  if ((sigflag & 0x03) < 2 || (sigflag & 0x03) > 3) {
    // If neither SINGLE or NONE flags are set,
    // include a commitment to all outputs.
    preimage.push(hash_outputs(output))
  }

  // At this step, we include the spend type.
  preimage.push(Buff.num(spendType, 1))

  if (is_anypay) {
    // If ANYONE_CAN_PAY flag is set, then we will
    // provide a commitment to the input being signed.
    const { value, scriptPubKey } = get_prevout(txinput)
    preimage.push(
      ENC.encode_txid(txid),              // Commit to the input txid.
      ENC.encode_idx(vout),               // Commit to the input vout index.
      ENC.encode_value(value),            // Commit to the input's prevout value.
      encode_script(scriptPubKey, true),  // Commit to the input's prevout script.
      ENC.encode_sequence(sequence)       // Commit to the input's sequence value.
    )
  } else {
    // Otherwise, we must have already included a commitment
    // to all inputs in the tx, so simply add a commitment to
    // the index of the input we are signing for.
    assert.ok(typeof txindex === 'number')
    preimage.push(Buff.num(txindex, 4).reverse())
  }

  if (annex !== undefined) {
    // If an annex has been set, include it here.
    preimage.push(annex)
  }

  if ((sigflag & 0x03) === 0x03) {
    // If the SINGLE flag is set, then include a
    // commitment to the output which is adjacent
    // to the input that we are signing for.
    assert.ok(typeof txindex === 'number')
    preimage.push(hash_output(output[txindex]))
  }

  if (extension !== undefined) {
    // If we are extending this signature to include
    // other commitments (such as a tapleaf), then we
    // will add it to the preimage here.
    preimage.push(
      Buff.bytes(extension),      // Extention data (in bytes).
      Buff.num(key_version),      // Key version (reserved for future upgrades).
      Buff.num(separator_pos, 4)  // If OP_CODESEPARATOR is used, this must be set.
    )
  }

  // Useful for debugging the preimage stack.
  // console.log(preimage.map(e => Buff.raw(e).hex))

  return Buff.join(preimage).digest
}

export function hash_outpoints (
  vin : TxInput[]
) : Buff {
  const stack = []
  for (const { txid, vout } of vin) {
    stack.push(ENC.encode_txid(txid))
    stack.push(ENC.encode_idx(vout))
  }
  return Buff.join(stack).digest
}

export function hash_sequence (
  vin : TxInput[]
) : Buff {
  const stack = []
  for (const { sequence } of vin) {
    stack.push(ENC.encode_sequence(sequence))
  }
  return Buff.join(stack).digest
}

export function hash_amounts (
  prevouts : TxOutput[]
) : Buff {
  const stack = []
  for (const { value } of prevouts) {
    stack.push(ENC.encode_value(value))
  }
  return Buff.join(stack).digest
}

export function hash_scripts (
  prevouts : TxOutput[]
) : Buff {
  const stack = []
  for (const { scriptPubKey } of prevouts) {
    stack.push(encode_script(scriptPubKey, true))
  }
  return Buff.join(stack).digest
}

export function hash_outputs (
  vout : TxOutput[]
) : Buff {
  const stack = []
  for (const { value, scriptPubKey } of vout) {
    stack.push(ENC.encode_value(value))
    stack.push(encode_script(scriptPubKey, true))
  }
  return Buff.join(stack).digest
}

export function hash_output (
  vout : TxOutput
) : Buff {
  return Buff.join([
    ENC.encode_value(vout.value),
    encode_script(vout.scriptPubKey, true)
  ]).digest
}

function get_annex_data (
  witness ?: ScriptData[]
) : Buff | undefined {
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
    return Buff.raw(annex).add_varint('be').digest
  }
  // Else, return undefined.
  return undefined
}

function get_prevout (vin : TxInput) : TxOutput {
  if (vin.prevout === undefined) {
    throw new Error('Prevout data missing for input: ' + String(vin.txid))
  }
  return vin.prevout
}
