// https://jlopp.github.io/bitcoin-core-rpc-auth-generator

import { Buff } from '@cmdcode/buff-utils'

import {
  WALLET_METHODS,
  WalletConfig,
   WalletResponse
} from './schema.js'

interface RpcConfig {
  user    ?: string
  pass    ?: string
  wallet  ?: string
  host    ?: string
  port    ?: number
}

export class RPC {
  readonly _auth : string

  wallet  : string
  host    : string
  port    : number

  constructor ({
    user   = 'regtest',          // RPC-Auth Username.
    pass   = 'password',         // RPC-Auth Password.
    wallet = 'regtest',          // Default wallet to use.
    host   = 'http://127.0.0.1', // URL to your Bitcoin node.
    port   = 18443               // Port to your RPC interface.
  } : RpcConfig = {}
) {
    const authString = user + ':' + pass
    this._auth   = Buff.str(authString).base64
    this.wallet  = wallet
    this.host    = host
    this.port    = port

    void this.checkWallet(this.wallet)
  }

  async call<T = Record<string, any>> (
    method  : string,
    args    : any[] | Record<string, any> = [],
    wallet ?: string
  ) : Promise<T> {
    /** Send a JSON-RPC call to the configured server. */
    const isWalletMethod = WALLET_METHODS.includes(method)

    if (typeof args !== 'object') {
      // Convert objects into a named arg array.
      args = [ args ]
    }

    if (typeof wallet === 'string' && !isWalletMethod) {
      // If a wallet is specified, ensure that the wallet file
      // exists and is loaded, then configure the url endpoint.
      await this.checkWallet(wallet)
      wallet = 'wallet/' + wallet
    }

    // Confgigure our request object.
    const request = {
      method  : 'POST',
      headers : {
        Authorization  : 'Basic ' + this._auth,
        'content-type' : 'application/json'
      },
      body: JSON.stringify({
        jsonrpc : '1.0',
        id      : Buff.random(16).hex,
        method,
        params  : args
      })
    }

    console.log(request)

    // Fetch a response from our node.
    const fullurl  = `${this.host}:${this.port}/${wallet ?? ''}`
    const response = await fetch(fullurl, request)

    // If the response fails, throw an error.
    if (!response.ok) {
      throw new Error(`Request for '${method}' failed with status ${response.status}: ${response.statusText}`)
    }

    // Convert our response to json.
    const { result, error } = await response.json()

    // If the RPC call has an error, unpack and throw the error.
    if (error !== null) {
      const { code, message } = error
      if (code === -1) {
        throw new Error(`RPC command ${method} failed with syntax error. Please check your arguments.`)
      } else { throw new Error(`RPC command ${method} failed with error: ${String(message)}`) }
    }

    return result
  }

  async checkWallet (wallet : string) : Promise<void> {
    /** Ensure that the specified wallet is loaded for
     *  the bitcoin-core node and available to access.
     * */
    const isLoaded : boolean = await this.call('listwallets')
      .then((wallets) => Array.isArray(wallets) && wallets.includes(wallet))

    if (isLoaded) return

    const isExists : boolean = await this.call('listwalletdir')
      .then((res) => res.wallets.find((el : any) => el.name === wallet))

    if (!isExists) {
      // If wallet does not exist, throw error.
      return this.createWallet(wallet)
    }

    return this.call<WalletResponse>('loadwallet', [ wallet ])
      .then((res) => {
        if (res.warning !== '' || res.name !== wallet) {
          // If there was a problem with loading, throw error.
          throw new Error(`Wallet failed to load cleanly: ${JSON.stringify(res, null, 2)}`)
        }
      })
  }

  async createWallet (
    walletName : string,
    config : WalletConfig = {}
  ) : Promise<void> {
    const payload = { wallet_name: walletName, ...config }
    const res = await this.call<WalletResponse>('createwallet', payload)
    if (res.warning !== '' || res.name !== walletName) {
      // If there was a problem with loading, throw error.
      throw new Error(`Wallet failed to create: ${JSON.stringify(res, null, 2)}`)
    }
  }
}
