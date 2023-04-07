import { Buff }       from '@cmdcode/buff-utils'
import { Noble }      from '@cmdcode/crypto-utils'
import { safeThrow }  from '../../utils.js'
import { Tx }         from '../../tx/index.js'
import { hashTx }     from './hash.js'
import { TxTemplate } from '../../../schema/types.js'
import { Script }     from '../../script/index.js'
import { HashConfig } from '../types.js'

export async function verifyTx (
  txdata : TxTemplate | string | Uint8Array,
  index  : number,
  config : HashConfig = {}
) : Promise<boolean> {
  const tx = Tx.fmt.toJson(txdata)
  const { throws = false } = config
  const { witness = [] }   = tx.vin[index]
  const witnessData = Tx.util.readWitness(witness)

  const { script, params } = witnessData

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
  } else if (
    params.length > 1 &&
    params[1].length === 33
  ) {
    pub = Buff.bytes(params[1])
  } else {
    return safeThrow('No pubkey provided!', throws)
  }

  const rawsig    = Script.fmt.toParam(params[0])
  const signature = rawsig.slice(0, -1)
  const sigflag   = rawsig.slice(-1)[0]

  const hash = hashTx(tx, index, { ...config, sigflag })

  // console.log('sign:', signature.hex)
  // console.log('flag:', Buff.num(sigflag).hex)
  // console.log('hash:', hash.hex)
  // console.log('pubk:', pub.hex)

  if (!Noble.verify(signature.hex, hash.hex, pub.hex)) {
    return safeThrow('Invalid signature!', throws)
  }

  return true
}
