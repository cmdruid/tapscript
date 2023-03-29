import KeyLink       from '@cmdcode/keylink'
import { Buff } from '@cmdcode/buff-utils'
import { SecretKey } from '@cmdcode/crypto-utils'
import { CLI, WalletInfo }       from '../lib/cli.js'
import { WalletDescriptor } from '../lib/descriptors.js'

const alice = new CLI({ wallet: 'alice' })

const template = await alice.getTxTemplate()

console.dir(template, { depth: null })
