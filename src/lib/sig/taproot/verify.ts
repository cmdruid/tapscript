import { Buff, Stream }  from '@cmdcode/buff-utils'
import { checkPath }     from '../../tap/key.js'
import { verify }        from './sign.js'
import { safeThrow }     from '../../utils.js'
import { getTapLeaf }    from '../../tap/tree.js'
import { Tx }            from '../../tx/index.js'
import { hashTx }        from './hash.js'
import { TxTemplate }    from '../../../schema/types.js'
import { Script }        from '../../script/index.js'
import { HashConfig }    from '../types.js'

export async function verifyTx (
  txdata  : TxTemplate | string | Uint8Array,
  index   : number,
  config  : HashConfig = {}
) : Promise<boolean> {
  const tx = Tx.fmt.toJson(txdata)
  const { throws = false } = config
  const { prevout, witness = [] } = tx.vin[index]
  const witnessData = Tx.util.readWitness(witness)
  const { cblock, script, params } = witnessData

  let pub : Buff

  if (params.length < 1) {
    return safeThrow('Invalid witness data: ' + String(witness), throws)
  }

  const { scriptPubKey } = prevout ?? {}

  if (scriptPubKey === undefined) {
    return safeThrow('Prevout scriptPubKey is empty!', throws)
  }

  const { type, data: tapkey } = Tx.util.readScriptPubKey(scriptPubKey)

  if (type !== 'p2tr') {
    return safeThrow('Prevout script is not a valid taproot output:' + tapkey.hex, throws)
  }

  if (tapkey.length !== 32) {
    return safeThrow('Invalid tapkey length: ' + String(tapkey.length), throws)
  }

  if (
    cblock !== null &&
    script !== null
  ) {
    const version    = cblock[0] & 0xfe
    const target     = getTapLeaf(script, version)
    config.extension = target

    if (!checkPath(tapkey, target, cblock, { throws })) {
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

  const rawsig    = Script.fmt.toParam(params[0])
  const stream    = new Stream(rawsig)
  const signature = stream.read(64).raw

  if (stream.size === 1) {
    config.sigflag = stream.read(1).num
    if (config.sigflag === 0x00) {
      return safeThrow('0x00 is not a valid appended sigflag!', throws)
    }
  }

  const hash = hashTx(tx, index, config)

  if (!verify(signature, hash, pub, throws)) {
    return safeThrow('Invalid signature!', throws)
  }

  return true
}
