/** We need to make:
 *  - sha256(shared secret) ENCRYPTION KEY
 *  - hmac256(label, shared secret) HASH LOCK
 *  - sha256(r + hash) ENDORSEMENT (adaptor sig)
 */

export interface MemberProfile {
  pubkey   : string //
  shareKey : string // ECDH(pubkey, this.pubkey)
  claimKey : string // wallet.fromSeed(sharekey)
}

// A member profile must contain all identifying
// information nessecary for completing a contract.

// More pertinent information (like payment addresses)
