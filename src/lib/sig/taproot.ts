import { Buff, Stream }  from '@cmdcode/buff-utils'
import * as ENC          from '../tx/encode.js'
import { encodeScript }  from '../script/encode.js'
import { safeThrow }     from '../utils.js'

import { Hash, Noble, Point }    from '@cmdcode/crypto-utils'
import { decodeTx, normalizeTx } from '../tx/decode.js'

import {
  TxData,
  InputData,
  OutputData,
  WitnessData,
  Bytes
} from '../../schema/types.js'

import { normalizeData } from '../script/decode.js'
import { checkTapPath }  from '../tap/script.js'

interface HashConfig {
  extention     ?: Bytes
  sigflag       ?: number
  extflag       ?: number
  key_version   ?: number
  separator_pos ?: number
}

const ec = new TextEncoder()

const VALID_HASH_TYPES = [ 0x00, 0x01, 0x02, 0x03, 0x81, 0x82, 0x83 ]

export function getTweakFromPub (
  internal : string | Uint8Array,
  tweaked  : string | Uint8Array
) : Uint8Array {
  return Point
    .fromX(tweaked)
    .negate()
    .add(Point.fromX(internal))
    .rawX
}

export async function taprootSign (
  prvkey  : string | Uint8Array,
  txdata  : TxData | string | Uint8Array,
  index   : number,
  config  : HashConfig = {}
) : Promise<string> {
  const { sigflag = 0x00 } = config
  const sign = Noble.schnorr.sign
  const hash = await taprootHash(txdata, index, config)
  const sig  = await sign(hash, prvkey)

  return (sigflag === 0x00)
    ? Buff.raw(sig).hex
    : Buff.of(...sig, sigflag).hex
}

export async function taprootVerify (
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
  const signature = stream.read(64)
  const prevout   = tx.input[index].prevout
  const tapkey    = normalizeData(prevout?.scriptPubKey).slice(2)

  let target, cblock, flag = 0x00

  if (stream.size === 1) {
    flag = stream.read(1).num
    if (flag === 0x00) {
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
    config.extention = target
  }

  const hash   = await taprootHash(tx, index, config)
  const verify = Noble.schnorr.verify

  if (!await verify(signature, hash, tapkey)) {
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

export async function taprootHash (
  txdata  : TxData | string | Uint8Array,
  index   : number,
  config  : HashConfig = {}
) : Promise<Uint8Array> {
  if (
    typeof txdata === 'string' ||
    txdata instanceof Uint8Array
  ) {
    txdata = decodeTx(txdata)
  }
  // Unpack configuration.
  const {
    extention,
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
  const annex     = await getAnnexData(witness)
  const annexBit  = (extention !== undefined) ? 1 : 0
  const extendBit = (annex !== undefined) ? 1 : 0
  const spendType = ((extflag + extendBit) * 2) + annexBit

  // Begin building our digest.
  const digest = [
    await getTapTag('TapSighash'),
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
      await hashOutpoints(input),
      await hashAmounts(prevouts),
      await hashScripts(prevouts),
      await hashSequence(input)
    )
  }

  if ((sigflag & 0x03) < 2 || (sigflag & 0x03) > 3) {
    // If hash types SINGLE and NONE are unset,
    // include a commitment to all outputs.
    digest.push(await hashOutputs(output))
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
    digest.push(await hashOutput(output[index]))
  }

  // Useful for debugging the digest stack.
  // console.log(digest.map(e => Buff.raw(e).hex))

  let sigmsg = await Hash.sha256(Buff.join(digest))

  if (extention !== undefined) {
    sigmsg = Buff.of(
      ...sigmsg,
      ...Buff.normalize(extention),
      key_version,
      ...Buff.num(separator_pos)
    )
  }

  return sigmsg
}

export async function hashOutpoints (
  vin : InputData[]
) : Promise<Uint8Array> {
  const stack = []
  for (const { txid, vout } of vin) {
    stack.push(ENC.encodeTxid(txid))
    stack.push(ENC.encodePrevOut(vout))
  }
  return Hash.sha256(Buff.join(stack))
}

export async function hashSequence (
  vin : InputData[]
) : Promise<Uint8Array> {
  const stack = []
  for (const { sequence } of vin) {
    stack.push(ENC.encodeSequence(sequence))
  }
  return Hash.sha256(Buff.join(stack))
}

export async function hashAmounts (
  prevouts : OutputData[]
) : Promise<Uint8Array> {
  const stack = []
  for (const { value } of prevouts) {
    stack.push(ENC.encodeValue(value))
  }
  return Hash.sha256(Buff.join(stack))
}

export async function hashScripts (
  prevouts : OutputData[]
) : Promise<Uint8Array> {
  const stack = []
  for (const { scriptPubKey } of prevouts) {
    stack.push(encodeScript(scriptPubKey))
  }
  return Hash.sha256(Buff.join(stack))
}

export async function hashOutputs (
  vout : OutputData[]
) : Promise<Uint8Array> {
  const stack = []
  for (const { value, scriptPubKey } of vout) {
    stack.push(ENC.encodeValue(value))
    stack.push(encodeScript(scriptPubKey))
  }
  return Hash.sha256(Buff.join(stack))
}

export async function hashOutput (
  vout : OutputData
) : Promise<Uint8Array> {
  return Hash.sha256(Buff.of(
    ...ENC.encodeValue(vout.value),
    ...encodeScript(vout.scriptPubKey)
  ))
}

async function getAnnexData (
  witness ?: WitnessData
) : Promise<Uint8Array | undefined> {
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

async function getTapTag (tag : string) : Promise<Uint8Array> {
  const htag = await Hash.sha256(ec.encode(tag))
  return Uint8Array.of(...htag, ...htag)
}

async function getTapLeaf (
  data : string | Uint8Array,
  version = 0xc0
) : Promise<string> {
  return Hash.sha256(Uint8Array.of(
    ...await getTapTag('TapLeaf'),
    version & 0xf0,
    ...Buff.normalize(data)
  )).then(e => Buff.raw(e).hex)
}
