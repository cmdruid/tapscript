import { Buff } from '@cmdcode/buff-utils'
import KeyLink  from '@cmdcode/keylink'

export interface CoreDescriptor {
  desc      : string
  timestamp : number
  active    : boolean
  internal  : boolean
  range     : number[]
  next      : number
}

export interface BaseDescriptor {
  key        : string
  isExtended : boolean
  isParent   : boolean
  isPrivate  : boolean
  checksum   : string
  relpath    : string
  fullpath   : string
  marker     : string
  keytype    : string
  purpose    : number
  cointype   : number
  account    : number
  sub        : number
}

export interface KeyDescriptor extends BaseDescriptor {
  link      : KeyLink
  timestamp : number
  internal  : boolean
  range     : number[]
  tip       : number
  next      : () => Promise<KeyLink>
}

export interface KeyFilter {
  secret     ?: boolean
  type       ?: string
  relpath    ?: string
  fullpath   ?: string
  isPrivate  ?: boolean
  isParent   ?: boolean
  isExtended ?: boolean
  purpose    ?: number
  cointype   ?: number
  account    ?: number
  sub        ?: number
  index      ?: number
  timestamp  ?: number
  range      ?: number[]
  marker     ?: string
}

const DESC_REGEX = /^(?<type>\w+\()+(\[(?<parent_print>[0-9a-fA-F]+)(?<parent_path>[0-9\/\']+)\])*(?<key>\w+)+((?<path>\/[0-9'\/]+)(\/\*)*)*\)+#(?<checksum>\w+)$/

export async function getKeyDescriptor (
  descriptor : CoreDescriptor
) : Promise<KeyDescriptor | undefined> {
  const { desc, active, next, ...rest } = descriptor

  if (!active) return

  const base = getBaseDescriptor(desc)

  if (base === undefined || !base.isExtended) return

  const idx = String(next)

  let link  = KeyLink.fromBase58(base.key)

  link = (base.isParent)
    ? await link.getPath(base.fullpath)
    : await link.getPath(base.relpath)

  return {
    ...rest,
    ...base,
    link,
    tip  : next,
    next : () => {
      return link.getSecIndex(next)
    }
  }
}

export function getBaseDescriptor (
  descriptor : string
) : BaseDescriptor | undefined {
  const matches = descriptor.match(DESC_REGEX)

  if (matches === null) return

  const { type, key, path, parent_path,  parent_print, checksum } = matches.groups ?? {}

  const isParent   = (parent_print === undefined)
  const isExtended = (key.startsWith('x') || key.startsWith('t'))

  let relpath  = '', fullpath = ''

  if (parent_path !== undefined) {
    fullpath += parent_path
  }

  if (path !== undefined) {
    relpath  += path
    fullpath += path
  }

  let pathdata = fullpath.split('/')

  if (pathdata[0] === '') {
    pathdata = pathdata.slice(1)
  }

  if (pathdata.length < 4) {
    throw new Error('Full path is invalid.')
  }

  const [ purpose, cointype, account, sub ] = pathdata

  let marker = (isExtended && isParent)
    ? Buff.num(KeyLink.fromBase58(key).getMarker()).hex
    : parent_print

  return {
    key,
    checksum,
    relpath,
    fullpath,
    marker,
    isParent,
    isExtended,
    isPrivate : (key.startsWith('xprv') || key.startsWith('tprv')),
    keytype   : type.replace('(', ''),
    purpose   : parseInt(purpose.replace('\'', '')),
    cointype  : parseInt(cointype.replace('\'', '')),
    account   : parseInt(account.replace('\'', '')),
    sub       : parseInt(sub.replace('\'', '')),
  }
}

function filterKeys (
  descriptors  : KeyDescriptor, 
  filters      : KeyFilter = {}
) : boolean {
  for (const [ sk, sv ] of Object.entries(filters)) {
    if (descriptors[sk] !== sv) return false
  }
  return true
}

export async function getKeys (
    descriptors : CoreDescriptor[],
    filters     : KeyFilter = {}
  ) : Promise<KeyDescriptor[]> {
    const keys : KeyDescriptor[] = []
    for (const desc of descriptors) {
      const key = await getKeyDescriptor(desc)
      if (key !== undefined) {
        if (filterKeys(key, filters)) {
          keys.push(key)
        }
      }
    }
    return keys
  }
