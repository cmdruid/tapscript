import { Buff }          from '@cmdcode/buff'
import { encode_script } from '../script/encode.js'
import { is_empty }      from '../util.js'

import {
  ScriptData,
  TxInput,
  TxOutput,
  TxData
} from '../../types/index.js'

export function encode_tx (
  txdata : TxData,
  enable_segwit = true
) : Buff {
  /* Convert a JSON-based Bitcoin transaction
   * into hex-encoded bytes.
   * */
  const { version, vin, vout, locktime } = txdata

  const useWitness = (enable_segwit === true && check_witness(vin))

  const raw = [ encode_version(version) ]

  if (useWitness) {
    raw.push(Buff.hex('0001'))
  }

  raw.push(encode_inputs(vin))
  raw.push(encode_outputs(vout))

  for (const txin of vin) {
    if (useWitness) {
      raw.push(encode_witness(txin.witness))
    }
  }

  raw.push(encode_locktime(locktime))

  return Buff.join(raw)
}

function check_witness (vin : TxInput[]) : boolean {
  /** Check if any witness data is present. */
  for (const txin of vin) {
    if (!is_empty(txin.witness)) return true
  }
  return false
}

function encode_version (num : number) : Buff {
  return Buff.num(num, 4).reverse()
}

function encode_txid (txid : string) : Buff {
  return Buff.hex(txid, 32).reverse()
}

function encode_idx (vout : number) : Buff {
  return Buff.num(vout, 4).reverse()
}

function encode_sequence (
  sequence : number | string
) : Buff {
  return (typeof sequence === 'string')
    ? Buff.hex(sequence, 4)
    : Buff.num(sequence, 4).reverse()
}

function encode_inputs (arr : TxInput[]) : Buff {
  const raw : Buff[] = [ Buff.calc_varint(arr.length, 'le') ]
  for (const vin of arr) raw.push(encode_vin(vin))
  return Buff.join(raw)
}

function encode_vin (vin : TxInput) : Buff {
  const { txid, vout, scriptSig, sequence } = vin
  return Buff.join([
    encode_txid(txid),
    encode_idx(vout),
    encode_script(scriptSig, true),
    encode_sequence(sequence)
  ])
}

function encode_value (
  value : bigint
) : Buff {
  return Buff.big(value, 8).reverse()
}

function encode_outputs (arr : TxOutput[]) : Buff {
  const raw : Buff[] = [ Buff.calc_varint(arr.length, 'le') ]
  for (const vout of arr) raw.push(encode_vout(vout))
  return Buff.join(raw)
}

function encode_vout (
  vout : TxOutput
) : Buff {
  const { value, scriptPubKey } = vout
  const raw : Uint8Array[] = []
  raw.push(encode_value(value))
  raw.push(encode_script(scriptPubKey, true))
  return Buff.join(raw)
}

function encode_witness (
  data : ScriptData[] = []
) : Buff {
  const buffer : Buff[] = []
  if (Array.isArray(data)) {
    const count = Buff.calc_varint(data.length)
    buffer.push(count)
    for (const entry of data) {
      buffer.push(encode_data(entry))
    }
    return Buff.join(buffer)
  } else { return Buff.bytes(data) }
}

function encode_data (data : ScriptData) : Buff {
  return (!is_empty(data))
    ? encode_script(data, true)
    : new Buff(0)
}

function encode_locktime (locktime : number | string) : Buff {
  return (typeof locktime === 'string')
    ? Buff.hex(locktime, 4)
    : Buff.num(locktime, 4).reverse()
}

export default {
  encode_vin,
  encode_vout,
  encode_version,
  encode_idx,
  encode_txid,
  encode_sequence,
  encode_locktime,
  encode_value,
  encode_witness
}
