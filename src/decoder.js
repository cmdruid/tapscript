import { Stream } from './bytes.js'
import { appendTxData } from './calc.js'

import {
  addScriptSigMeta,
  addScriptPubMeta,
  addWitScriptMeta
} from './script.js'

export function decodeTx(txhex, opt = {}) {
  /** Decode a raw bitcoin transaction.
   * */

  // Setup a byte-stream.
  const stream = new Stream(txhex)

  // Initiate our transaction object.
  const tx = {
    size: stream.size,
    bsize: stream.size,
    msize: 0
  }

  tx.version = readVersion(stream)

  // Check and enable any flags that are set.
  checkFlags(stream, opt)

  // Parse our inputs and outputs.
  tx.vin = readInputs(stream)
  tx.vout = readOutputs(stream)

  // If witness flag is set, parse witness data.
  if (opt?.hasWitness) {
    tx.bsize = tx.bsize - stream.size + 4
    for (const vin of tx.vin) {
      vin.witness = { data: readWitness(stream) }
      addWitScriptMeta(vin.witness)
    }
  }

  // Parse locktime.
  tx.locktime = readLocktime(stream)

  // If meta flag is set, parse metadata.
  if (opt.hasMeta) {
    tx.msize = stream.size
    tx.size = tx.size - stream.size
    txhex = txhex.replace('0002', '0001')
    txhex = txhex.slice(0, -(stream.size * 2))
    tx.meta = { data: readData(stream) }
  }

  // Return transaction object with calculated fields.
  return appendTxData(tx, txhex)
}

function readVersion(stream) {
  return stream.read(4, { format: 'number' })
}

function checkFlags(stream, opt) {
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

function readInputs(stream, opt) {
  const inputs = []
  const vinCount = stream.readVarint()
  for (let i = 0; i < vinCount; i++) {
    inputs.push(readInput(stream, opt))
  }
  return inputs
}

function readInput(stream) {
  const txin = {
    prevTxid: stream.read(32, { format: 'hex', reverse: true }),
    prevOut: stream.read(4, { format: 'number' }),
    scriptSig: { hex: readData(stream, { format: 'hex' }) },
    sequence: stream.read(4, { format: 'number' })
  }

  addScriptSigMeta(txin.scriptSig)

  return txin
}

function readOutputs(stream) {
  const outputs = []
  const voutCount = stream.readVarint()
  for (let i = 0; i < voutCount; i++) {
    outputs.push(readOutput(stream))
  }
  return outputs
}

function readOutput(stream) {
  const txout = {
    value: stream.read(8, { format: 'number' }),
    scriptPubkey: { hex: readData(stream, { format: 'hex' }) }
  }

  addScriptPubMeta(txout.scriptPubkey)

  return txout
}

function readWitness(stream) {
  const stack = []
  const count = stream.readVarint()
  for (let i = 0; i < count; i++) {
    const word = readData(stream, { format: 'hex' })
    stack.push(word)
  }
  return stack
}

function readData(stream, opt = {}) {
  const { varint = true } = opt

  const size = (varint)
    ? stream.readVarint()
    : stream.size

  return (size)
    ? stream.read(size, opt)
    : 0
}

function readLocktime(stream) {
  return stream.read(4, { format: 'number' })
}
