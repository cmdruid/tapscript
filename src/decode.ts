import { Buff, Stream } from '@cmdcode/buff-utils'
import * as Type from './types.js'

export default function decodeTx(bytes : string | Uint8Array) : Type.Data {
  /** Decode a raw bitcoin transaction. */

  if (typeof bytes === 'string') {
    bytes = Buff.hex(bytes).toBytes()
  }

  // Setup a byte-stream.
  const stream = new Stream(bytes)

  const version = readVersion(stream)

  // Check and enable any flags that are set.
  const hasWitness = hasWitnessFlag(stream)

  // Parse our inputs and outputs.
  const vin  = readInputs(stream)
  const vout = readOutputs(stream)

  // If witness flag is set, parse witness data.
  if (hasWitness) {
    for (const v of vin) {
      v.witness = readWitness(stream)
    }
  }

  // Parse locktime.
  const locktime = readLocktime(stream)

  // Return transaction object with calculated fields.
  return { version, vin, vout, locktime }
}

function readVersion(stream : Stream) : number {
  return stream.read(4).reverse().toNum()
}

function hasWitnessFlag(stream : Stream) : boolean {
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

function readInputs(stream : Stream) : Type.InData[] {
  const inputs = []
  const vinCount = stream.readVarint()
  for (let i = 0; i < vinCount; i++) {
    inputs.push(readInput(stream))
  }
  return inputs
}

function readInput(stream : Stream) : Type.InData {
  return {
    prevTxid  : stream.read(32).reverse().toHex(),
    prevOut   : stream.read(4).reverse().toNum(),
    scriptSig : readData(stream, true),
    sequence  : stream.read(4).reverse().toHex()
  }
}

function readOutputs(stream : Stream) : Type.OutData[] {
  const outputs = []
  const voutCount = stream.readVarint()
  for (let i = 0; i < voutCount; i++) {
    outputs.push(readOutput(stream))
  }
  return outputs
}

function readOutput(stream : Stream) : Type.OutData {
  return {
    value: stream.read(8).reverse().toNum(),
    scriptPubKey: readData(stream, true)
  }
}

function readWitness(stream : Stream) : string[] {
  const stack = []
  const count = stream.readVarint()
  for (let i = 0; i < count; i++) {
    const word = readData(stream, true)
    stack.push(word)
  }
  return stack
}

function readData(
  stream : Stream,
  hasVarint? : boolean
) : string {
  const size = (hasVarint === true)
    ? stream.readVarint()
    : stream.size

  return size > 0
    ? stream.read(size).toHex()
    : Buff.num(0).toHex()
}

function readLocktime(stream : Stream) : number {
  return stream.read(4).reverse().toNum()
}
