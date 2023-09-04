import { ADDR_TYPES } from './const.js'
import { ADDR_TOOLS } from './tool.js'

import { parse_scriptkey } from '../script/parse.js'

import {
  AddressData,
  Network,
  ScriptData
} from '../../types/index.js'

export function parse_address (address : string) : AddressData {
  for (const row of ADDR_TYPES) {
    const [ type, prefix, network, size ] = row
    if (address.startsWith(prefix)) {
      const tool = ADDR_TOOLS[type]
      const addr = tool.decode(address, network)
      if (addr.key.length === size) {
        return addr
      }
    }
  }
  throw new Error('Unable to parse address: ' + address)
}

export function from_script (
  script   : ScriptData,
  network ?: Network
) : string {
  const { type, key, hex } = parse_scriptkey(script)
  if (type !== 'raw') {
    const tool = ADDR_TOOLS[type]
    return tool.encode(key, network)
  }
  throw new Error('Unrecognized script format: ' + hex)
}
