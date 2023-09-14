import { Buff, Stream }   from '@cmdcode/buff'
import { hash_tx }        from './hash.js'
import { fail }           from '../../util.js'
import { parse_tx }       from '../../tx/index.js'
import { parse_script }   from '../../script/parse.js'
import { verify_cblock }  from '../../tap/key.js'
import { encode_tapleaf } from '../../tap/encode.js'

import * as Tx     from '../../tx/index.js'
import * as util   from '../utils.js'

import {
  SignOptions,
  signer
} from '@cmdcode/crypto-tools'

import {
  TxBytes,
  TxData,
  SigHashOptions
} from '../../../types/index.js'

export function verify_tx (
  txdata   : TxBytes | TxData,
  config   : SigHashOptions = {},
  options ?: SignOptions
) : boolean {
  const { throws = false } = config
  const tx = parse_tx(txdata)
  // Parse the input we are signing from the config.
  const txinput = util.parse_txinput(tx, config)
  const { prevout, witness = [] } = txinput
  const witnessData = Tx.parse_witness(witness)
  const { cblock, script, params } = witnessData

  let pub : Buff

  if (params.length < 1) {
    return fail('Invalid witness data: ' + String(witness), throws)
  }

  const { scriptPubKey } = prevout ?? {}

  if (scriptPubKey === undefined) {
    return fail('Prevout scriptPubKey is empty!', throws)
  }

  const { type, key: tapkey } = parse_script(scriptPubKey)

  if (
    type   !== 'p2tr'    ||
    tapkey === undefined ||
    tapkey.length !== 32
  ) {
    return fail('Prevout script is not a valid taproot output: ' + String(scriptPubKey), throws)
  }

  if (
    cblock !== null &&
    script !== null
  ) {
    const version = cblock[0] & 0xfe
    const target  = encode_tapleaf(script, version)
    if (config.extension === undefined) {
      config.extension = target
    }
    if (!verify_cblock(tapkey, target, cblock)) {
      return fail('cblock verification failed!', throws)
    }
  }

  if (config.pubkey !== undefined) {
    pub = Buff.bytes(config.pubkey)
  } else if (params.length > 1 && params[1].length === 32) {
    pub = Buff.bytes(params[1])
  } else {
    pub = Buff.bytes(tapkey)
  }

  const rawsig    = params[0]
  const stream    = new Stream(rawsig)
  const signature = stream.read(64).raw

  if (stream.size === 1) {
    config.sigflag = stream.read(1).num
    if (config.sigflag === 0x00) {
      return fail('0x00 is not a valid appended sigflag!', throws)
    }
  }

  const hash = hash_tx(tx, config)

  return signer.verify_sig(signature, hash, pub, options)
}
