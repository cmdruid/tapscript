import { Bytes } from '@cmdcode/buff-utils'

import { TxInput, ScriptData } from './index.js'

export interface HashOptions {
  extension     ?: Bytes      // Include a tapleaf hash with your signature hash.
  extflag       ?: number     // Set the extention version flag (future use).
  txindex       ?: number     // Index value of the input you wish to sign for.
  key_version   ?: number     // Set the key version flag (future use).
  pubkey        ?: Bytes      // Verify using this pubkey instead of the tapkey.
  script        ?: ScriptData // Hash using this script (for segwit spends).
  separator_pos ?: number     // If using OP_CODESEPARATOR, specify the latest opcode position.
  sigflag       ?: number     // Set the signature type flag.
  throws        ?: boolean    // Should throw an exception on failure.
  txinput       ?: TxInput
}

export interface SignerAPI {
  sign : (msg : Bytes) => Bytes
}
