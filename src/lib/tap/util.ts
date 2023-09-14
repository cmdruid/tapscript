import { Buff }            from '@cmdcode/buff'
import { TapConfig }       from '../../types/index.js'

import {
  encode_tapleaf,
  encode_tapscript
} from './encode.js'

export function config_tapleaf (
  config : TapConfig
) {
  const { data, script, tapleaf, version } = config

  let extension : string | undefined

  if (script !== undefined) {
    extension = encode_tapscript(script, version)
  }
  if (data !== undefined) {
    extension = encode_tapleaf(data, version)
  }
  if (tapleaf !== undefined) {
    extension = Buff.bytes(tapleaf).hex
  }
  return { data, extension, script }
}
