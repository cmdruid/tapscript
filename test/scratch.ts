import { Buff } from '@cmdcode/buff'
import { Address } from '@cmdcode/tapscript'
import p2tr from 'src/lib/addr/p2tr.js'
import p2wpkh from 'src/lib/addr/p2wpkh.js'

const pubkey = Buff.random(32)

const address = p2tr.create(pubkey.hex)
const decode = Address.parse_addr(address).hex


console.log('script:', decode)

