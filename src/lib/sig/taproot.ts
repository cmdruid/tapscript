import { Buff, Stream }  from '@cmdcode/buff-utils'
import * as ENC          from '../tx/encode.js'
import { encodeScript }  from '../script/encode.js'
import { normalizeData } from '../script/decode.js'
import { checkTapPath }  from '../tree/proof.js'
import { sign, verify }  from './signer.js'
import { safeThrow }     from '../utils.js'
import { getTapLeaf }    from '../tree/script.js'
import { Address }       from '../addr/index.js'
import { decodeTx, normalizeTx } from '../tx/decode.js'

import {
  TxData,
  InputData,
  OutputData,
  WitnessData,
  Bytes
} from '../../schema/types.js'

interface HashConfig {
  extension     ?: Bytes   // Include a tapleaf hash with your signature hash.
  pubkey        ?: Bytes   // Verify using this pubkey instead of the tapkey.
  sigflag       ?: number  // Set the signature type flag.
  separator_pos ?: number  // If using OP_CODESEPARATOR, specify the latest opcode position.
  extflag       ?: number  // Set the extention version flag (future use).
  key_version   ?: number  // Set the key version flag (future use).
}

const VALID_HASH_TYPES = [ 0x00, 0x01, 0x02, 0x03, 0x81, 0x82, 0x83 ]

export function signTx (
  prvkey  : string | Uint8Array,
  txdata  : TxData | string | Uint8Array,
  index   : number,
  config  : HashConfig = {}
) : string {
  const { sigflag = 0x00 } = config
  const hash = hashTx(txdata, index, config)
  const sig  = sign(prvkey, hash)

  return (sigflag === 0x00)
    ? Buff.raw(sig).hex
    : Buff.join([ sig, sigflag ]).hex
}

export async function verifyTx (
  txdata  : TxData | string | Uint8Array,
  index   : number,
  config  : HashConfig = {},
  shouldThrow = false
) : Promise<boolean> {
  const tx = normalizeTx(txdata)
  const { witness } = tx.input[index]

  if (!Array.isArray(witness) || witness.length < 1) {
    return safeThrow('Invalid witness data: ' + String(witness), shouldThrow)
  }

  const annex = normalizeData(witness[witness.length - 1])

  if (annex[0] === 0x50) witness.pop()

  if (witness.length < 1) {
    return safeThrow('Invalid witness data: ' + String(witness), shouldThrow)
  }

  const stream    = new Stream(normalizeData(witness[0]))
  const signature = stream.read(64).raw
  const prevout   = tx.input[index].prevout
  const tapkey    = normalizeData(prevout?.scriptPubKey).slice(2)

  let target, cblock

  if (stream.size === 1) {
    config.sigflag = stream.read(1).num
    if (config.sigflag === 0x00) {
      return safeThrow('0x00 is not a valid appended sigflag!', shouldThrow)
    }
  }

  if (witness.length > 1) {
    // Check if cblock present.
    cblock = normalizeData(witness.pop())
  }

  if (witness.length > 1 && cblock instanceof Uint8Array) {
    const script  = encodeScript(witness.pop())
    const version = cblock[0] & 0xfe
    target = await getTapLeaf(script, version)
    config.extension = target
  }

  const hash = hashTx(tx, index, config)

  if (!verify(signature, hash, tapkey, true)) {
    return safeThrow('Invalid signature!', shouldThrow)
  }

  if (
    cblock !== undefined && target !== undefined &&
    !await checkTapPath(tapkey, cblock, target)
  ) {
    return safeThrow('Invalid cblock!', shouldThrow)
  }

  return true
}

export function hashTx (
  txdata  : TxData | string | Uint8Array,
  index   : number,
  config  : HashConfig = {}
) : Uint8Array {
  if (
    typeof txdata === 'string' ||
    txdata instanceof Uint8Array
  ) {
    txdata = decodeTx(txdata)
  }
  // Unpack configuration.
  const {
    extension,
    sigflag       = 0x00,
    extflag       = 0x00,
    key_version   = 0x00,
    separator_pos = 0xFFFFFFFF
  } = config

  // Unpack txdata object.
  const { version, input = [], output = [], locktime } = txdata

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
  const tag       = Buff.str('TapSighash').digest

  // Begin building our digest.
  const digest = [
    tag,
    tag,
    Buff.num(0x00, 1),
    Buff.num(sigflag, 1),
    ENC.encodeVersion(version),
    ENC.encodeLocktime(locktime)
  ]

  if (!isAnyPay) {
    // If hash type ANYONE_CAN_PAY is unset,
    // include a commitment to all inputs.
    const prevouts = input.map(e => getPrevout(e))
    digest.push(
      hashOutpoints(input),
      hashAmounts(prevouts),
      hashScripts(prevouts),
      hashSequence(input)
    )
  }

  if ((sigflag & 0x03) < 2 || (sigflag & 0x03) > 3) {
    // If hash types SINGLE and NONE are unset,
    // include a commitment to all outputs.
    digest.push(hashOutputs(output))
  }

  // At this step, we include the spend type.
  digest.push(Buff.num(spendType, 1))

  if (isAnyPay) {
    const { value, scriptPubKey } = getPrevout(input[index])
    digest.push(
      ENC.encodeTxid(txid),
      ENC.encodePrevOut(vout),
      ENC.encodeValue(value),
      encodeScript(scriptPubKey),
      ENC.encodeSequence(sequence)
    )
  } else {
    digest.push(Buff.num(index, 4).reverse())
  }

  if (annex !== undefined) digest.push(annex)

  if ((sigflag & 0x03) === 0x03) {
    digest.push(hashOutput(output[index]))
  }

  if (extension !== undefined) {
    digest.push(
      Buff.normalize(extension),
      Buff.num(key_version),
      Buff.num(separator_pos, 4)
    )
  }

  // Useful for debugging the digest stack.
  // console.log(digest.map(e => Buff.raw(e).hex))

  return Buff.join(digest).digest
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
  for (const { address, scriptPubKey } of prevouts) {
    if (typeof address === 'string') {
      const script = Address.convert(address)
      stack.push(encodeScript(script))
    } else {
      stack.push(encodeScript(scriptPubKey))
    }
  }
  return Buff.join(stack).digest
}

export function hashOutputs (
  vout : OutputData[]
) : Uint8Array {
  const stack = []
  for (const { value, scriptPubKey } of vout) {
    stack.push(ENC.encodeValue(value))
    stack.push(encodeScript(scriptPubKey))
  }
  return Buff.join(stack).digest
}

export function hashOutput (
  vout : OutputData
) : Uint8Array {
  return Buff.join([
    ENC.encodeValue(vout.value),
    encodeScript(vout.scriptPubKey)
  ]).digest
}

function getAnnexData (
  witness ?: WitnessData
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
