export type TapKey = [
  key    : string,
  parity : number
]

export type TapTree = Array<string | string[]>

export type TapRoot  = [
  root   : string,
  target : string | null,
  path   : string[]
]
