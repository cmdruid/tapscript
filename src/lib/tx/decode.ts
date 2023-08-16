import { Buff, Stream } from '@cmdcode/buff-utils'

import {
  TxBytes,
  TxData,
  InputData,
  OutputData
} from '../../schema/index.js'

export function decode_tx (
  bytes : TxBytes
) : TxData {
  /** Decode a raw bitcoin transaction. */

  if (typeof bytes === 'string') {
    bytes = Buff.hex(bytes).raw
  }

  // Setup a byte-stream.
  const stream = new Stream(bytes)

  const version = read_version(stream)

  // Check and enable any flags that are set.
  const has_witness = check_witness_flag(stream)

  // Parse our inputs and outputs.
  const vin  = read_inputs(stream)
  const vout = read_outputs(stream)

  // If witness flag is set, parse witness data.
  if (has_witness) {
    for (const txin of vin) {
      txin.witness = read_witness(stream)
    }
  }

  // Parse locktime.
  const locktime = read_locktime(stream)

  // Return transaction object with calculated fields.
  return { version, vin, vout, locktime }
}

function read_version (stream : Stream) : number {
  return stream.read(4).reverse().toNum()
}

function check_witness_flag (stream : Stream) : boolean {
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

function read_inputs (stream : Stream) : InputData[] {
  const inputs = []
  const vinCount = stream.readSize()
  for (let i = 0; i < vinCount; i++) {
    inputs.push(read_input(stream))
  }
  return inputs
}

function read_input (stream : Stream) : InputData {
  return {
    txid      : stream.read(32).reverse().toHex(),
    vout      : stream.read(4).reverse().toNum(),
    scriptSig : read_script(stream, true),
    sequence  : stream.read(4).reverse().toHex(),
    witness   : []
  }
}

function read_outputs (stream : Stream) : OutputData[] {
  const outputs  = []
  const outcount = stream.readSize()
  for (let i = 0; i < outcount; i++) {
    outputs.push(read_output(stream))
  }
  return outputs
}

function read_output (stream : Stream) : OutputData {
  return {
    value        : stream.read(8).reverse().big,
    scriptPubKey : read_script(stream, true)
  }
}

function read_witness (stream : Stream) : string[] {
  const stack = []
  const count = stream.readSize()
  for (let i = 0; i < count; i++) {
    const word = read_data(stream, true)
    stack.push(word ?? '')
  }
  return stack
}

function read_data (
  stream  : Stream,
  varint ?: boolean
) : string | null {
  const size = (varint === true)
    ? stream.readSize('le')
    : stream.size
  return size > 0
    ? stream.read(size).hex
    : null
}

function read_script (
  stream  : Stream,
  varint ?: boolean
) : string | string[] {
  const data = read_data(stream, varint)
  return (data !== null) ? data : []
}

function read_locktime (stream : Stream) : number {
  return stream.read(4).reverse().toNum()
}
