import { Buff } from '@cmdcode/buff-utils'
import { encodeScript } from '../script/encode.js'

import {
  TxData,
  InputData,
  OutputData,
  SequenceData,
  WitnessData,
  ScriptData
} from '../../schema/types.js'

const BECH32_PREFIX = [ 'bc', 'tb', 'bcrt' ]

export function encodeTx (
  txdata       : TxData,
  omitWitness ?: boolean
) : string {
  /** Convert a JSON-based Bitcoin transaction
   * into hex-encoded bytes.
   * */
  const { version, input, output, locktime } = txdata

  const useWitness = (omitWitness !== true && checkForWitness(input))

  const raw = [ encodeVersion(version) ]

  if (useWitness) {
    raw.push(Buff.hex('0001'))
  }

  raw.push(encodeInputs(input))
  raw.push(encodeOutputs(output))

  for (const vin of input) {
    if (useWitness && vin?.witness !== undefined) {
      raw.push(encodeWitness(vin.witness))
    }
  }

  raw.push(encodeLocktime(locktime))

  return Buff.join(raw).hex
}

function checkForWitness (vin : InputData[]) : boolean {
  /** Check if any witness data is present. */
  for (const txin of vin) {
    const { witness } = txin
    if (
      typeof witness === 'string'   ||
      witness instanceof Uint8Array ||
      (Array.isArray(witness) && witness.length > 0)
    ) {
      return true
    }
  }
  return false
}

export function encodeVersion (num : number) : Uint8Array {
  return Buff.num(num, 4).reverse()
}

export function encodeTxid (txid : string) : Uint8Array {
  return Buff.hex(txid, 32).reverse()
}

export function encodePrevOut (vout : number) : Uint8Array {
  return Buff.num(vout, 4).reverse()
}

export function encodeSequence (
  seq : SequenceData = 0xFFFFFFFF
) : Uint8Array {
  const sequence = (typeof seq === 'string')
    ? Buff.hex(seq, 4)
    : Buff.num(seq, 4)
  return sequence.reverse()
}

function encodeInputs (arr : InputData[]) : Uint8Array {
  const raw : Uint8Array[] = [ Buff.readSize(arr.length) ]
  for (const vin of arr) {
    const { txid, vout, scriptSig, sequence } = vin
    raw.push(encodeTxid(txid))
    raw.push(encodePrevOut(vout))
    raw.push(encodeScript(scriptSig))
    raw.push(encodeSequence(sequence))
  }
  return Buff.join(raw)
}

export function encodeValue (
  value : number | bigint
) : Uint8Array {
  if (typeof value === 'number') {
    value = BigInt(value)
  }
  return Buff.big(value, 8).reverse()
}

function encodeOutputs (arr : OutputData[]) : Uint8Array {
  const raw : Uint8Array[] = [ Buff.readSize(arr.length) ]
  for (const vout of arr) {
    const { address, value, scriptPubKey } = vout
    raw.push(encodeValue(value))
    if (typeof address === 'string') {
      const script = encodeAddress(address)
      raw.push(encodeScript(script))
    } else {
      raw.push(encodeScript(scriptPubKey))
    }
  }
  return Buff.join(raw)
}

function encodeWitness (
  data : WitnessData
) : Uint8Array {
  const buffer : Uint8Array[] = []
  if (Array.isArray(data)) {
    buffer.push(Buff.readSize(data.length))
    for (const entry of data) {
      buffer.push(encodeScript(entry))
    }
    return Buff.join(buffer)
  } else { return Buff.normalize(data) }
}

export function encodeLocktime (num : number) : Uint8Array {
  return Buff.num(num, 4).reverse()
}

export function encodeAddress (
  address : string
) : ScriptData {
  if (address.startsWith('1')) {
    const b58 = Buff.b58check(address)
    return [ 'OP_DUP', 'OP_HASH160', b58, 'OP_EQUALVERIFY', 'OP_CHECKSIG' ]
  }
  if (address.startsWith('3')) {
    const b58 = Buff.b58check(address)
    return [ 'OP_HASH160', b58, 'OP_EQUAL' ]
  }
  if (address.includes('1')) {
    const [ prefix, rest ] = address.split('1')
    if (!BECH32_PREFIX.includes(prefix)) {
      throw new Error('Invalid bech32 prefix!')
    }
    if (rest.startsWith('p')) {
      const raw = Buff.bech32m(address).prefixSize()
      return Buff.of(0x51, ...raw)
    }
    if (rest.startsWith('q')) {
      const raw = Buff.bech32(address, 0).prefixSize()
      return Buff.of(0x00, ...raw)
    }
  }
  throw new Error('Unable to parse address!')
}
