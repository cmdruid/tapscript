import fs       from 'fs/promises'
import { URL }  from 'url'
import { Script, Tx }   from '../src/index.js'

const txtpath = new URL('./txhex.txt', import.meta.url).pathname
const txtdata = await fs.readFile(txtpath) //.then(e => new Uint8Array(e))

const scriptAsHexString = '4e21032cf515e2ae74b6d639c4e91a0b2a7047a0178e628d167989af46d1da474a6951ad21022d6b369d9a95568203b2a51eac49cc8b20ab81930e2d2565df5f0bc8e3bf59d5ac73640380ca00b268'

const script = Script.decode(scriptAsHexString, true)

console.log(script)

//const tx1 = Tx.decode(txtdata.toString())
//console.dir(tx1, { depth : null })
