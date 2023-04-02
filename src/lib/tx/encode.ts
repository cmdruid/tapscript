import { Buff }         from '@cmdcode/buff-utils'
import { encodeScript } from '../script/encode.js'

import {
  TxData,
  InputData,
  OutputData,
  SequenceData,
  ScriptData
} from '../../schema/types.js'

export function encodeTx (
  txdata       : TxData,
  omitWitness ?: boolean
) : Buff {
  /** Convert a JSON-based Bitcoin transaction
   * into hex-encoded bytes.
   * */
  const { version, vin, vout, locktime } = txdata

  const useWitness = (omitWitness !== true && checkForWitness(vin))

  const raw = [ encodeVersion(version) ]

  if (useWitness) {
    raw.push(Buff.hex('0001'))
  }

  raw.push(encodeInputs(vin))
  raw.push(encodeOutputs(vout))

  for (const txin of vin) {
    if (useWitness) {
      raw.push(encodeWitness(txin.witness))
    }
  }

  raw.push(encodeLocktime(locktime))

  return Buff.join(raw)
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
  const raw : Uint8Array[] = [ Buff.varInt(arr.length) ]
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
  const raw : Uint8Array[] = [ Buff.varInt(arr.length) ]
  for (const vout of arr) {
    raw.push(encodeOutput(vout))
  }
  return Buff.join(raw)
}

function encodeOutput (
  vout : OutputData
) : Uint8Array {
  const { value, scriptPubKey } = vout
  const raw : Uint8Array[] = []
  raw.push(encodeValue(value))
  raw.push(encodeScript(scriptPubKey))
  return Buff.join(raw)
}

function encodeWitness (
  data : ScriptData[] = []
) : Uint8Array {
  const buffer : Uint8Array[] = []
  if (Array.isArray(data)) {
    buffer.push(Buff.varInt(data.length))
    for (const entry of data) {
      buffer.push(encodeScript(entry))
    }
    return Buff.join(buffer)
  } else { return Buff.normalize(data) }
}

export function encodeLocktime (num : number) : Uint8Array {
  return Buff.num(num, 4).reverse()
}
