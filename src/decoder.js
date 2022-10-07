import { Stream } from './bytes.js'
import { bytesToJSON } from './convert.js'

import {
  getScriptSigMeta,
  getScriptPubMeta,
  getWitScriptMeta
} from './script.js'

export function decodeTx (raw, opt = {}) {
  /** Decode a raw bitcoin transaction.
   * */

  // Setup a byte-stream.
  const stream = new Stream(raw)

  // Initiate our object with the version number.
  const tx = { version: readVersion(stream) }

  // Check and enable any flags that are set.
  checkFlags(stream, opt)

  // Parse our inputs and outputs.
  tx.vin = readInputs(stream)
  tx.vout = readOutputs(stream)

  // If witness flag is set, parse witness data.
  if (opt?.hasWitness) {
    for (const vin of tx.vin) {
      const witness = readWitness(stream)
      vin.txWitness = witness
      vin.meta = getWitScriptMeta(witness, vin.meta)
    }
  }

  // Parse locktime.
  tx.locktime = readLocktime(stream)

  // If meta flag is set, parse metadata.
  if (opt.hasMeta) tx.meta = readMetaData(stream)

  // Return transaction object.
  return tx
}

function readVersion (stream) {
  return stream.read(4, { format: 'number' })
}

function checkFlags (stream, opt) {
  const [marker, flag] = stream.peek(2)
  if (marker === 0) {
    stream.read(2)
    if (flag === 2) {
      opt.hasMeta = true
    }
    if (flag > 0) {
      opt.hasWitness = true
    } else {
      throw new Error(`Invalid flag: ${flag}`)
    }
  }
}

function readInputs (stream, opt) {
  const inputs = []
  const vinCount = stream.readVarint()
  for (let i = 0; i < vinCount; i++) {
    inputs.push(readInput(stream, opt))
  }
  return inputs
}

function readInput (stream) {
  const txin = {
    prevTxid: stream.read(32, { format: 'hex', reverse: true }),
    prevOut: stream.read(4, { format: 'number' }),
    scriptSig: readData(stream, { format: 'hex' }),
    sequence: stream.read(4, { format: 'number' })
  }

  txin.meta = getScriptSigMeta(txin.scriptSig)

  return txin
}

function readOutputs (stream) {
  const outputs = []
  const voutCount = stream.readVarint()
  for (let i = 0; i < voutCount; i++) {
    outputs.push(readOutput(stream))
  }
  return outputs
}

function readOutput (stream) {
  const txout = {
    value: stream.read(8, { format: 'number' }),
    scriptPubkey: readData(stream, { format: 'hex' })
  }

  txout.meta = getScriptPubMeta(txout.scriptPubkey)

  return txout
}

function readWitness (stream) {
  const stack = []
  const count = stream.readVarint()
  for (let i = 0; i < count; i++) {
    const word = readData(stream, { format: 'hex' })
    stack.push(word)
  }
  return stack
}

function readData (stream, opt = {}) {
  const { varint = true } = opt

  const size = (varint)
    ? stream.readVarint()
    : stream.length

  return (size)
    ? stream.read(size, opt)
    : 0
}

function readLocktime (stream) {
  return stream.read(4, { format: 'number' })
}

function readMetaData (stream) {
  const size = stream.readVarint()
  const bytes = stream.read(size)
  return bytesToJSON(bytes)
}
