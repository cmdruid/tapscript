import Transaction     from '../../class/Transaction/Transaction.js'
import { EscrowAgent } from '../class/Agent.js'
import { Contract }    from '../class/Contract.js'

export default class LockModule {
  readonly _data : Contract
  readonly id    : string

  constructor (
    id       : string,
    contract : Contract
  ) {
    this.id    = id
    this._data = contract
  }

  get contract () : Contract {
    return this._data
  }

  get agent () : EscrowAgent {
    return this.contract._agent
  }

  get tx () : Transaction {
    return this.contract._agent._tx
  }

  async register () : Promise<void> {

  }

  async compile () : Promise<string[]> {
    return []
  }
}
