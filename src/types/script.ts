import { Buff } from '@cmdcode/buff-utils'

export type RedeemEnum = 'p2pkh'   | 'p2sh'   | 'p2w-p2pkh' | 'p2w-p2sh' |
                         'p2w-pkh' | 'p2w-sh' | 'p2tr'      | 'raw'

export type ScriptEnum = 'p2pkh' | 'p2sh' | 'p2w-pkh' | 'p2w-sh' | 'p2tr'

export type ScriptMeta = ScriptRaw | ScriptTyped

export interface ScriptTyped {
  type : ScriptEnum
  data : Buff
  hex  : string
  asm  : Word[]
}

export interface ScriptRaw {
  type  : 'raw'
  hex   : string
  asm   : Word[]
  data ?: Buff
}

export type ScriptData = Word   | Word[]
export type Word       = string | number | Uint8Array
