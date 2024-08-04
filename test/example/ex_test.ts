import { Test } from 'tape'
import { key_spend }    from './taproot/keyspend.test.js'
import { script_spend } from './taproot/tapscript.test.js'
import { tree_spend }   from './taproot/taptree.test.js'
import { inscription }  from './taproot/inscribe.test.js'
import { get_client }   from '../core.js'

const client = await get_client()
const wallet = await client.load_wallet('test')

await wallet.ensure_funds(1_000_000)

export default async function example_tests (t : Test) : Promise<void> {
  t.test('Example Tests', async t => {
    await key_spend(t, wallet)
    await script_spend(t, wallet)
    await tree_spend(t, wallet)
    await inscription(t, wallet)
  })

  t.teardown(() => client.core.shutdown())
}
