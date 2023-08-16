import { ScriptEnum } from '../../schema/index.js'

export const SCRIPT_TYPES : Array<[ ScriptEnum, RegExp ]> = [
  [ 'p2pkh',   /^76a914(?<hash>\w{40})88ac$/ ],
  [ 'p2sh',    /^a914(?<hash>\w{40})87$/     ],
  [ 'p2w-pkh', /^0014(?<hash>\w{40})$/       ],
  [ 'p2w-sh',  /^0020(?<hash>\w{64})$/       ],
  [ 'p2tr',    /^5120(?<hash>\w{64})$/       ]
]
