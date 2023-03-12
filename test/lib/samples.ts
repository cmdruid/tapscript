/**
 * Example of using RPC and CMD library to communicate with Bitcoin Core.
 */

import rpc  from './rpc.js'
import call from './cmd.js'

const rpc_result = await rpc('getblockchaininfo')

const cmd_result = await call('bitcoin-cli', '-regtest', 'getblockchaininfo')

console.log(rpc_result)

console.log(cmd_result)

