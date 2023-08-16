import { Buff, Stream } from '@cmdcode/buff-utils'
import { safeThrow }    from '../../utils.js'
import { hash_tx }      from './hash.js'

import * as Script from '../../script/index.js'
import * as Tap    from '../../tap/index.js'
import * as Tx     from '../../tx/index.js'
import * as util   from '../utils.js'

import {
  SignOptions,
  signer
} from '@cmdcode/crypto-utils'

import {
  TxBytes,
  TxData,
  HashConfig
} from '../../../schema/index.js'

export function verify_tx (
  txdata   : TxBytes | TxData,
  config   : HashConfig = {},
  options ?: SignOptions
) : boolean {
  const { throws = false } = config
  const tx = Tx.to_json(txdata)
  // Parse the input we are signing from the config.
  const txinput = util.parse_txinput(tx, config)
  const { prevout, witness = [] } = txinput
  const witnessData = Tx.parse_witness(witness)
  const { cblock, script, params } = witnessData

  let pub : Buff

  if (params.length < 1) {
    return safeThrow('Invalid witness data: ' + String(witness), throws)
  }

  const { scriptPubKey } = prevout ?? {}

  if (scriptPubKey === undefined) {
    return safeThrow('Prevout scriptPubKey is empty!', throws)
  }

  const { type, data: tapkey } = Script.parse_scriptkey(scriptPubKey)

  if (
    type   !== 'p2tr'    ||
    tapkey === undefined ||
    tapkey.length !== 32
  ) {
    return safeThrow('Prevout script is not a valid taproot output: ' + String(scriptPubKey), throws)
  }

  if (
    cblock !== null &&
    script !== null
  ) {
    const version    = cblock[0] & 0xfe
    const target     = Tap.encode_leaf(script, version)
    config.extension = target

    if (!Tap.key.check_proof(tapkey, target, cblock, { throws })) {
      return safeThrow('cblock verification failed!', throws)
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
      return safeThrow('0x00 is not a valid appended sigflag!', throws)
    }
  }

  const hash = hash_tx(tx, config)

  return signer.verify(signature, hash, pub, options)
}
