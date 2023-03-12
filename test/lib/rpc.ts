import { webcrypto as crypto } from 'crypto'

interface RpcConfig {
  user   ?: string
  pass   ?: string
  wallet ?: string
  host   ?: string
  port   ?: number
}

const DEFAULT_CONFIG = {
  user : 'bitcoin',    // RPC-Auth Username
  pass : 'regtest',    // RPC-Auth Password
  host : '127.0.0.1',  // URL to your Bitcoin node.
  port : 18443         // Port to your RPC interface.
}

const WALLET_METHODS = [
  'listwallets',
  'listwalletdir',
  'loadwallet'
]

export default async function rpc (
  method : string,
  args   : any[] = [],
  config : RpcConfig = DEFAULT_CONFIG
) {
  /** Send a JSON-RPC call to the configured server. */

  // Random identifer for our request.
  const requestId = Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString('hex')

  // Authorization string for our request.
  const authString = Buffer.from(config.user + ':' + config.pass).toString('base64')

  const isWalletMethod = WALLET_METHODS.includes(method)

  // Make sure our args are in an array.
  args = (Array.isArray(args)) ? args : [ args ]

  try {

    let wallet = ''

    if (config.wallet && !isWalletMethod) {
      // If a wallet is specified, ensure that the wallet file
      // exists and is loaded, then configure the url endpoint.
      await checkWallet(config.wallet)
      wallet = 'wallet/' + config.wallet
    }

    // Confgigure our request object.
    const request = {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + authString,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        "jsonrpc": "1.0",
        "id": requestId,
        "method": method,
        "params": args
      })
    }

    // Fetch a response from our node.
    const fullurl  = `http://${config.host}:${config.port}/${wallet}`
    const response = await fetch(fullurl, request)

    // If the response fails, throw an error.
    if (!response.ok) {
      throw `Request for '${method}' failed with status ${response.status}: ${response.statusText}`
    }

    // Convert our response to json.
    const json = await response.json()
    const { result, error } = json

    // If the RPC call has an error, unpack and throw the error.
    if (error) {
      const { code, message } = error
      if (code === -1) {
        throw `RPC command ${method} failed with syntax error. Please check your arguments.`
      } else { throw `RPC command ${method} failed with error: ${message}` }
    }

    return result

  } catch (err) { throw err }
}

async function isWalletLoaded (
  walletName : string
) : Promise<boolean> {
  /** Check if the specified wallet is loaded
   *  within the bitcoin-core node.
   * */
  return rpc('listwallets')
    .then((wallets) => Array.isArray(wallets) && wallets.includes(walletName))
}

async function doesWalletExist (
  walletName : string
) : Promise<boolean> {
  /** Check if the specified wallet exists within 
   *  the host filesystem for bitcoin-core.
   * */
  return rpc('listwalletdir')
    .then(({ wallets }) => wallets.find((el : any) => el.name === walletName))
}

async function checkWallet (walletName : string) : Promise<void> {
  /** Ensure that the specified wallet is loaded for 
   *  the bitcoin-core node and available to access.
   * */

  if (await isWalletLoaded (walletName)) {
    // If wallet is already loaded, return.
    return
  }

  if (!(await doesWalletExist (walletName))) {
    // If wallet does not exist, throw error.
    throw 'Wallet file does not exist!'
  }

  return rpc ('loadwallet', [ walletName ])
    .then(({ name, warning }) => {
      if (warning || name !== walletName) {
        // If there was a problem with loading, throw error.
        throw `Wallet failed to load cleanly: ${warning}`
      }
      return
    })
}
