import { Bytes } from '@cmdcode/buff-utils'
import { hash }  from '@cmdcode/crypto-utils'

import * as Script from '../script/index.js'

import { ScriptData } from '../../schema/index.js'

const { digest } = hash

const DEFAULT_VERSION = 0xc0

export function encode_leaf (
  data : Bytes,
  version = DEFAULT_VERSION
) : string {
  return digest('TapLeaf', encode_version(version), data).hex
}

export function encode_script (
  script   : ScriptData,
  version ?: number
) : string {
  const bytes = Script.to_bytes(script)
  return encode_leaf(bytes, version)
}

export function encode_branch (
  leafA : string,
  leafB : string
) : string {
  // Compare leaves in lexical order.
  if (leafB < leafA) {
    // Swap leaves if needed.
    [ leafA, leafB ] = [ leafB, leafA ]
  }
  // Return digest of leaves as a branch hash.
  return digest('TapBranch', leafA, leafB).hex
}

export function encode_version (version = 0xc0) : number {
  return version & 0xfe
}
