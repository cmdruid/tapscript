import { Bytes } from './bytes.js'
import { sha256 } from './crypto.js'
import { JSONtoBytes } from './helpers.js'
import { isString, isNumber } from './validate.js'
import { getSigCode } from './codes.js'
import { convertCode } from './script.js'
import { encodeSequenceMeta } from './format/timelocks.js'

export function encodeTx(obj, opt = {}) {
  /** Convert a JSON-based Bitcoin transaction
   * into hex-encoded bytes.
   * */
  const { omitMeta, omitWitness } = opt
  const { version, vin, vout, locktime, meta } = obj

  const hasWitness = checkForWitness(vin)

  const raw = [encodeVersion(version)]

  if (!omitMeta && meta) {
    raw.push(Bytes.from('0002', 2))
  } else if (!omitWitness && hasWitness) {
    raw.push(Bytes.from('0001', 2))
  }

  raw.push(encodeInputs(vin))
  raw.push(encodeOutputs(vout))

  for (const input of vin) {
    if (!omitWitness && hasWitness && input?.witness) {
      raw.push(encodeWitness(input.witness))
    }
  }

  raw.push(encodeLocktime(locktime))

  if (!omitMeta && meta) raw.push(encodeMeta(meta))

  return Bytes.from(Bytes.join(raw)).toHex()
}

export function encodeBaseTx(obj) {
  return encodeTx(obj, { omitWintess: true, omitMeta: true })
}

function checkForWitness(vin) {
  /** Check if any witness data is present. */
  for (const txin of vin) {
    if (txin?.witness) return true
  }
  return false
}

function encodeVersion(num) {
  return Bytes.from(num, 4)
}

function encodeTxid(txid) {
  return Bytes.from(txid, 32, { reverse: true })
}

function encodePrevOut(vout) {
  return Bytes.from(vout, 4)
}

function encodeSequence(seq) {
  let sequence
  switch (true) {
    case (seq === 0 || seq === null):
      sequence = Bytes.from(0xFFFFFFFF, 4)
      break
    case (isString(seq) || isNumber(seq)):
      sequence = Bytes.from(seq, 4)
      break
    case (typeof seq === 'object'):
      sequence = Bytes.from(encodeSequenceMeta(seq), 4)
      break
    default:
      throw new TypeError('Invalid sequence:' + seq)
  }
  return sequence
}

function encodeInputs(arr) {
  const raw = [Bytes.varInt(arr.length)]
  for (const vin of arr) {
    const { prevTxid, prevOut, scriptSig, sequence } = vin
    raw.push(encodeTxid(prevTxid))
    raw.push(encodePrevOut(prevOut))
    raw.push(encodeScript(scriptSig))
    raw.push(encodeSequence(sequence))
  }
  return Bytes.join(raw)
}

function encodeValue(value) {
  return Bytes.from(value, 8)
}

function encodeOutputs(arr) {
  const raw = [Bytes.varInt(arr.length)]
  for (const vout of arr) {
    const { value, scriptPubkey } = vout
    raw.push(encodeValue(value))
    raw.push(encodeScript(scriptPubkey))
  }
  return Bytes.join(raw)
}

function encodeWitness(witness) {
  switch (true) {
    case (Array.isArray(witness)):
      return encodeWordArray(witness)
    case (typeof witness === 'object'):
      witness = [...witness.data, witness.hex]
      return encodeWordArray(witness)
    case (typeof data === 'string'):
      return Bytes.from(witness)
    default:
      throw new Error('Invalid data type:', typeof (data))
  }
}

function encodeWordArray(data) {
  const words = [Bytes.varInt(data.length)]
  for (const word of data) {
    words.push(Bytes.from(word, null, { varint: true }))
  }
  return Bytes.join(words)
}

function encodeLocktime(num) {
  return Bytes.from(num, 4)
}

function encodeMeta(meta) {
  const bytes = JSONtoBytes(meta)
  const size = Bytes.varInt(bytes.length)
  return Bytes.join([size, bytes])
}

