import KeyLink       from '@cmdcode/keylink'
import { SecretKey } from '@cmdcode/crypto-utils'
import { CLI }       from '../lib/cli.js'

const alice = new CLI({ wallet: 'alice' })

const key = (await alice.getKeys())['6w3em305'].keypair

if (key.seckey !== undefined) {
  const seckey = new SecretKey(key.seckey)
  console.log(seckey)
}
