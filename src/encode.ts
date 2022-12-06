import { Buff } from '@cmdcode/buff-utils'
import { encodeWords } from './words.js'
import * as Type from './types.js'

export default function encodeTx(
  tx : Type.Data,
  omitWitness? : boolean
) : Uint8Array {
  /** Convert a JSON-based Bitcoin transaction
   * into hex-encoded bytes.
   * */
  const { version, vin, vout, locktime } = tx

  const useWitness = (omitWitness !== true && checkForWitness(vin))

  const raw = [ encodeVersion(version) ]

  if (useWitness) {
    raw.push(Buff.hex('0001'))
  }

  raw.push(encodeInputs(vin))
  raw.push(encodeOutputs(vout))

  for (const input of vin) {
    if (useWitness && input?.witness !== undefined) {
      raw.push(encodeTxWitness(input.witness))
    }
  }

  raw.push(encodeLocktime(locktime))

  return Buff.from(Buff.join(raw))
}

// export function encodeBaseTx(obj : Transaction) : string {
//   return encodeTx(obj, { omitWitness: true, omitMeta: true })
// }

function checkForWitness(vin : Type.InData[]) : boolean {
  /** Check if any witness data is present. */
  for (const txin of vin) {
    if (txin?.witness !== undefined) return true
  }
  return false
}

export function encodeVersion(num : number) : Uint8Array {
  return Buff.num(num, 4).reverse()
}

export function encodeTxid(txid : string) : Uint8Array {
  return Buff.hex(txid, 32).reverse()
}

export function encodePrevOut(vout : number) : Uint8Array {
  return Buff.num(vout, 4).reverse()
}

export function encodeSequence(seq : Type.SeqData) : Uint8Array {
  const sequence = (typeof seq === 'string')
    ? Buff.hex(seq, 4)
    : Buff.num(seq, 4) ?? Buff.num(0xFFFFFFFF, 4)
  return sequence.reverse()
}

export function encodeScript(
  script : Type.ScriptData,
  omitSize? : boolean
) : Uint8Array {
  let buffer = (Array.isArray(script))
    ? Buff.buff(encodeWords(script))
    : Buff.hex(script)

  if (omitSize !== true) {
    buffer = buffer.addVarint()
  }

  return buffer.toBytes()
}

function encodeInputs(arr : Type.InData[]) : Uint8Array {
  const raw : Uint8Array[] = [ Buff.getVarint(arr.length) ]
  for (const vin of arr) {
    const { prevTxid, prevOut, scriptSig, sequence } = vin
    raw.push(encodeTxid(prevTxid))
    raw.push(encodePrevOut(prevOut))
    raw.push(encodeScript(scriptSig))
    raw.push(encodeSequence(sequence))
  }
  return Buff.join(raw)
}

export function encodeValue(value : number) : Uint8Array {
  return Buff.num(value, 8).reverse()
}

function encodeOutputs(arr : Type.OutData[]) : Uint8Array {
  const raw : Uint8Array[] = [ Buff.getVarint(arr.length) ]
  for (const vout of arr) {
    const { value, scriptPubKey } = vout
    raw.push(encodeValue(value))
    raw.push(encodeScript(scriptPubKey))
  }
  return Buff.join(raw)
}

function encodeTxWitness(
  data : Type.WitnessData
) : Uint8Array {
  const words = [Buff.getVarint(data.length)]
  for (const word of data) {
    words.push(Buff.hex(word).addVarint())
  }
  return Buff.join(words)
}

export function encodeLocktime(num : number) : Uint8Array {
  return Buff.num(num, 4).reverse()
}
