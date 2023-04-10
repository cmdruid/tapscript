import { Test } from 'tape'
import { key_spend }    from './taproot/keyspend.test.js'
import { script_spend } from './taproot/tapscript.test.js'
import { tree_spend }   from './taproot/taptree.test.js'
import { inscription }  from './taproot/inscribe.test.js'

export default async function example_tests (t : Test) : Promise<void> {
  t.test('Example Tests', async t => {
    await key_spend(t)
    await script_spend(t)
    await tree_spend(t)
    await inscription(t)
  })
}