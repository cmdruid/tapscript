import { SecretKey } from '@cmdcode/crypto-utils'

export interface WalletConfig {
  disable_private_keys ?: boolean   // Disable the possibility of private keys (only watchonlys are possible in this mode).
  blank                ?: boolean   // Create a blank wallet. A blank wallet has no keys or HD seed. One can be set using sethdseed.
  passphrase           ?: string    // Encrypt the wallet with this passphrase.
  avoid_reuse          ?: boolean   // Keep track of coin reuse, and treat dirty and clean coins differently with privacy considerations in mind.
  descriptors          ?: boolean   // Create a native descriptor wallet. The wallet will use descriptors internally to handle address creation. Setting to "false" will create a legacy wallet; however, the legacy wallet type is being deprecated and support for creating and opening legacy wallets will be removed in the future.
  load_on_startup      ?: boolean   // Save wallet name to persistent settings and load on startup. True to add wallet to startup list, false to remove, null to leave unchanged.
  external_signer      ?: boolean   // Use an external signer such as a hardware wallet. Requires -signer to be configured. Wallet creation will fail if keys cannot be fetched. Requires disable_private_keys and descriptors set to true.
}

export interface WalletResponse {
  name    : string  // The wallet name if created successfully. If the wallet was created using a full path, the wallet_name will be the full path.
  warning : string  // Warning message if wallet was not loaded cleanly.
}

export interface UTXO {
  txid          : string
  vout          : number
  address       : string
  label         : string
  scriptPubKey  : string
  amount        : number
  confirmations : number
  spendable     : boolean
  solvable      : boolean
  desc          : string
  parent_descs  : string[]
  safe          : boolean
  signer       ?: SecretKey
}

export const WALLET_METHODS = [
  'listwallets',
  'listwalletdir',
  'loadwallet',
  'createwallet'
]
