import { ADDR_TYPES }   from './const.js'
import { ADDR_TOOLS }   from './tools.js'
import { parse_script } from '../script/parse.js'

import {
  AddressData,
  Network,
  ScriptData
} from '../../types/index.js'

const tools = ADDR_TOOLS

export function parse_addr (address : string) : AddressData {
  for (const row of ADDR_TYPES) {
    const [ type, prefix, network, size ] = row
    if (address.startsWith(prefix)) {
      const tool = tools[type]
      const addr = tool.decode(address, network)
      if (addr.key.length / 2 === size) {
        return addr
      }
    }
  }
  throw new Error('Unable to parse address: ' + address)
}

export function create_addr (
  script   : ScriptData,
  network ?: Network
) : string {
  console.log('tools:', ADDR_TOOLS)
  const { type, key, hex } = parse_script(script)
  if (type !== 'raw') {
    const tool = tools[type]
    if (tool === undefined) {
      throw new Error('Unable to find parser for address type: ' + type)
    }
    return tool.encode(key, network)
  }
  throw new Error('Unrecognized script format: ' + hex)
}
