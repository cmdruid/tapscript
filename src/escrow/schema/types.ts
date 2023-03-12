import { Contract } from '../class/Contract.js'

export type ModuleFactory = new (id : string, contract : Contract) => Module
export type Modules = Record<string, ModuleFactory>

export interface Proposal {
  deposits  : DepositData[]
  fees      : FeeData[]
  members   : MemberData[]
  contracts : ContractData[]
}

export interface ContractData {
  tmpid : string
  value : number
  roles : [ { pub : string, role  : string } ]
  terms : [ { key : string, value : any    } ]
  state : Record<string, any>
}

export interface DepositData {
  value : number
  payer : string
  note  : string
}

export interface FeeData {
  value : number
  rate  : number
  payee : string
}

export interface ContractTemplate {
  id      : string
  check   : string
  label   : string
  desc    : string
  agents  : string[]
  paths   : Array<{ id : string, script : string[] }>
  methods : MethodData[]
  terms   : Array<Array<string | number>>
}

export interface MemberData {
  pubkey : string
  nick   : string
}

export interface MethodData {
  id     : string
  module : string
  agents : string[]
  params : any[]
}

export interface Module {
  id       : string
  register : () => Promise<void>
  compile  : () => Promise<string[]>
}
