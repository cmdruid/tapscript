import { Bytes } from '../../schema/types.js'

export interface HashConfig {
  extension     ?: Bytes    // Include a tapleaf hash with your signature hash.
  pubkey        ?: Bytes    // Verify using this pubkey instead of the tapkey.
  script        ?: Bytes    // Hash using this script (for segwit spends).
  sigflag       ?: number   // Set the signature type flag.
  separator_pos ?: number   // If using OP_CODESEPARATOR, specify the latest opcode position.
  extflag       ?: number   // Set the extention version flag (future use).
  key_version   ?: number   // Set the key version flag (future use).
  throws        ?: boolean  // Should throw an exception on failure.
}
