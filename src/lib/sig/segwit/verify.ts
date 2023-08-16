import { Buff }       from '@cmdcode/buff-utils'
import { noble }      from '@cmdcode/crypto-utils'
import { safeThrow }  from '../../utils.js'
import { hash_tx }    from './hash.js'

import {
  HashConfig,
  TxBytes,
  TxData
} from '../../../schema/index.js'

import * as Tx   from '../../tx/index.js'
import * as util from '../utils.js'

export function verify_tx (
  txdata : TxBytes | TxData,
  config : HashConfig = {}
) : boolean {
  const tx = Tx.to_json(txdata)
  const { throws = false } = config

  const txinput          = util.parse_txinput(tx, config)
  const { witness = [] } = txinput
  const witness_data     = Tx.parse_witness(witness)

  const { script, params } = witness_data

  let pub : Buff | null = null

  if (params.length < 1) {
    return safeThrow('Invalid witness data: ' + String(witness), throws)
  }

  if (
    config.script === undefined &&
    script !== null
  ) {
    config.script = script
  }

  if (config.pubkey !== undefined) {
    pub = Buff.bytes(config.pubkey)
  } else if (params.length > 1) {
    const bytes = Buff.bytes(params[1])
    if (bytes.length === 33) pub = bytes
  }

  if (pub === null) {
    return safeThrow('No pubkey provided!', throws)
  }

  const rawsig    = Buff.bytes(params[0])
  const signature = rawsig.slice(0, -1)
  const sigflag   = rawsig.slice(-1)[0]

  const hash = hash_tx(tx, { ...config, sigflag })

  // console.log('sign:', signature.hex)
  // console.log('flag:', Buff.num(sigflag).hex)
  // console.log('hash:', hash.hex)
  // console.log('pubk:', pub.hex)

  if (!noble.secp.verify(signature, hash, pub)) {
    return safeThrow('Invalid signature!', throws)
  }

  return true
}
