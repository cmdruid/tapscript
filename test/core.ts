import {
  CoreConfig,
  CoreDaemon,
  CoreWallet
} from '@cmdcode/core-cmd'

import { assert }         from '@cmdcode/tapscript'
import { create_prevout } from '@cmdcode/tapscript/tx'

const DEFAULT_CONFIG = {
  core_params : [ '-txindex' ],
  corepath    : 'test/bin/bitcoind',
  clipath     : 'test/bin/bitcoin-cli',
  confpath    : 'test/bitcoin.conf',
  datapath    : 'test/data',
  network     : 'regtest',
  isolated    : true,
  debug       : false,
  verbose     : false
}

let daemon : CoreDaemon | null = null

export function get_daemon (
  config : Partial<CoreConfig> = DEFAULT_CONFIG
) : CoreDaemon {
  if (daemon === null) {
    daemon = new CoreDaemon(config)
  }
  return daemon
}

export async function get_utxo (
  address  : string,
  amount   : number,
  wallet   : CoreWallet,
  confirm ?: boolean
) {
  await wallet.ensure_funds(amount)
  const txid = await wallet.send_funds(amount, address, confirm)
  const tx   = await wallet.client.get_tx(txid)
  assert.ok(tx !== null, 'tx not found')
  const vout = tx.vout.findIndex(txo => txo.scriptPubKey.address === address)
  assert.ok(vout !== -1, 'tx output not found')
  const { value, scriptPubKey } = tx.vout[vout]
  const prevout = { value, scriptPubKey: scriptPubKey.hex }
  return create_prevout({ txid, vout, prevout })
}
