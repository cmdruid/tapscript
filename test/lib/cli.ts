import { Buff, Bytes, Json } from '@cmdcode/buff-utils'
// import KeyLink         from '@cmdcode/keylink'
import { spawn }       from 'child_process'

import { WalletDescriptor, parseDescriptor, WalletInterface } from './utils.js'

interface WalletInfo {
  wallet_name : string
  descriptors : WalletDescriptor[]
}

interface CliConfig {
  wallet  ?: string
  seckey  ?: Bytes
  cmdpath ?: string
  network ?: string
}

export class CLI {
  wallet ?: string
  seckey ?: Uint8Array
  cmdpath : string
  network : string

  constructor ({
    wallet,
    seckey,
    cmdpath = 'bitcoin-cli',
    network = 'regtest'
  } : CliConfig = {}) {
    if (seckey !== undefined) seckey = Buff.bytes(seckey)
    this.wallet  = wallet
    this.seckey  = seckey
    this.cmdpath = cmdpath
    this.network = network
  }

  get descriptors () : Promise<WalletInfo> {
    return this.call('listdescriptors', 'true')
  }

  async call<T = Json> (
    method : string,
    args  ?: string | string[] | Record<string, any>
  ) : Promise<T> {
    const params = [ `-chain=${this.network}` ]

    if (this.wallet !== undefined) {
      params.push(`-rpcwallet=${this.wallet}`)
    }

    params.push(method)

    if (typeof args === 'object') {
      if (Array.isArray(args)) {
        params.push(...args)
      } else {
        params.push('-named')
        for (const [ k, v ] of Object.entries(args)) {
          params.push(`${k}=${String(v)}`)
        }
      }
    } else {
      if (args !== undefined) params.push(args)
    }

    return new Promise((resolve, reject) => {
      console.log(this.cmdpath, params)
      const proc = spawn(this.cmdpath, params)

      let blob = ''

      proc.stdout.on('data', data => {
        blob += String(data.toString())
      })

      proc.stderr.on('data', data => {
        reject(new Error(data.toString()))
      })

      proc.on('error', err => {
        reject(err)
      })

      proc.on('close', code => {
        if (code !== 0) reject(new Error(`code: ${String(code)}`))
        resolve(JSON.parse(blob))
      })
    })
  }

  async getKeys () : Promise<Record<string, WalletInterface>> {
    const wallets : Record<string, WalletInterface> = {}
    const { descriptors } = await this.descriptors

    for (const d of descriptors) {
      const parsed = await parseDescriptor(d)
      if (parsed !== undefined) wallets[parsed.marker] = parsed
    }

    return wallets
  }
}
