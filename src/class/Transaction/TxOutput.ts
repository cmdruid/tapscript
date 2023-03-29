import TxScript       from './TxScript.js'
import { OutputData } from '../../schema/types.js'
import { Address } from '../../lib/addr/index.js'

export default class TxOutput {
  value : bigint
  scriptPubKey : TxScript

  constructor (txout : OutputData) {
    const { address, value = 0, scriptPubKey = [] } = txout
    const script = (typeof address === 'string')
      ? Address.convert(address)
      : scriptPubKey
    this.value = BigInt(value)
    this.scriptPubKey = new TxScript(script)
  }
}