export function encodeScript(script, opt = {}) {
  const { varint = true } = opt
  const { hex, asm } = script

  let bytes

  switch (true) {
    case (hex !== undefined):
      bytes = Bytes.from(hex)
      break
    case (asm !== undefined):
      bytes = encodeScriptArray(asm)
      break
    case (Array.isArray(script)):
      bytes = encodeScriptArray(script)
      break
    case (isString(script) || isNumber(script)):
      bytes = Bytes.from(script)
      break
    default:
      throw new Error(`Invalid script format: ${typeof script}`)
  }

  return (varint)
    ? Bytes.join([Bytes.varInt(bytes.length), bytes])
    : bytes
}

function encodeScriptArray(scriptArray) {
  const words = []
  for (let word of scriptArray) {
    word = convertCode(word)
    if (isNumber(word)) {
      words.push(Bytes.from(word, 1))
    } else {
      const bytes = Bytes.from(word)
      words.push(encodeWordSize(bytes.length))
      words.push(bytes)
    }
  }
  return Bytes.join(words)
}

export async function getSigHash(tx, idx, value, script, opt = {}) {
  const { version, vin, vout, locktime } = tx

  opt.sigflag = opt.sigflag || 'ALL'
  opt.anypay = opt.anypay || false

  const raw = [encodeVersion(version)]

  raw.push(await hashPrevouts(vin, opt))
  raw.push(await hashSequence(vin, opt))

  const { txid, vout: prevout, sequence } = vin[idx]

  raw.push(encodeTxid(txid))
  raw.push(encodePrevOut(prevout))

  if (isString(script) && script.length === 40) {
    script = '76a914' + script + '88ac'
  }

  raw.push(encodeScript(script))

  raw.push(encodeValue(value))
  raw.push(encodeSequence(sequence))

  raw.push(await hashOutputs(vout, idx, opt))
  raw.push(encodeLocktime(locktime))

  const sigcode = (opt.anypay)
    ? getSigCode(opt.sigflag) + 0x80
    : getSigCode(opt.sigflag)

  raw.push(Bytes.from(sigcode))

  return sha256(Bytes.join(raw))
    .then(bytes => Bytes.from(bytes).toHex())
}

function hashPrevouts(vin, opt) {
  const { anypay } = opt
  if (anypay) {
    return Bytes.convert(0, 32)
  }
  const raw = []
  for (const { txid, vout } of vin) {
    raw.push(encodeTxid(txid))
    raw.push(encodePrevOut(vout))
  }
  return sha256(Bytes.join(raw), 2)
}

function hashSequence(vin, opt) {
  const { sigflag, anypay } = opt
  if (anypay || ['SINGLE', 'NONE'].includes(sigflag)) {
    return Bytes.convert(0, 32)
  }
  const raw = []
  for (const { sequence } of vin) {
    raw.push(encodeSequence(sequence))
  }
  return sha256(Bytes.join(raw), 2)
}

function hashOutputs(vout, idx, opt) {
  const { sigflag } = opt
  const raw = []
  if (sigflag === 'ALL') {
    for (const { value, scriptPubkey } of vout) {
      raw.push(encodeValue(value))
      raw.push(encodeScript(scriptPubkey))
    }
    return sha256(Bytes.join(raw), 2)
  } else if (sigflag === 'SINGLE') {
    if (idx && idx < vout.length) {
      const { value, scriptPubkey } = vout[idx]
      raw.push(encodeValue(value))
      raw.push(encodeScript(scriptPubkey))
    }
    return sha256(Bytes.join(raw), 2)
  } else {
    return Bytes.from(0, 32)
  }
}

function encodeWordSize(size) {
  const MAX_SIZE = 0x208
  const OP_DATAPUSH1 = Bytes.from(0x4c, 1)
  const OP_DATAPUSH2 = Bytes.from(0x4d, 1)

  switch (true) {
    case (size <= 0x4b):
      return Bytes.from(size, 1)
    case (size > 0x4b < 0x100):
      return Bytes.join([OP_DATAPUSH1, Bytes.from(size, 1)])
    case (size >= 0x100 < MAX_SIZE):
      return Bytes.join([OP_DATAPUSH2, Bytes.from(size, 2)])
    default:
      throw new Error('Invalid word size:', size)
  }
}
