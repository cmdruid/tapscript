import { Bytes } from './bytes.js'
import { sha256 } from './crypto.js'
import { JSONtoBytes } from './convert.js'
import { isString, isNumber } from './validate.js'
import { getSigCode } from './codes.js'
import { convertCode } from './script.js'

export function encodeTx(obj, opt = {}) {
  /** Convert a JSON-based Bitcoin transaction 
   * into hex-encoded bytes. 
   * */
  const { version, vin, vout, locktime, meta } = obj

  const hasWitness = checkForWitness(vin)

  const raw = [ encodeVersion(version) ]

  if (meta) {
    raw.push(Bytes.from('0002', 2))
  } 
  else if (checkForWitness(vin)) {
    raw.push(Bytes.from('0001', 2))
  }

  raw.push(encodeInputs(vin))
  raw.push(encodeOutputs(vout))

  for (let input of vin) {
    if (hasWitness && input?.txWitness) {
      raw.push(encodeWitness(input.txWitness))
    }
  }

  raw.push(encodeLocktime(locktime))

  if (meta) raw.push(encodeMeta(meta))

  return Bytes.to(Bytes.join(raw), 'hex')
}

function checkForWitness(vin) {
  /** Check if any witness data is present. */
  for (let txin of vin) {
    if (txin?.txWitness) return true
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
  return Bytes.from(seq, 4)
}

function encodeInputs(arr) {
  const raw = [ Bytes.varInt(arr.length) ]
  for (let vin of arr) {
    const { txid, vout, scriptSig, sequence } = vin
    raw.push(encodeTxid(txid))
    raw.push(encodePrevOut(vout))
    raw.push(encodeScript(scriptSig))
    raw.push(encodeSequence(sequence))
  }
  return Bytes.join(raw)
}

function encodeValue(value) {
  return Bytes.from(value, 8)
}

function encodeOutputs(arr) {
  const raw = [ Bytes.varInt(arr.length) ]
  for (let vout of arr) {
    const { value, scriptPubkey } = vout
    raw.push(encodeValue(value))
    raw.push(encodeScript(scriptPubkey))
  }
  return Bytes.join(raw)
}

function encodeWitness(data) {
  if (Array.isArray(data)) {
    const words = [ Bytes.varInt(data.length) ]
    for (let word of data) {
      words.push(Bytes.from(word, false, { varint: true }))
    }
    return Bytes.join(words)
  }
  if (isString(data)) {
    return Bytes.from(data)
  }
  throw new Error('Invalid data type:', typeof(data))
}

function encodeLocktime(num) {
  return Bytes.from(num, 4)
}

function encodeMeta(meta) {
  const bytes = JSONtoBytes(meta)
  const size  = Bytes.varInt(bytes.length)
  return Bytes.join([size, bytes])
}

export function encodeScript(script, opt={}) {
  const { varint=true } = opt

  let bytes

  if (Array.isArray(script)) {
    bytes = encodeScriptArray(script)
  }
  else if (isString(script)) {
    bytes = Bytes.from(script)
  }
  else {
    throw new Error('Invalid script format:', typeof(script))
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
    }
    else {
      const bytes = Bytes.from(word)
      words.push(encodeWordSize(bytes.length))
      words.push(bytes)
    }
  }
  return Bytes.join(words)
}

export async function getSigHash(tx, idx, value, script, opt={}) {
  const { version, vin, vout, locktime } = tx
  
  opt.sigflag = opt.sigflag || 'ALL'
  opt.anypay  = opt.anypay  || false

  const raw = [ encodeVersion(version) ]

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
    .then(bytes => Bytes.to(bytes, 'hex'))
}

function hashPrevouts(vin, opt) {
  const { anypay } = opt
  if (anypay) {
    return Bytes.from(0, 32)
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
    return Bytes.from(0, 32)
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

  switch(true) {
    case (size <= 0x4b):
      return Bytes.from(size, 1)
    case (0x4b < size < 0x100):
      return Bytes.join([OP_DATAPUSH1, Bytes.from(size, 1)])
    case (0x100 <= size < MAX_SIZE):
      return Bytes.join([OP_DATAPUSH2, Bytes.from(size, 2)])
    default:
      throw new Error('Invalid word size:', size)
  }
}
