import { Buff, Bytes, Json } from '@cmdcode/buff-utils'
import { SecretKey }         from '@cmdcode/crypto-utils'
import KeyLink               from '@cmdcode/keylink'
import { spawn }             from 'child_process'
import { UTXO }              from './schema.js'
import { Address, TxData }            from '../../src/index.js'

import {
  CoreDescriptor,
  KeyDescriptor,
  KeyFilter,
  getKeys,
  getBaseDescriptor
} from './descriptors.js'

export interface WalletInfo {
  wallet_name : string
  descriptors : CoreDescriptor[]
}

interface CliConfig {
  wallet  ?: string
  seckey  ?: Bytes
  cmdpath ?: string
  network ?: string
}

const DEFAULT_SORTER   = () => Math.random() > 0.5 ? 1 : -1
const DEFAULT_TEMPLATE = { version : 2, vin : [], vout : [], locktime : 0 }

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

  get newaddress () : Promise<string> {
    return this.call('getnewaddress')
  }

  get xprvs () : Promise<CoreDescriptor[]> {
    return this.call<WalletInfo>('listdescriptors', 'true').then(e => e.descriptors)
  }

  get xpubs () : Promise<CoreDescriptor[]> {
    return this.call<WalletInfo>('listdescriptors').then(e => e.descriptors)
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
      console.log(params)
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
        try {
          resolve(JSON.parse(blob))
        } catch { 
          resolve(blob.replace('\n', '') as T) 
        }
      })
    })
  }

  async getKeys (
    filters : KeyFilter = {}
  ) : Promise<KeyDescriptor[]> {
    const { secret, ...filter } = filters
    const descriptors = (secret === true) 
      ? await this.xprvs
      : await this.xpubs
    return getKeys(descriptors, filter)
  }

  async getKey (
    filters : KeyFilter = {}
  ) : Promise<KeyDescriptor | undefined> {
    const { secret, ...filter } = filters
    const descriptors = (secret === true) 
      ? await this.xprvs 
      : await this.xpubs
    const keys = await getKeys(descriptors, filter)
    return (keys.length > 0) ? keys[0] : undefined
  }

  async getSigner (
    descriptor : string
  ) : Promise<SecretKey | undefined> {
    let pubdesc = getBaseDescriptor(descriptor)

    if (pubdesc !== undefined) {
      const { key, marker, purpose, cointype, fullpath } = pubdesc
      const seckey = await this.getKey({ marker, purpose, cointype, secret : true })
      console.log(seckey)
      if (seckey !== undefined) {
        const signer = await KeyLink.fromBase58(seckey.key).getPath(fullpath)
        if (
          signer.pubkey.hex === key &&
          signer.seckey !== undefined
        ) {
          return new SecretKey(signer.seckey)
        }
      }
    }
    return undefined
  }

  async getBalance() : Promise<number> {
    const bal : number = await this.call('getbalance')
    return bal * 100000000
  }

  async generateFunds(address ?: string, blocks = 110) : Promise<void> {
    if (address === undefined) address = await this.newaddress
    return this.call('generatetoaddress', [ blocks, address ])
  }

  async checkFunds (amount = 10000) {
    const balance = await this.getBalance()
    if (balance < amount) {
      if (this.network === 'regtest') {
        await this.generateFunds()
        return this.checkFunds(amount)
      }
      throw new Error('Insufficient funds: ' + String(balance))
    }
  }

  async getUTXOs(
    amount = 10_000, 
    coinsorter = DEFAULT_SORTER
  ) : Promise<UTXO[]> {
    const utxos = await this.call<UTXO[]>('listunspent')
    const selected : UTXO[] = []

    let total = 0
    let backup : UTXO | undefined = undefined

    utxos.sort(coinsorter)

    for (const utxo of utxos) {
      const sats = utxo.amount * 100_000_000
      if (total >= amount) {
        return selected
      }
      if (sats <= amount) {
        utxo.signer = await this.getSigner(utxo.desc)
        total += sats
        selected.push(utxo)
      } else if (backup === undefined) {
        backup = utxo
      }
    }
    if (backup !== undefined) {
      backup.signer = await this.getSigner(backup.desc)
      selected.push(backup)
      return selected
    }
    throw new Error('Insufficient funds!')
  }

  async fundAddress (
    address  : string, 
    amount   : number  = 10_000,
    fee      : number  = 1000,
    template : TxData  = DEFAULT_TEMPLATE
  ) {
    
    const utxos = await this.getUTXOs(amount + fee)
    const total = utxos.reduce((prev, curr) => curr.amount + prev, 0)
    const scriptPubKey = Address.toScriptPubKey(address)

    template.vout.push({ value : amount, scriptPubKey })

    template.vout.push({
      value : total - amount - fee,
      scriptPubKey : Address.toScriptPubKey(await this.newaddress)
    })

    for (const utxo of utxos) {
      const { txid, vout, amount: value, scriptPubKey, signer } = utxo
      const prevout = { value, scriptPubKey, signer }
      const witness = [ utxo.signer?.pub.hex, utxo.signer?.sign() ]
      template.vin.push({ txid, vout, prevout})
    }
    return template
  }
}
