import { Buff } from '@cmdcode/buff-utils'
import EventEmitter from 'events'
import { ContractTemplate, Proposal, Modules } from '../schema/types.js'

import { modules }   from '../modules/index.js'
import { templates } from '../templates/index.js'
import { TxData }    from '../../schema/types.js'
import Transaction   from '../../class/Transaction/Transaction.js'

export class EscrowAgent extends EventEmitter {
  readonly id    : Uint8Array
  readonly _data : Proposal
  readonly _tx   : Transaction

  static readonly modules   : Modules = modules
  static readonly templates : ContractTemplate[] = templates

  constructor (
    pubkey   : string,
    proposal : Proposal,
    txdata   : TxData
  ) {
    super()
    this.id    = Buff.normalize(pubkey)
    this._tx   = new Transaction(txdata)
    this._data = proposal
  }

  // Check if all roles from the template are filled.
  // Check if there are extra roles provided.
  // Check if all modules in template are available.
}
