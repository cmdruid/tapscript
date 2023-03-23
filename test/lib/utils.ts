import KeyLink from '@cmdcode/keylink'

export interface WalletDescriptor {
  desc      : string
  timestamp : number
  active    : boolean
  internal  : boolean
  range     : number[]
  next      : number
}

export interface WalletInterface {
  type      : string
  timestamp : number
  range     : number[]
  keypair   : KeyLink
  marker    : string
}

const DESC_REGEX = /^(?<type>\w+\()+(?<xkey>\w+)(?<path>\/[0-9'/]+)(\*\)+#)(?<marker>\w+)$/

export async function parseDescriptor (
  descriptor : WalletDescriptor
) : Promise<WalletInterface | undefined> {
  const { desc, active, next, ...rest } = descriptor
  const matches = desc.match(DESC_REGEX)

  if (!active || matches === null) return

  const { type, xkey, path, marker } = matches.groups ?? {}

  return {
    ...rest,
    marker,
    type    : type.replace('(', ''),
    keypair : await KeyLink.fromBase58(xkey).getPath('m' + path + String(next))
  }
}
