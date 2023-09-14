import { Buff } from '@cmdcode/buff'

export type RedeemEnum = 'p2pkh'   | 'p2sh'   | 'p2w-p2pkh' | 'p2w-p2sh' |
                         'p2w-pkh' | 'p2w-sh' | 'p2tr'      | 'raw'

export type ScriptEnum = 'p2pkh' | 'p2sh' | 'p2w-pkh' | 'p2w-sh' | 'p2tr'

export type ScriptMeta = ScriptRaw | ScriptTyped

export interface ScriptTyped {
  type : ScriptEnum
  key  : Buff
  hex  : string
  asm  : ScriptWord[]
}

export interface ScriptRaw {
  type : 'raw'
  hex  : string
  asm  : ScriptWord[]
  key ?: Buff
}

export type ScriptData = ScriptWord | ScriptWord[]
export type ScriptWord = string | number | Uint8Array
