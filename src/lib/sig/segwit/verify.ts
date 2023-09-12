import { Buff }     from '@cmdcode/buff'
import { noble }    from '@cmdcode/crypto-tools'
import { fail }     from '../../util.js'
import { hash_tx }  from './hash.js'

import { parse_txinput } from '../utils.js'

import {
  parse_tx,
  parse_witness
} from '../../tx/index.js'

import {
  SigHashOptions,
  TxBytes,
  TxData
} from '../../../types/index.js'

export function verify_tx (
  txdata  : TxBytes | TxData,
  options : SigHashOptions = {}
) : boolean {
  const tx = parse_tx(txdata)
  const { throws = false } = options
  const txinput            = parse_txinput(tx, options)
  const { witness = [] }   = txinput
  const witness_data       = parse_witness(witness)

  let { pubkey, script } = options

  const { script: wit_script, params } = witness_data

  let pub : Buff | null = null

  if (params.length < 1) {
    return fail('Invalid witness data: ' + String(witness), throws)
  }

  if (script === undefined && wit_script !== null) {
    script = wit_script
  }

  if (pubkey !== undefined) {
    pub = Buff.bytes(pubkey)
  } else if (params.length > 1) {
    const bytes = Buff.bytes(params[1])
    if (bytes.length === 33) pub = bytes
  }

  if (pub === null) {
    return fail('No pubkey provided!', throws)
  }

  const rawsig    = Buff.bytes(params[0])
  const signature = rawsig.slice(0, -1)
  const sigflag   = rawsig.slice(-1)[0]

  const hash = hash_tx(tx, { ...options, sigflag })

  // console.log('sign:', signature.hex)
  // console.log('flag:', Buff.num(sigflag).hex)
  // console.log('hash:', hash.hex)
  // console.log('pubk:', pub.hex)

  if (!noble.secp.verify(signature, hash, pub)) {
    return fail('Invalid signature!', throws)
  }

  return true
}
