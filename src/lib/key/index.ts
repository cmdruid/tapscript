interface ScriptKey {
  addr : (network : string) => string
  asm  : string[]
  hex  : string
  key  : string
  len  : number
  type : 'p2pk' | 'p2pkh' | 'p2sh' | 'p2wpkh' | 'p2wsh' | 'p2tr' | 'custom'
}

interface RedeemScript {

}

interface WitnessData {

}
