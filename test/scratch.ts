interface ScriptKey {
  hex  : string
  asm  : string[]
  len  : number
  key  : Bytes
  type : string // P2PK, P2PKH, P2
  addr : string
  net  : string
}

from_address ()            // Parse from address.
from_asm (network)         // Parse from asm code (string | string[]).
from_hex (network)         // Parse from hex code.
from_pubkey(network, type) // Create from pubkey.
from_script(script, type)  // Create from full script.

to_json (fmt ?: string)    // To 