import { Bytes } from '@cmdcode/buff-utils'
import { hash }  from '@cmdcode/crypto-utils'

import * as Script from '../script/index.js'

import { ScriptData } from '../../types/index.js'

const DEFAULT_VERSION = 0xc0

export function encode_leaf (
  data : Bytes,
  version = DEFAULT_VERSION
) : string {
  return hash.digest('TapLeaf', encode_version(version), data).hex
}

export function encode_script (
  script   : ScriptData,
  version ?: number
) : string {
  const bytes = Script.to_bytes(script)
  return encode_leaf(bytes, version)
}

export function encode_branch (
  leaf_a : string,
  leaf_b : string
) : string {
  // Compare leaves in lexical order.
  if (leaf_b < leaf_a) {
    // Swap leaves if needed.
    [ leaf_a, leaf_b ] = [ leaf_b, leaf_a ]
  }
  // Return digest of leaves as a branch hash.
  return hash.digest('TapBranch', leaf_a, leaf_b).hex
}

export function encode_version (version = 0xc0) : number {
  return version & 0xfe
}

export default {
  branch  : encode_branch,
  leaf    : encode_leaf,
  script  : encode_script,
  version : encode_version
}
