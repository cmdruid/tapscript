import { Buff }  from '@cmdcode/buff'
import { Point } from '@cmdcode/crypto-tools'

export const DEFAULT_VERSION = 0xc0
export const SCRIPT_PUBKEY   = get_script_only_pub()

function get_script_only_pub () : string {
  // Generated as specified in BIP0341:
  // https://github.com/bitcoin/bips/blob/master/bip-0341.mediawiki
  const G = Buff.hex('0479be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8')
  return Point.from_x(G.digest).x.hex
}
