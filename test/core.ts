import { CoreClient, CoreConfig, CoreDaemon } from '@cmdcode/core-cmd'

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

export function get_client (
  config : Partial<CoreConfig> = DEFAULT_CONFIG
) : Promise<CoreClient> {
  if (daemon === null) {
    daemon = new CoreDaemon(config)
  }
  return daemon.startup()
}
