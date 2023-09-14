import { Bytes }      from '@cmdcode/buff'
import { hash340 }    from '@cmdcode/crypto-tools/hash'
import { buffer_asm } from '../script/parse.js'

import { ScriptData } from '../../types/index.js'

const DEFAULT_VERSION = 0xc0

export function encode_tapleaf (
  data : Bytes,
  version = DEFAULT_VERSION
) : string {
  return hash340(
    'TapLeaf',
    encode_leaf_version(version),
    data
  ).hex
}

export function encode_tapscript (
  script   : ScriptData,
  version ?: number
) : string {
  const bytes = buffer_asm(script)
  return encode_tapleaf(bytes, version)
}

export function encode_tapbranch (
  leaf_a : string,
  leaf_b : string
) : string {
  // Compare leaves in lexical order.
  if (leaf_b < leaf_a) {
    // Swap leaves if needed.
    [ leaf_a, leaf_b ] = [ leaf_b, leaf_a ]
  }
  // Return digest of leaves as a branch hash.
  return hash340('TapBranch', leaf_a, leaf_b).hex
}

export function encode_leaf_version (version = 0xc0) : number {
  return version & 0xfe
}

export default {
  branch  : encode_tapbranch,
  leaf    : encode_tapleaf,
  script  : encode_tapscript,
  version : encode_leaf_version
}
