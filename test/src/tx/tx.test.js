// TODO: Implement more test vectors.
// https://github.com/bitcoin/bips/blob/master/bip-0143.mediawiki

import { readdir } from 'node:fs/promises'
import { join }    from 'path'
import { Buff }    from '@cmdcode/buff-utils'

import { TX } from '../../../src/index.js'

export default function(t) {
  t.test('Testing against Transaction vectors.', async t => {
    const vectors = await loadVectors('./vectors')

    t.plan(vectors.length * 2)

    for (const vector of vectors) {
      const txvec = vector.tx
      const txobj = new TX.Transaction(txvec.hex)
      
      t.deepEqual(await txobj.export(), txvec, 'tx objects should be equal.')

      const { idx, prevAmt, script, sigflag, hash } = vector.sign.sigHash
      const sighash = await txobj.sighash(idx, prevAmt, script, sigflag)

      t.equal(Buff.buff(sighash).toHex(), hash, 'signature hashes should be equal.')   
    }
  })
}

async function loadVectors(relpath) {
  const vectors = []
  const options = { assert: { type: "json" } }
  const path    = new URL(relpath, import.meta.url).pathname
  const files   = await readdir(path)
  
  for (const file of files) {
    const vector = await import(join(path, file), options)
    vectors.push(vector.default)
  }

  return vectors
}
