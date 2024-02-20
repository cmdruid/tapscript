import { Buff } from '@cmdcode/buff-utils'
import { util } from '@cmdcode/crypto-utils'
import fs       from 'fs/promises'
import { URL }  from 'url'
import { Tx }   from '../src/index.js'

const txtpath = new URL('./txhex.txt', import.meta.url).pathname
const txtdata = await fs.readFile(txtpath) //.then(e => new Uint8Array(e))

const tx1 = Tx.decode(txtdata.toString())

console.log(tx1)
// const tx2 = Tx.encode(tx1)
// console.log(tx2.hex)
// const tx3 = Tx.decode(tx2)
// console.log(tx3)