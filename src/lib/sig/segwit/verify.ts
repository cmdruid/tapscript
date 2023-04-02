import { Buff, Stream }  from '@cmdcode/buff-utils'
import { Noble }         from '@cmdcode/crypto-utils'
import { safeThrow }     from '../../utils.js'
import { Tx }            from '../../tx/index.js'
import { hashTx }        from './hash.js'
import { TxData }        from '../../../schema/types.js'
import { Script }        from '../../script/index.js'
import { HashConfig }    from '../types.js'

export async function verifyTx (
  txdata  : TxData | string | Uint8Array,
  index   : number,
  config  : HashConfig = {}
) : Promise<boolean> {
  const tx = Tx.fmt.toJson(txdata)
  const { throws = false } = config
  const { prevout, witness = [] } = tx.vin[index]
  const witnessData = Tx.parse.witness(witness)

  const { script, params } = witnessData

  let pub : Uint8Array | null = null

  if (params.length < 1) {
    return safeThrow('Invalid witness data: ' + String(witness), throws)
  }

  const { scriptPubKey } = prevout ?? {}

  if (scriptPubKey === undefined) {
    return safeThrow('Prevout scriptPubKey is empty!', throws)
  }

  const redeemScript = config.script ?? script
  const scriptHash   = Script.fmt.toParam(scriptPubKey).slice(2)

  console.log(redeemScript)
  console.log(scriptHash)

  // Put in verification check for pubkey hash and /or script hash.

  if (config.pubkey !== undefined) {
    pub = Buff.bytes(config.pubkey)
  } else if (
    params.length > 1 && (
      params[1].length === 32 ||
      params[1].length === 33
    )
  ) {
    pub = Buff.bytes(params[1])
  } else {
    return safeThrow('No pubkey provided!', throws)
  }

  const rawsig    = Script.fmt.toParam(params[0])
  const stream    = new Stream(rawsig)
  const signature = stream.read(64).raw

  if (stream.size === 1) {
    config.sigflag = stream.read(1).num
  }

  const hash = hashTx(tx, index, config)

  if (!Noble.verify(signature, hash, pub)) {
    return safeThrow('Invalid signature!', throws)
  }

  return true
}
