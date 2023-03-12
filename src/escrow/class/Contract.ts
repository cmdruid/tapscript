import { EscrowAgent } from './Agent.js'

import { ContractData, ContractTemplate, Module } from '../schema/types.js'

export class Contract {
  readonly _agent  : EscrowAgent
  readonly _data   : ContractData
  readonly modules : Map<string, Module> = new Map()

  isInit : boolean = false

  constructor (
    agent : EscrowAgent,
    data  : ContractData
  ) {
    this._agent = agent
    this._data  = data
  }

  get agent () : EscrowAgent {
    return this._agent
  }

  get data () : ContractData {
    return this._data
  }

  get template () : ContractTemplate {
    const templates = EscrowAgent.templates
    const template  = templates.find(e => e.id === this._data.tmpid)
    if (template !== undefined) {
      return template
    } else { throw new Error('Contract template undefined!') }
  }

  get paths () : Map<string, string[]> {
    const paths = new Map()
    for (const { id, script } of this.template.paths) {
      paths.set(id, script)
    }
    return paths
  }

  async init () : Promise<void> {
    if (this.isInit) return

    for (const { script } of this.template.paths) {
      for (const code of script) {
        const Module = EscrowAgent.modules[code]
        if (Module !== undefined) {
          const process = new Module(code, this)
          await process.register()
          this.modules.set(code, process)
        }
      }
    }
    this.isInit = true
  }

  async compile (scriptId : string) : Promise<string[]> {
    if (!this.isInit) await this.init()

    const path   = this.paths.get(scriptId)
    const script = []

    if (path !== undefined) {
      for (const code of path) {
        const process = this.modules.get(code)
        if (process !== undefined) {
          script.push(...await process.compile())
        } else { throw new Error('Process does not exist!') }
      }
    } else { throw new Error('Script does not exist!') }
    return script
  }
}
