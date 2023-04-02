import { Buff, Stream } from '@cmdcode/buff-utils'

import {
  TxData,
  InputData,
  OutputData
} from '../../schema/types.js'

export function decodeTx (bytes : string | Uint8Array) : TxData {
  /** Decode a raw bitcoin transaction. */

  if (typeof bytes === 'string') {
    bytes = Buff.hex(bytes).raw
  }

  // Setup a byte-stream.
  const stream = new Stream(bytes)

  const version = readVersion(stream)

  // Check and enable any flags that are set.
  const hasWitness = checkWitnessFlag(stream)

  // Parse our inputs and outputs.
  const vin  = readInputs(stream)
  const vout = readOutputs(stream)

  // If witness flag is set, parse witness data.
  if (hasWitness) {
    for (const txin of vin) {
      txin.witness = readWitness(stream)
    }
  }

  // Parse locktime.
  const locktime = readLocktime(stream)

  // Return transaction object with calculated fields.
  return { version, vin, vout, locktime }
}

function readVersion (stream : Stream) : number {
  return stream.read(4).reverse().toNum()
}

function checkWitnessFlag (stream : Stream) : boolean {
  const [ marker, flag ] : number[] = [ ...stream.peek(2) ]
  if (marker === 0) {
    stream.read(2)
    if (flag === 1) {
      return true
    } else {
      throw new Error(`Invalid witness flag: ${flag}`)
    }
  }
  return false
}

function readInputs (stream : Stream) : InputData[] {
  const inputs = []
  const vinCount = stream.readSize()
  for (let i = 0; i < vinCount; i++) {
    inputs.push(readInput(stream))
  }
  return inputs
}

function readInput (stream : Stream) : InputData {
  return {
    txid      : stream.read(32).reverse().toHex(),
    vout      : stream.read(4).reverse().toNum(),
    scriptSig : readScript(stream, true),
    sequence  : stream.read(4).reverse().toHex()
  }
}

function readOutputs (stream : Stream) : OutputData[] {
  const outputs  = []
  const outcount = stream.readSize()
  for (let i = 0; i < outcount; i++) {
    outputs.push(readOutput(stream))
  }
  return outputs
}

function readOutput (stream : Stream) : OutputData {
  return {
    value        : stream.read(8).reverse().big,
    scriptPubKey : readScript(stream, true)
  }
}

function readWitness (stream : Stream) : string[] {
  const stack = []
  const count = stream.readSize()
  for (let i = 0; i < count; i++) {
    const word = readData(stream, true)
    stack.push(word)
  }
  return stack
}

function readData (
  stream  : Stream,
  varint ?: boolean
) : string {
  const size = (varint === true)
    ? stream.readSize('be')
    : stream.size
  return size > 0
    ? stream.read(size).hex
    : Buff.num(0).hex
}

function readScript (
  stream  : Stream,
  varint ?: boolean
) : string | string[] {
  const data = readData(stream, varint)
  return (data !== '00') ? data : []
}

function readLocktime (stream : Stream) : number {
  return stream.read(4).reverse().toNum()
}
